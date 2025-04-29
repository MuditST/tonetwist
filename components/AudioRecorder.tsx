"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
  disabled?: boolean;
}


const MAX_RECORDING_SECONDS = 60;

export function AudioRecorder({
  onRecordingComplete,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

 
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsPermissionGranted(true);

     
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus", 
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      
      mediaRecorderRef.current.start(1000); 
      setIsRecording(true);
      setAudioBlob(null);
      setRecordingTime(0);

 
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_SECONDS) {
         
            if (mediaRecorderRef.current?.state === "recording") {
              console.log("Auto-stopping at time limit");
              mediaRecorderRef.current.stop();
              if (timerRef.current) clearInterval(timerRef.current);
              setIsRecording(false);
            }
            return MAX_RECORDING_SECONDS;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Microphone Error", {
        description:
          "Could not access microphone. Please grant permission in your browser settings.",
      });
      setIsPermissionGranted(false);
      resetState();
    }
  };

  const stopRecording = () => {
   
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); 
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false); 
    }
  };

  const resetState = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    chunksRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    onRecordingComplete(null);
  };

  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      toast.success("Recording Saved", {
        description: "Audio ready for transformation.",
      });
    }
  };

  const handleDiscard = () => {
    resetState();
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <Card className={`${disabled ? "bg-muted/30" : "bg-accent/20"}`}>
      <CardContent className="flex flex-col items-center justify-center p-6 h-[180px]">
        <div className="text-3xl font-mono mb-4">
          {formatTime(recordingTime)}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {/* Show Mic button only when NOT recording AND there's NO blob */}
          {!isRecording && !audioBlob && (
            <Button
              type="button"
              onClick={startRecording}
              disabled={disabled || !isPermissionGranted}
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/80"
              aria-label="Start recording"
            >
              <Mic className="h-6 w-6 text-white" />
            </Button>
          )}

          {/* Show Stop button only when actively recording */}
          {isRecording && (
            <Button
              type="button"
              onClick={stopRecording}
              size="icon"
              className="h-12 w-12 rounded-full bg-primary/80 hover:bg-primary"
              aria-label="Stop recording"
            >
              <Square className="h-5 w-5 text-white" />
            </Button>
          )}

          {/* Show Confirm/Discard buttons only when NOT recording AND there IS a blob */}
          {audioBlob && !isRecording && (
            <>
              <Button
                type="button"
                onClick={handleConfirm}
                size="icon"
                className="h-12 w-12 rounded-full"
                variant="default"
                aria-label="Confirm recording"
              >
                <Check className="h-5 w-5" />
              </Button>

              <Button
                type="button"
                onClick={handleDiscard}
                size="icon"
                className="h-12 w-12 rounded-full"
                variant="outline"
                aria-label="Discard recording"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

    
        <p className="mt-4 text-sm text-muted-foreground text-center h-4">
          {isRecording
            ? "Click the square to stop"
            : audioBlob
            ? "Confirm or discard recording"
            : `Click the microphone to start (up to ${MAX_RECORDING_SECONDS}s)`}{" "}
         
        </p>
        {!isPermissionGranted && (
          <p className="mt-2 text-xs text-destructive text-center">
            Microphone permission denied. Please enable it in browser settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
