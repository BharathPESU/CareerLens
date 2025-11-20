'use client';
import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Languages, Sparkles, Mic, MicOff, Video, VideoOff, X, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationItem {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function EnglishHelperPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Component State
  const [sessionState, setSessionState] = useState<'idle' | 'starting' | 'in_progress' | 'finished'>('idle');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);

  // Media & Permissions
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isAwaitingAI, setIsAwaitingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for media elements
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { transcript: speechTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // --- Effects ---

  useEffect(() => {
    // Attach video stream to video element
    if (stream && userVideoRef.current) {
      userVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Recovery mechanism: if we're in a session, not speaking, not awaiting AI, but not listening - restart
  useEffect(() => {
    if (sessionState === 'in_progress' && !isSpeaking && !isAwaitingAI && !listening && browserSupportsSpeechRecognition) {
      console.log('Recovery: Restarting listening...');
      const timer = setTimeout(() => {
        SpeechRecognition.startListening({ continuous: true })
          .then(() => console.log('Recovery listening started'))
          .catch(err => console.error('Recovery failed:', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionState, isSpeaking, isAwaitingAI, listening, browserSupportsSpeechRecognition]);

  // Auto-send after pause in speech
  useEffect(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }

    if (speechTranscript && listening && !isAwaitingAI && !isSpeaking && sessionState === 'in_progress') {
      console.log('Setting timeout for user response:', speechTranscript);
      speechTimeoutRef.current = setTimeout(() => {
        console.log('Timeout triggered, handling user response');
        handleUserResponse();
      }, 2000); // 2 seconds pause before sending
    }

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechTranscript, listening, isAwaitingAI, isSpeaking, sessionState]);

  // --- Core Functions ---

  const startSession = async () => {
    setSessionState('starting');
    // 1. Get Camera/Mic Permissions
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      setStream(mediaStream);
      setHasPermission(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'Camera and microphone access is required.' });
      setSessionState('idle');
      return;
    }

    // 2. Set state and get first greeting
    setSessionState('in_progress');
    setIsAwaitingAI(true);

    const response = await fetch('/api/english-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: '',
        conversationHistory: [],
        topic: 'daily',
        proficiency: 'intermediate'
      })
    });

    setIsAwaitingAI(false);

    if (response.ok) {
      const data = await response.json();
      console.log('Session started, first greeting:', data.aiResponse.substring(0, 50));
      setConversation([{ speaker: 'ai', text: data.aiResponse, timestamp: new Date().toISOString() }]);
      speak(data.aiResponse);
    } else {
      console.error('Failed to start session');
      toast({ variant: 'destructive', title: 'Could not start session.', description: 'Failed to connect to AI' });
      setSessionState('idle');
    }
  };

  const speak = (text: string, onEndCallback?: () => void) => {
    console.log('Speaking AI response:', text.substring(0, 50));
    // Stop listening while AI is speaking
    if (listening) {
      console.log('Stopping listening for AI speech');
      SpeechRecognition.stopListening();
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice properties
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('AI started speaking');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('AI finished speaking');
      setIsSpeaking(false);
      // Restart listening after AI finishes
      setTimeout(() => {
        if (onEndCallback) {
          console.log('Executing callback');
          onEndCallback();
        } else if (browserSupportsSpeechRecognition) {
          console.log('Restarting listening after AI speech');
          SpeechRecognition.startListening({ continuous: true })
            .then(() => console.log('Listening restarted successfully'))
            .catch(err => console.error('Failed to restart listening:', err));
        }
      }, 500);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e.error);
      setIsSpeaking(false);
      toast({
        variant: 'destructive',
        title: 'Text-to-Speech Error',
        description: `Could not play audio: ${e.error}`
      });
      // Still restart listening on error
      setTimeout(() => {
        if (onEndCallback) {
          onEndCallback();
        } else if (browserSupportsSpeechRecognition) {
          console.log('Restarting listening after error');
          SpeechRecognition.startListening({ continuous: true })
            .catch(err => console.error('Failed to restart listening:', err));
        }
      }, 500);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleUserResponse = async () => {
    console.log('handleUserResponse called');
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if (!speechTranscript.trim() || isAwaitingAI) {
      console.log('Skipping response - empty or already awaiting AI');
      return;
    }

    console.log('Stopping listening and processing user response:', speechTranscript);
    SpeechRecognition.stopListening();
    setIsAwaitingAI(true);

    const userResponseText = speechTranscript.trim();
    resetTranscript();

    const newConversation: ConversationItem[] = [...conversation, { speaker: 'user', text: userResponseText, timestamp: new Date().toISOString() }];
    setConversation(newConversation);

    console.log('Getting AI response with conversation length:', newConversation.length);

    const response = await fetch('/api/english-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: userResponseText,
        conversationHistory: newConversation,
        topic: 'daily',
        proficiency: 'intermediate'
      })
    });

    setIsAwaitingAI(false);

    if (response.ok) {
      const data = await response.json();
      console.log('AI response received:', data.aiResponse.substring(0, 50));
      setConversation(prev => [...prev, { speaker: 'ai', text: data.aiResponse, timestamp: new Date().toISOString() }]);
      speak(data.aiResponse);
    } else {
      console.error('AI response failed');
      toast({ variant: 'destructive', title: 'Error getting response', description: 'Failed to get AI response' });
      // If AI fails, restart listening
      setTimeout(() => {
        if (!listening && browserSupportsSpeechRecognition) {
          console.log('Restarting listening after error');
          SpeechRecognition.startListening({ continuous: true });
        }
      }, 500);
    }
  };

  // --- Control Handlers ---

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsCameraOff(!isCameraOff);
    }
  };

  const endSession = async () => {
    speechSynthesis.cancel();
    SpeechRecognition.stopListening();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setHasPermission(false);
    setSessionState('finished');
  };

  // --- Render Logic ---

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Browser Not Supported</AlertTitle>
          <AlertDescription>This feature requires a browser that supports the Web Speech API, like Google Chrome.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (sessionState === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-card border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/50"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 40px rgba(59, 130, 246, 0.8)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Languages className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-4xl font-bold font-headline bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                English Practice Studio
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Practice English conversation with AI in real-time.
                <br />
                Improve your speaking skills through natural conversation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold text-white mb-1">Real-Time</h4>
                  <p className="text-xs text-gray-400">Voice-activated responses</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-3xl mb-2">🧠</div>
                  <h4 className="font-semibold text-white mb-1">AI-Powered</h4>
                  <p className="text-xs text-gray-400">Natural conversations</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-semibold text-white mb-1">Practice</h4>
                  <p className="text-xs text-gray-400">Improve fluency</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/50 h-14 text-lg"
                  onClick={startSession}
                >
                  <Sparkles className="mr-2" />
                  Start Practice Session
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <Card className="glass-card border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
            <CardHeader className="text-center">
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-white">Session Complete!</CardTitle>
              <CardDescription className="text-gray-400">
                Great job! Here's your conversation transcript.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-2xl bg-black/40 p-6">
                <div className="space-y-4">
                  {conversation.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${item.speaker === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-purple-600/20 border border-purple-500/30'
                        }`}>
                        <p className="text-sm font-semibold text-white mb-1">
                          {item.speaker === 'user' ? 'You' : 'AI Teacher'}
                        </p>
                        <p className="text-white">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-6 flex gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/10"
                  onClick={() => { setSessionState('idle'); setConversation([]); }}
                >
                  Start New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Video Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* User Video */}
          <Card className="lg:col-span-1 glass-card border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-0 relative aspect-video bg-black/60">
              {stream && !isCameraOff ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-blue-600/80 text-white">You</Badge>
              </div>
              {listening && (
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="bg-red-500 rounded-full p-2"
                  >
                    <Mic className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation Display */}
          <Card className="lg:col-span-2 glass-card border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {conversation.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${item.speaker === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-purple-600/20 border border-purple-500/30'
                        }`}>
                        <p className="text-sm font-semibold text-white mb-1">
                          {item.speaker === 'user' ? 'You' : 'AI Teacher'}
                        </p>
                        <p className="text-white">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isAwaitingAI && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          <p className="text-white">AI is thinking...</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              {/* Current Speech Display */}
              {speechTranscript && listening && (
                <div className="mt-4 p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
                  <p className="text-sm text-blue-400 mb-1">You're saying:</p>
                  <p className="text-white">{speechTranscript}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Control Bar */}
        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant={isMuted ? 'destructive' : 'secondary'}
                className="rounded-full w-14 h-14"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <Button
                size="lg"
                variant={isCameraOff ? 'destructive' : 'secondary'}
                className="rounded-full w-14 h-14"
                onClick={toggleCamera}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </Button>
              {speechTranscript.trim() && !isAwaitingAI && !isSpeaking && (
                <Button
                  size="lg"
                  className="rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleUserResponse}
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-14 h-14 ml-auto"
                onClick={endSession}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            {listening && (
              <p className="text-center text-green-400 mt-4 flex items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
                Listening... (speak naturally, pause for 2 seconds to submit)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
