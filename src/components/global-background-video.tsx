'use client';

import { useEffect, useRef } from 'react';

export function GlobalBackgroundVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Ensure video plays on mount
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.log('Video autoplay prevented:', error);
            });
        }
    }, []);

    return (
        <>
            {/* Global Background Video */}
            <div className="global-video-background">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none"
                    style={{
                        zIndex: -1,
                        minWidth: '100%',
                        minHeight: '100%',
                    }}
                >
                    <source src="/background-video.mp4" type="video/mp4" />.
                    {/* Fallback for browsers that don't support video */}
                    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
                </video>

                {/* Dark Overlay for Better Text Visibility */}
                <div
                    className="fixed top-0 left-0 w-full h-full pointer-events-none bg-black/40"
                    style={{ zIndex: 0 }}
                />
            </div>
        </>
    );
}
