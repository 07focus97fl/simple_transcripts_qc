'use client';
import { useState } from 'react';
import TextEditor from './components/TextEditor';
import VideoPlayer from './components/VideoPlayer';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Workspace() {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleTextChange = (text: string) => {
    setTranscriptText(text);
    // Clear any previous save message when text changes
    setSaveMessage('');
  };

  const validateFormat = (input: string) => {
    const regex = /^\d{4}\s+C[1-9]\s+T[1-9]$/;
    return regex.test(input);
  };

  const handleLoad = async () => {
    if (!validateFormat(videoId)) {
      setError('Please use format: XXXX CX TX (e.g., 4003 C1 T1)');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const { success, data, error: responseError } = await response.json();
      
      if (!success) {
        throw new Error(responseError || 'Failed to load files');
      }

      setVideoUrl(data.videoUrl);
      setTranscriptText(data.transcriptText);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load video and transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!videoId) {
      setError('No transcript loaded to save');
      return;
    }

    setSaving(true);
    setSaveMessage('');
    
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          transcriptText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }

      const { success, message, error: responseError } = await response.json();
      
      if (!success) {
        throw new Error(responseError || 'Failed to save transcript');
      }

      setSaveMessage('Saved successfully!');
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save transcript');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6">
      <Card className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="bg-card p-4 border-b flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value.toUpperCase())}
              placeholder="4003 C1 T1"
              className="w-36"
              disabled={loading || saving}
            />
            <Button 
              onClick={handleLoad} 
              disabled={loading || saving}
            >
              {loading ? 'Loading...' : 'Load'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || saving || !videoId}
              variant="outline"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {error && <span className="text-destructive text-sm">{error}</span>}
          {saveMessage && <span className="text-green-600 text-sm">{saveMessage}</span>}
        </div>

        {/* Main content */}
        <div className="flex flex-1">
          {/* Left side - Text Editor */}
          <div className="w-1/2 border-r">
            <TextEditor 
              initialText={transcriptText} 
              onTextChange={handleTextChange} 
            />
          </div>

          {/* Right side - Video Player */}
          <div className="w-1/2">
            <VideoPlayer 
              videoUrl={videoUrl || undefined} 
              onTimeUpdate={handleTimeUpdate} 
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
