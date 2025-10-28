
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import 'webrtc-adapter';
import { Bot, Mic, PhoneOff, User, Loader2, Video, VideoOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/lib/use-firebase';
import { fetchProfile } from '@/lib/profile-service';
import type { UserProfile } from '@/lib/types';
import type { TranscriptItem } from '@/ai/schemas/ai-interviewer-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

type InterviewState = 'uninitialized' | 'configuring' | 'in_progress' | 'finished';
type AvatarType = 'HR' | 'Mentor' | 'Robot';

const AVATAR_IMAGES = {
    HR: 'https://cdn.d-id.com/avatars/fT47o6iKk2_SGS2A8m53I.png',
    Mentor: 'https://cdn.d-id.com/avatars/enhanced/o_jC4I2Aa0Cj8y0sBso_U.jpeg',
    Robot: 'https://cdn.d-id.com/avatars/enhanced/Cubs2gK3cDmF6xK2pGv01.jpeg',
};


export function AiInterviewerPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [interviewState, setInterviewState] = useState<InterviewState>('uninitialized');
  const [avatarType, setAvatarType] = useState<AvatarType>('HR');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const rtcPeerConnection = useRef<RTCPeerConnection | null>(null);
  const streamId = useRef<string | null>(null);
  const sessionId = useRef<string | null>(null);

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      if (user && db) {
        setLoadingProfile(true);
        try {
          const profileData = await fetchProfile(db, user.uid);
          setProfile(profileData || null);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Could not load profile' });
        }
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, db, toast]);
  
  // Setup user camera
  useEffect(() => {
    if (interviewState === 'in_progress' && !isCameraOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
            toast({variant: 'destructive', title: 'Camera access denied'});
            setIsCameraOff(true);
        });
    } else if (userVideoRef.current?.srcObject) {
        (userVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        userVideoRef.current.srcObject = null;
    }
  }, [interviewState, isCameraOff, toast]);

  const connect = async () => {
    if (rtcPeerConnection.current?.connectionState === 'connected') return;

    try {
        const sessionResponse = await fetch('https://api.d-id.com/talks/streams', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ source_url: AVATAR_IMAGES[avatarType] }),
        });
        const { id: newStreamId, session_id: newSessionId, offer, ice_servers } = await sessionResponse.json();
        streamId.current = newStreamId;
        sessionId.current = newSessionId;

        const pc = new RTCPeerConnection({ iceServers });
        pc.ontrack = (event) => {
            if (event.track.kind === 'video' && videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
        };
        rtcPeerConnection.current = pc;
        
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch(`https://api.d-id.com/talks/streams/${newStreamId}/sdp`, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer, session_id: newSessionId }),
        });
    } catch(e) {
        console.error('Connection error', e);
        handleEndInterview();
    }
  };

  const talk = async (text: string) => {
    if (rtcPeerConnection.current?.connectionState !== 'connected') {
        await connect();
    }
    
    await fetch(`https://api.d-id.com/talks/streams/${streamId.current}`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            script: { type: 'text', input: text },
            session_id: sessionId.current,
        }),
    });
  };

  const startInterview = async (userInput: string) => {
    if (!profile) {
      toast({ variant: 'destructive', title: 'Profile not loaded' });
      return;
    }
    
    setIsStarting(true);
    const newTranscript: TranscriptItem[] = [...transcript, { speaker: 'user', text: userInput, timestamp: new Date().toISOString() }];
    setTranscript(newTranscript);

    try {
        const response = await fetch('/api/ai-interviewer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userProfile: profile,
                jobDescription: 'Software Engineer at a top tech company.',
                transcript: newTranscript,
                avatarType,
            }),
        });

        if (!response.body) throw new Error('No response body');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                try {
                    const chunk = JSON.parse(line);
                    if (chunk.type === 'text') {
                        setTranscript(prev => [...prev, { speaker: 'ai', text: chunk.content, timestamp: new Date().toISOString() }]);
                        await talk(chunk.content);
                    }
                } catch (e) {
                    console.warn('Invalid JSON chunk', line);
                }
            }
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error during interview', description: error.message });
    } finally {
        setIsStarting(false);
    }
  };
  
  const handleInitialStart = async () => {
    setInterviewState('in_progress');
    const firstMessage = "Hello! I'm Alex, your AI interviewer for today. I see you're applying for a Software Engineer role. To start, could you tell me a bit about yourself and what interests you about this position?";
    setTranscript([{ speaker: 'ai', text: firstMessage, timestamp: new Date().toISOString() }]);
    await talk(firstMessage);
  }

  const handleEndInterview = () => {
    if (rtcPeerConnection.current) {
        rtcPeerConnection.current.close();
        rtcPeerConnection.current = null;
    }
     if (streamId.current && sessionId.current) {
      fetch(`https://api.d-id.com/talks/streams/${streamId.current}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId.current }),
      });
    }
    setInterviewState('finished');
    toast({ title: 'Interview Finished' });
  };
  
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('userInput') as HTMLInputElement;
    if (input.value.trim()) {
        startInterview(input.value.trim());
        input.value = '';
    }
  };


  if (interviewState !== 'in_progress') {
     return (
        <div className="p-4 md:p-8 flex flex-col items-center justify-center space-y-8 min-h-[calc(100vh-10rem)]">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-3 font-headline text-glow">
                    <Bot className="w-8 h-8 text-primary"/> AI Interviewer
                </h1>
                <p className="text-muted-foreground">Practice with a real-time, conversational AI avatar.</p>
            </motion.div>

            {interviewState === 'uninitialized' && (
                 <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Welcome!</CardTitle><CardDescription>{loadingProfile ? 'Loading your profile...' : (profile ? 'Get ready to practice.' : 'Please complete your profile first.')}</CardDescription></CardHeader>
                    <CardContent className="flex justify-center">
                        <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={() => setInterviewState('configuring')} disabled={loadingProfile || !profile}>Begin Setup</Button>
                    </CardContent>
                </Card>
            )}

            {interviewState === 'configuring' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Configure Your Avatar</CardTitle><CardDescription>Choose the persona of your interviewer.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <Select onValueChange={(v: AvatarType) => setAvatarType(v)} defaultValue={avatarType}>
                            <SelectTrigger><SelectValue placeholder="Select an avatar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HR">HR Professional</SelectItem>
                                <SelectItem value="Mentor">Senior Mentor</SelectItem>
                                <SelectItem value="Robot">Technical Bot</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="lg" className="w-full" onClick={handleInitialStart}>Start Interview</Button>
                    </CardContent>
                </Card>
            )}

            {interviewState === 'finished' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Interview Complete!</CardTitle></CardHeader>
                     <CardContent className="flex flex-col gap-4">
                       <p className="text-muted-foreground">The performance report feature is coming soon!</p>
                        <Button size="lg" className="flex-1" variant="outline" onClick={() => { setInterviewState('uninitialized'); setTranscript([]); }}>Start a New Interview</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full bg-black text-white p-4 gap-4">
        {/* Main View */}
        <div className="flex-1 flex flex-col bg-card rounded-2xl overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" poster={AVATAR_IMAGES[avatarType]}/>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="bg-white/10 hover:bg-white/20 rounded-full h-12 w-12"><Mic className={isMuted ? 'text-red-500' : ''}/></Button>
                    <Button variant="destructive" size="icon" onClick={handleEndInterview} className="rounded-full h-14 w-14"><PhoneOff/></Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsCameraOff(!isCameraOff)} className="bg-white/10 hover:bg-white/20 rounded-full h-12 w-12">{isCameraOff ? <VideoOff/> : <Video/>}</Button>
                </div>
            </div>
            {!isCameraOff && <video ref={userVideoRef} autoPlay playsInline className="absolute bottom-20 right-4 w-48 h-36 object-cover rounded-lg border-2 border-primary shadow-lg"/>}
        </div>

        {/* Transcript Sidebar */}
        <div className="w-96 bg-card rounded-2xl flex flex-col p-4">
            <h2 className="text-xl font-bold mb-4 font-headline text-glow">Live Transcript</h2>
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                    {transcript.map((item, index) => (
                        <div key={index} className={`flex gap-2 ${item.speaker === 'user' ? 'justify-end' : ''}`}>
                             {item.speaker === 'ai' && <Bot className="w-5 h-5 text-primary shrink-0"/>}
                             <div className={`max-w-xs p-3 rounded-xl ${item.speaker === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                                <p className="text-sm">{item.text}</p>
                             </div>
                             {item.speaker === 'user' && <User className="w-5 h-5 text-green-400 shrink-0"/>}
                        </div>
                    ))}
                    {isStarting && <Loader2 className="animate-spin mx-auto text-primary"/>}
                </div>
            </ScrollArea>
            <form onSubmit={handleUserSubmit} className="mt-4">
                 <div className="relative">
                    <input name="userInput" placeholder="Type your response..." className="w-full bg-secondary border-border rounded-lg p-3 pr-12 text-sm" disabled={isStarting}/>
                    <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" disabled={isStarting}>
                        <Send/>
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
}
