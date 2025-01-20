'use client';
import { useState } from 'react';
import TextEditor from './components/TextEditor';
import VideoPlayer from './components/VideoPlayer';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";

export default function Workspace() {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [loadingCorrected, setLoadingCorrected] = useState(false);
  const [isViewingCorrected, setIsViewingCorrected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
    setIsViewingCorrected(false);
    setIsLoaded(false);
    
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
      setIsLoaded(true);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load video and transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCorrected = async () => {
    if (!validateFormat(videoId)) {
      setError('Please use format: XXXX CX TX (e.g., 4003 C1 T1)');
      return;
    }
    
    setError('');
    setLoadingCorrected(true);
    setIsViewingCorrected(true);
    setIsLoaded(false);
    
    try {
      const response = await fetch('/api/load_corrected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      const { success, data, error: responseError } = await response.json();
      
      if (!success) {
        throw new Error(responseError || 'No corrected version found');
      }

      setTranscriptText(data.transcriptText);
      setIsLoaded(true);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load corrected transcript');
    } finally {
      setLoadingCorrected(false);
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
        <div className="bg-card p-4 border-b flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value.toUpperCase())}
              placeholder="4003 C1 T1"
              className="w-36"
              disabled={loading || saving || loadingCorrected}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  disabled={loading || saving || loadingCorrected}
                  className="flex items-center gap-1"
                >
                  {loading || loadingCorrected ? 'Loading...' : 'Load'}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLoad}>
                  Load Original
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLoadCorrected}>
                  Load Corrected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={handleSave}
              disabled={loading || saving || !videoId}
              variant="outline"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {error && <span className="text-destructive text-sm">{error}</span>}
            {saveMessage && <span className="text-green-600 text-sm">{saveMessage}</span>}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open('/instructions/instructions.docx', '_blank')}
                  className="ml-auto"
                >
                  <QuestionMarkCircledIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Instructions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Main content */}
        <div className="flex flex-1">
          {/* Left side - Text Editor */}
          <div className="w-1/2 border-r">
            <TextEditor 
              initialText={transcriptText} 
              videoId={videoId}
              isCorrected={isViewingCorrected}
              isLoaded={isLoaded}
              onTextChange={handleTextChange} 
            />
          </div>

          {/* Right side - Video Player */}
          <div className="w-1/2">
            <VideoPlayer 
              videoUrl={videoUrl || undefined}
              videoId={videoId}
              isLoaded={isLoaded}
              onTimeUpdate={handleTimeUpdate} 
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
