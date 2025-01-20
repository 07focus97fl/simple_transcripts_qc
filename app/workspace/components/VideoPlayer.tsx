'use client';
import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  isLoaded?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
}

export default function VideoPlayer({ 
  videoUrl,
  videoId = '',
  isLoaded = false,
  onTimeUpdate 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', () => {
        onTimeUpdate?.(videoRef.current?.currentTime || 0);
      });
    }
  }, [onTimeUpdate]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-3 border-b">
        <h2 className="font-semibold">
          {isLoaded ? `${videoId} Video` : 'No Video Loaded'}
        </h2>
      </div>
      <div className="flex-1 bg-black flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="max-h-full w-full"
            controls
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <p className="text-gray-500">No video loaded</p>
        )}
      </div>
    </div>
  );
} 