/**
 * Socket.IO Server for Real-time Job Updates
 * Listens to Redis pub/sub and broadcasts to authenticated clients
 * 
 * Run standalone: node socket-server.js
 * Or integrate with Next.js server
 */

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import IORedis from 'ioredis';
import jwt from 'jsonwebtoken';
import { createRedisConnection, REDIS_CHANNELS, validateJobOwnership } from './queue/config';

const PORT = parseInt(process.env.SOCKET_PORT || '3001');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ================================
// Socket.IO Server
// ================================

class SocketJobServer {
    private io: Server;
    private redis: IORedis;
    private subRedis: IORedis;
    private httpServer: ReturnType<typeof createServer>;

    constructor() {
        this.httpServer = createServer();
        this.io = new Server(this.httpServer, {
            cors: {
                origin: CORS_ORIGIN,
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        this.redis = createRedisConnection();
        this.subRedis = createRedisConnection();

        this.initializeMiddleware();
        this.initializeHandlers();
        this.subscribeToRedis();
    }

    /**
     * Authentication middleware
     */
    private initializeMiddleware(): void {
        this.io.use((socket: Socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;

                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                // Verify JWT
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

                if (!decoded.userId) {
                    return next(new Error('Invalid token'));
                }

                // Attach user info to socket
                (socket as any).userId = decoded.userId;

                console.log(`✅ User ${decoded.userId} authenticated`);
                next();
            } catch (error) {
                console.error('❌ Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    /**
     * Socket connection handlers
     */
    private initializeHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            const userId = (socket as any).userId;
            console.log(`🔌 Client connected: ${socket.id} (User: ${userId})`);

            // Join user's personal room
            socket.join(`user:${userId}`);

            // Subscribe to specific job
            socket.on('subscribe:job', (jobId: string) => {
                // Validate job ownership
                if (!validateJobOwnership(jobId, userId)) {
                    socket.emit('error', {
                        message: 'Unauthorized: Cannot subscribe to this job',
                    });
                    return;
                }

                socket.join(`job:${jobId}`);
                console.log(`📊 User ${userId} subscribed to job ${jobId}`);

                // Send current status
                this.sendJobStatus(socket, jobId);
            });

            // Unsubscribe from job
            socket.on('unsubscribe:job', (jobId: string) => {
                socket.leave(`job:${jobId}`);
                console.log(`📊 User ${userId} unsubscribed from job ${jobId}`);
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log(`🔌 Client disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * Subscribe to Redis pub/sub channels
     */
    private async subscribeToRedis(): Promise<void> {
        // Subscribe to jobs channel
        await this.subRedis.subscribe(REDIS_CHANNELS.JOBS);

        // Subscribe to all job progress channels (pattern)
        await this.subRedis.psubscribe('job:*:progress');
        await this.subRedis.psubscribe('job:*:completed');
        await this.subRedis.psubscribe('job:*:failed');

        // Handle messages
        this.subRedis.on('message', (channel, message) => {
            this.handleRedisMessage(channel, message);
        });

        this.subRedis.on('pmessage', (pattern, channel, message) => {
            this.handleRedisMessage(channel, message);
        });

        console.log('✅ Subscribed to Redis pub/sub channels');
    }

    /**
     * Handle Redis pub/sub messages
     */
    private handleRedisMessage(channel: string, message: string): void {
        try {
            const data = JSON.parse(message);

            // Broadcast to relevant room
            if (data.jobId) {
                this.io.to(`job:${data.jobId}`).emit('job:update', data);

                // Also send to user room if userId is present
                if (data.userId) {
                    this.io.to(`user:${data.userId}`).emit('job:update', data);
                }

                console.log(`📡 Broadcasted update for job ${data.jobId}: ${data.event}`);
            }
        } catch (error) {
            console.error('❌ Error handling Redis message:', error);
        }
    }

    /**
     * Send current job status to socket
     */
    private async sendJobStatus(socket: Socket, jobId: string): Promise<void> {
        try {
            // Fetch job status from Redis
            const progressKey = `job:${jobId}:progress`;
            const resultKey = `job:${jobId}:result`;

            const [progress, result] = await Promise.all([
                this.redis.get(progressKey),
                this.redis.get(resultKey),
            ]);

            const status: any = {
                jobId,
                timestamp: Date.now(),
            };

            if (progress) {
                status.progress = JSON.parse(progress);
            }

            if (result) {
                status.result = JSON.parse(result);
                status.event = 'job:completed';
            }

            socket.emit('job:status', status);
        } catch (error) {
            console.error('Error sending job status:', error);
        }
    }

    /**
     * Start server
     */
    start(): void {
        this.httpServer.listen(PORT, () => {
            console.log(`🚀 Socket.IO server running on port ${PORT}`);
            console.log(`📡 CORS origin: ${CORS_ORIGIN}`);
        });
    }

    /**
     * Shutdown
     */
    async shutdown(): Promise<void> {
        console.log('🛑 Shutting down Socket.IO server...');

        await Promise.all([
            new Promise((resolve) => this.io.close(() => resolve(true))),
            this.redis.quit(),
            this.subRedis.quit(),
            new Promise((resolve) => this.httpServer.close(() => resolve(true))),
        ]);

        console.log('👋 Socket.IO server shut down');
    }
}

// ================================
// Start Server
// ================================

if (require.main === module) {
    const server = new SocketJobServer();
    server.start();

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
        console.log(`\n${signal} received`);
        await server.shutdown();
        process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export { SocketJobServer };
