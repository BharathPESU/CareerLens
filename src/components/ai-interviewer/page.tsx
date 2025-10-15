'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Webcam, Mic, PhoneOff, Send, User, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import 'webrtc-adapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

type InterviewState = 'uninitialized' | 'configuring' | 'ready' | 'in_progress' | 'finished';
type Interviewer = 'male' | 'female';
type InterviewType = 'technical' | 'hr' | 'mixed';

export function AiInterviewerPage() {
  const [interviewState, setInterviewState] = useState<InterviewState>('uninitialized');
  const [interviewer, setInterviewer] = useState<Interviewer>('female');
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (interviewState === 'configuring') {
      const getCameraPermission = async () => {
        try {
          // Request both video and audio
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera/mic:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera & Mic Access Denied',
            description: 'Please enable camera and microphone permissions in your browser settings to use this feature.',
          });
           setInterviewState('uninitialized'); // Go back to the initial state
        }
      };

      getCameraPermission();
    } else if (interviewState === 'uninitialized' || interviewState === 'finished') {
       // Stop all media tracks when not in an active interview
       if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
       }
    }
  }, [interviewState, toast]);
  
  const startInterview = async () => {
    setInterviewState('in_progress');
    toast({
        title: 'Interview Started!',
        description: 'The AI will now start asking questions.'
    });
    // Here you would trigger the AI flow to get the first question
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 font-headline text-glow">
          <Bot className="w-8 h-8 text-primary"/> AI Interviewer
        </h1>
        <p className="text-muted-foreground">Practice your interviews with a hyper-realistic AI avatar.</p>
      </motion.div>

      {interviewState === 'uninitialized' && (
        <Card className="glass-card w-full max-w-lg">
            <CardHeader>
                <CardTitle>Welcome to the AI Interview Experience</CardTitle>
                <CardDescription>Get ready to practice and improve your interviewing skills in a realistic setting.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={() => setInterviewState('configuring')}>
                    Begin Setup
                </Button>
            </CardContent>
        </Card>
      )}

      {interviewState === 'configuring' && (
        <Card className="glass-card w-full max-w-lg">
            <CardHeader>
                <CardTitle>Configure Your Interview</CardTitle>
                <CardDescription>Choose your settings and grant camera/mic permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>1. Choose Interviewer</Label>
                    <RadioGroup defaultValue="female" onValueChange={(v) => setInterviewer(v as Interviewer)} className="flex gap-4">
                        <Label htmlFor="female" className="flex-1 p-4 border rounded-lg cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                            <RadioGroupItem value="female" id="female" className="sr-only" />
                            Female Avatar
                        </Label>
                        <Label htmlFor="male" className="flex-1 p-4 border rounded-lg cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                             <RadioGroupItem value="male" id="male" className="sr-only" />
                            Male Avatar
                        </Label>
                    </RadioGroup>
                </div>
                 <div className="space-y-2">
                    <Label>2. Select Interview Type</Label>
                    <RadioGroup defaultValue="mixed" onValueChange={(v) => setInterviewType(v as InterviewType)} className="grid grid-cols-3 gap-4">
                         <Label htmlFor="technical" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                            <RadioGroupItem value="technical" id="technical" className="sr-only" />
                            Technical
                        </Label>
                         <Label htmlFor="hr" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                             <RadioGroupItem value="hr" id="hr" className="sr-only" />
                            HR
                        </Label>
                         <Label htmlFor="mixed" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                             <RadioGroupItem value="mixed" id="mixed" className="sr-only" />
                            Mixed
                        </Label>
                    </RadioGroup>
                </div>
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {!hasCameraPermission && <div className="absolute text-center text-muted-foreground p-4"><Webcam className="w-8 h-8 mx-auto mb-2"/>Awaiting camera permission...</div>}
                </div>
                
                <Button size="lg" className="w-full" onClick={startInterview} disabled={!hasCameraPermission}>
                    Start Interview
                </Button>
            </CardContent>
        </Card>
      )}

      {(interviewState === 'in_progress' || interviewState === 'finished') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
            <div className="lg:col-span-2 space-y-4">
                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                    {/* This is where the Veo 3 avatar would be rendered */}
                    <div className="z-10 text-white text-center">
                        <Bot className="w-24 h-24 mx-auto mb-4"/>
                        <p>AI Avatar Video Stream</p>
                        <p className="text-sm text-muted-foreground">(Veo 3 will be integrated here)</p>
                    </div>
                </div>
                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                     <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                     {!hasCameraPermission && (
                        <Alert variant="destructive" className="absolute bottom-4 left-4 w-auto">
                            <Webcam className="h-4 w-4" />
                            <AlertTitle>Camera Not Found</AlertTitle>
                        </Alert>
                     )}
                </div>
            </div>
            <div className="space-y-4">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Live Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 overflow-y-auto space-y-4">
                        <div className="flex gap-3">
                            <Bot className="w-5 h-5 text-primary shrink-0"/>
                            <p className="text-sm">Welcome to your interview. Let's start with your background. Can you tell me about yourself?</p>
                        </div>
                         <div className="flex gap-3">
                            <User className="w-5 h-5 text-green-400 shrink-0"/>
                            <p className="text-sm text-muted-foreground">Sure, I'm a software developer with...</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" size="lg" className="w-full" onClick={() => setInterviewState('finished')}>
                            <PhoneOff className="mr-2"/>
                            End Interview
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
