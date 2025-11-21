/**
 * Job Progress Toast Component
 * Displays real-time job progress and results
 */

'use client';

import { useEffect } from 'react';
import { useBackgroundJobs } from '@/hooks/use-background-jobs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface JobProgressNotificationsProps {
    userId: string;
    authToken?: string;
}

export function JobProgressNotifications({ userId, authToken }: JobProgressNotificationsProps) {
    const { toast } = useToast();

    const { jobs, connected, cancelJob } = useBackgroundJobs({
        userId,
        authToken,
        onProgress: (jobId, progress) => {
            toast({
                title: '⚡ Processing...',
                description: (
                    <div className="space-y-2">
                        <p className="text-sm">{progress.message}</p>
                        <Progress value={progress.percent} className="h-2" />
                        <p className="text-xs text-muted-foreground">{progress.percent}% complete</p>
                    </div>
                ),
                duration: 3000,
            });
        },
        onComplete: (jobId, result) => {
            toast({
                title: '✅ Job Completed!',
                description: (
                    <div className="space-y-2">
                        <p className="text-sm">Your task has been completed successfully.</p>
                        <Button
                            size="sm"
                            onClick={() => {
                                // Navigate to results or display inline
                                console.log('View result:', result);
                            }}
                        >
                            View Result
                        </Button>
                    </div>
                ),
                duration: 10000,
            });
        },
        onError: (jobId, error) => {
            toast({
                variant: 'destructive',
                title: '❌ Job Failed',
                description: error,
                duration: 10000,
            });
        },
    });

    // Display active jobs
    return (
        <div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50">
            {jobs
                .filter((job) => job.status === 'processing' || job.status === 'queued')
                .map((job) => (
                    <div
                        key={job.jobId}
                        className="bg-card border rounded-lg p-4 shadow-lg space-y-3"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm font-medium">Processing...</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelJob(job.jobId)}
                                className="h-6 text-xs"
                            >
                                Cancel
                            </Button>
                        </div>

                        {job.progress && (
                            <>
                                <p className="text-xs text-muted-foreground">{job.progress.message}</p>
                                <Progress value={job.progress.percent} className="h-2" />
                                <p className="text-xs text-right text-muted-foreground">
                                    {job.progress.percent}%
                                </p>
                            </>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                            <div
                                className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                            />
                            <span className="text-muted-foreground">
                                {connected ? 'Real-time updates' : 'Polling for updates'}
                            </span>
                        </div>
                    </div>
                ))}
        </div>
    );
}

// Example usage component
export function ExampleJobCreator() {
    const { createJob } = useBackgroundJobs({
        userId: 'user-123',
        authToken: 'your-jwt-token',
    });

    const handleOptimizeResume = async () => {
        const jobId = await createJob({
            type: 'resume-optimization',
            resumeText: 'Sample resume text...',
            targetRole: 'Full Stack Developer',
            industry: 'Technology',
            userId: 'user-123',
        });

        console.log('Job created:', jobId);
    };

    return (
        <Button onClick={handleOptimizeResume}>
            Optimize Resume (Background)
        </Button>
    );
}
