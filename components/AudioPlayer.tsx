"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Download, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AudioPlayerProps {
  audioUrl: string | null;
  isLoading?: boolean; 
}

export function AudioPlayer({ audioUrl, isLoading = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsMetadataLoaded(false);
    
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration !== Infinity) {
        setDuration(audio.duration);
        setIsMetadataLoaded(true);
      }
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    
    };


    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("durationchange", setAudioData); 
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);


    if (audio.readyState >= 1) {
      setAudioData();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("durationchange", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]); 


  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current || !isMetadataLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((err) => console.error("Audio play error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current || !isMetadataLoaded) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted; 
    setIsMuted(newMuted);

  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;

    link.download = "twisted_audio.mp3"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center h-[200px] p-6 bg-muted/30 w-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium text-center">Synthesizing audio...</p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Please wait while we generate the voice.
        </p>
      </Card>
    );
  }

  if (!audioUrl) {
    return (
      <Card className="flex flex-col items-center justify-center h-[200px] p-6 bg-muted/30 w-full">
        <p className="text-lg font-medium text-center">
          Processed audio will appear here
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Complete the transformation to listen.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-5">
    
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>

      <Slider
        value={[currentTime]}
        max={duration || 1}
        step={0.1}
        onValueChange={handleSliderChange}
        className="cursor-pointer"
        disabled={!isMetadataLoaded}
      />

      <div className="flex justify-between items-center gap-4">
        <Button
          onClick={togglePlay}
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full shadow-md"
          disabled={!isMetadataLoaded}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause size={20} />
          ) : (
            <Play size={20} className="ml-1" />
          )}
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleMute}
            disabled={!isMetadataLoaded}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 cursor-pointer"
            disabled={!isMetadataLoaded}
            aria-label="Volume control"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!isMetadataLoaded}
          aria-label="Download audio"
          className="rounded-full px-4"
        >
          <Download size={16} className="sm:mr-2" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </div>
    </div>
  );
}
