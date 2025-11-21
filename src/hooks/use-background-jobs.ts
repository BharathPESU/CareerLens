/**
 * React Hook for Background Jobs
 * Manages job creation, tracking, and real-time updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { JobStatusResponse, JobProgress, JobResult } from '@/lib/queue/config';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
const POLL_INTERVAL = 5000; // Fallback polling every 5 seconds

// ================================
// Types
// ================================

interface UseBackgroundJobOptions {
    userId: string;
    authToken?: string;
    onProgress?: (jobId: string, progress: JobProgress) => void;
    onComplete?: (jobId: string, result: JobResult) => void;
    onError?: (jobId: string, error: string) => void;
}

interface BackgroundJob {
    jobId: string;
    status: string;
    progress?: JobProgress;
    result?: JobResult;
    createdAt: number;
}

// ================================
// localStorage Helper
// ================================

const STORAGE_KEY = 'careerlens_active_jobs';

function getActiveJobs(): string[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveActiveJob(jobId: string): void {
    if (typeof window === 'undefined') return;
    const jobs = getActiveJobs();
    if (!jobs.includes(jobId)) {
        jobs.push(jobId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    }
}

function removeActiveJob(jobId: string): void {
    if (typeof window === 'undefined') return;
    const jobs = getActiveJobs().filter((id) => id !== jobId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

// ================================
// Custom Hook
// ================================

export function useBackgroundJobs(options: UseBackgroundJobOptions) {
    const { userId, authToken, onProgress, onComplete, onError } = options;

    const [jobs, setJobs] = useState<Map<string, BackgroundJob>>(new Map());
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Initialize Socket.IO connection
     */
    const initializeSocket = useCallback(() => {
        if (!authToken || socketRef.current) return;

        const socket = io(SOCKET_URL, {
            auth: { token: authToken },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('✅ Socket.IO connected');
            setConnected(true);

            // Subscribe to all active jobs
            const activeJobs = getActiveJobs();
            activeJobs.forEach((jobId) => {
                socket.emit('subscribe:job', jobId);
            });
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket.IO disconnected');
            setConnected(false);
        });

        socket.on('job:update', (data: any) => {
            console.log('📡 Job update received:', data);

            const { jobId, event, progress, result, error } = data;

            // Update job in state
            setJobs((prev) => {
                const updated = new Map(prev);
                const job = updated.get(jobId) || {
                    jobId,
                    status: 'processing',
                    createdAt: Date.now(),
                };

                if (event === 'progress' && progress) {
                    job.progress = progress;
                    job.status = 'processing';
                    onProgress?.(jobId, progress);
                } else if (event === 'job:completed' && result) {
                    job.result = result;
                    job.status = 'completed';
                    onComplete?.(jobId, result);
                    removeActiveJob(jobId);
                } else if (event === 'job:failed') {
                    job.status = 'failed';
                    onError?.(jobId, error || 'Job failed');
                    removeActiveJob(jobId);
                }

                updated.set(jobId, job);
                return updated;
            });
        });

        socket.on('job:status', (status: JobStatusResponse) => {
            console.log('📊 Job status received:', status);

            setJobs((prev) => {
                const updated = new Map(prev);
                updated.set(status.jobId, {
                    jobId: status.jobId,
                    status: status.status,
                    progress: status.progress,
                    result: status.result,
                    createdAt: status.createdAt,
                });
                return updated;
            });
        });

        socket.on('error', (error: any) => {
            console.error('❌ Socket error:', error);
        });

        socketRef.current = socket;
    }, [authToken, onProgress, onComplete, onError]);

    /**
     * Poll job status as fallback
     */
    const pollJobStatus = useCallback(async (jobId: string) => {
        try {
            const response = await fetch(`/api/jobs/${jobId}/status`, {
                headers: {
                    'x-user-id': userId,
                },
            });

            if (!response.ok) return;

            const status: JobStatusResponse = await response.json();

            setJobs((prev) => {
                const updated = new Map(prev);
                updated.set(status.jobId, {
                    jobId: status.jobId,
                    status: status.status,
                    progress: status.progress,
                    result: status.result,
                    createdAt: status.createdAt,
                });

                // Trigger callbacks
                if (status.status === 'completed' && status.result) {
                    onComplete?.(jobId, status.result);
                    removeActiveJob(jobId);
                } else if (status.status === 'failed') {
                    onError?.(jobId, status.failedReason || 'Job failed');
                    removeActiveJob(jobId);
                } else if (status.status === 'processing' && status.progress) {
                    onProgress?.(jobId, status.progress);
                }

                return updated;
            });
        } catch (error) {
            console.error('Error polling job status:', error);
        }
    }, [userId, onProgress, onComplete, onError]);

    /**
     * Start polling for active jobs
     */
    const startPolling = useCallback(() => {
        if (pollIntervalRef.current) return;

        pollIntervalRef.current = setInterval(() => {
            const activeJobs = getActiveJobs();
            activeJobs.forEach((jobId) => {
                pollJobStatus(jobId);
            });
        }, POLL_INTERVAL);
    }, [pollJobStatus]);

    /**
     * Stop polling
     */
    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    /**
     * Create a new job
     */
    const createJob = useCallback(
        async (jobData: any): Promise<string | null> => {
            try {
                const response = await fetch('/api/jobs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId,
                    },
                    body: JSON.stringify(jobData),
                });

                if (!response.ok) {
                    throw new Error('Failed to create job');
                }

                const result = await response.json();
                const jobId = result.jobId;

                // Save to localStorage
                saveActiveJob(jobId);

                // Subscribe via socket
                if (socketRef.current?.connected) {
                    socketRef.current.emit('subscribe:job', jobId);
                }

                // Add to state
                setJobs((prev) => {
                    const updated = new Map(prev);
                    updated.set(jobId, {
                        jobId,
                        status: 'queued',
                        createdAt: Date.now(),
                    });
                    return updated;
                });

                console.log('✅ Job created:', jobId);
                return jobId;
            } catch (error) {
                console.error('❌ Error creating job:', error);
                return null;
            }
        },
        [userId]
    );

    /**
     * Cancel a job
     */
    const cancelJob = useCallback(
        async (jobId: string): Promise<boolean> => {
            try {
                const response = await fetch(`/api/jobs/${jobId}/cancel`, {
                    method: 'POST',
                    headers: {
                        'x-user-id': userId,
                    },
                });

                if (!response.ok) return false;

                removeActiveJob(jobId);

                setJobs((prev) => {
                    const updated = new Map(prev);
                    const job = updated.get(jobId);
                    if (job) {
                        job.status = 'cancelled';
                        updated.set(jobId, job);
                    }
                    return updated;
                });

                return true;
            } catch (error) {
                console.error('Error cancelling job:', error);
                return false;
            }
        },
        [userId]
    );

    /**
     * Initialize on mount
     */
    useEffect(() => {
        // Initialize socket
        initializeSocket();

        // Load active jobs from localStorage
        const activeJobs = getActiveJobs();
        activeJobs.forEach((jobId) => {
            pollJobStatus(jobId);
        });

        // Start polling if socket not connected
        if (!connected) {
            startPolling();
        }

        return () => {
            stopPolling();
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [initializeSocket, connected, startPolling, stopPolling, pollJobStatus]);

    return {
        jobs: Array.from(jobs.values()),
        connected,
        createJob,
        cancelJob,
    };
}
