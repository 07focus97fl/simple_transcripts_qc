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

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-3 border-b">
        <h2 className="font-semibold">
          {isLoaded ? `${videoId} Video` : 'No Video Loaded'}
        </h2>
      </div>
      <div className="flex-1 bg-black flex flex-col items-center justify-center">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              className="max-h-full w-full"
              controls
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
            <div className="p-2 bg-gray-800 w-full flex justify-center">
              <button 
                onClick={handleRewind}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                ⟲ Rewind 5s
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No video loaded</p>
        )}
      </div>
    </div>
  );
} 