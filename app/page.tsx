"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { toast } from "sonner";
import { FileAudio, Mic, Upload, Sparkles, Loader2 } from "lucide-react";
import { enhancementStyles } from "@/lib/styles";
import { AudioUploader } from "@/components/AudioUploader";
import { AudioRecorder } from "@/components/AudioRecorder";
import { StyleSelector } from "@/components/StyleSelector";

import { cn } from "@/lib/utils";

import { ResultsDisplay } from "@/components/ResultsDisplay";

type ProcessingStepId = "idle" | "transcribing" | "enhancing" | "synthesizing";
type ResultTabId = "transcript" | "enhanced" | "audio";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(
    enhancementStyles[0]?.value || ""
  );

  const [transcribedText, setTranscribedText] = useState<string>("");
  const [enhancedText, setEnhancedText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<ProcessingStepId>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] =
    useState<ResultTabId>("transcript");

  const [inputTab, setInputTab] = useState<"upload" | "record">("upload");

  const isProcessing = currentStep !== "idle";
  const isComplete = currentStep === "idle" && !!audioUrl && !error;
  const hasAudioInput = !!audioFile || !!audioBlob;

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        console.log("Revoked old audio URL");
      }
    };
  }, [audioUrl]);

  const resetState = (clearInput: boolean = false) => {
    setTranscribedText("");
    setEnhancedText("");

    setCurrentStep("idle");
    setError(null);
    setActiveResultTab("transcript");
    if (clearInput) {
      setAudioFile(null);
      setAudioBlob(null);

      setAudioUrl(null);
      console.log("Input and state reset");
    } else {
      setAudioUrl(null);
      console.log("Results state reset, input persisted");
    }
  };

  const handleTranscribe = async (audioData: File | Blob | null) => {
    if (!audioData) {
      console.error("handleTranscribe called with null audioData");
      toast.error("Transcription Error", {
        description: "Cannot start transcription: No audio data found.",
      });
      setError("Cannot start transcription: No audio data found.");
      setCurrentStep("idle");
      return null;
    }

    resetState();
    setCurrentStep("transcribing");
    setError(null);
    console.log("Starting transcription with audio data:", audioData);

    const formData = new FormData();
    const fileName =
      audioData instanceof File ? audioData.name : "recording.webm";
    formData.append("file", audioData, fileName);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Transcription failed");
      }

      setTranscribedText(result.transcription);
      setActiveResultTab("transcript");
      console.log("Transcription successful:", result.transcription);
      return result.transcription;
    } catch (err: unknown) {
      console.error("Transcription error:", err);
      const message =
        err instanceof Error ? err.message : "Could not transcribe audio.";
      setError(`Transcription failed: ${message}`);
      setCurrentStep("idle");
      toast.error("Transcription Error", { description: message });
      return null;
    }
  };

  const handleEnhance = async (textToEnhance: string, style: string) => {
    setCurrentStep("enhancing");
    setError(null);
    console.log(`Starting enhancement with style: ${style}...`);

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToEnhance, style: style }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Enhancement failed");
      }

      setEnhancedText(result.enhancedText);
      setActiveResultTab("enhanced");
      console.log("Enhancement successful:", result.enhancedText);
      return result.enhancedText;
    } catch (err: unknown) {
      console.error("Enhancement error:", err);
      const message =
        err instanceof Error ? err.message : "Could not enhance text.";
      setError(`Enhancement failed: ${message}`);
      setCurrentStep("idle");
      toast.error("Enhancement Error", { description: message });
      return null;
    }
  };

  const handleSynthesize = async (textToSynthesize: string, style: string) => {
    setCurrentStep("synthesizing");
    setError(null);
    setAudioUrl(null);
    console.log(`Starting synthesis with style: ${style}...`);

    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSynthesize, style: style }),
      });

      if (!response.ok) {
        let errorMsg = `Synthesis HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (_e) {
        }
        throw new Error(errorMsg);
      }

      const audioBlobResult = await response.blob();
      const url = URL.createObjectURL(audioBlobResult);
      setAudioUrl(url);
      setCurrentStep("idle");
      setActiveResultTab("audio");
      console.log("Synthesis successful. Audio URL created:", url);
    } catch (err: unknown) {
      // Keep unknown
      console.error("Synthesis error:", err);
      const message =
        err instanceof Error ? err.message : "Could not synthesize audio.";
      setError(`Synthesis failed: ${message}`);
      setCurrentStep("idle");
      toast.error("Synthesis Error", { description: message });
    }
  };

  const handleTransform = async () => {
    const audioSource = audioFile || audioBlob;
    if (!audioSource) {
      toast.warning("Missing Input", {
        description: "Please upload or record audio first.",
      });
      return;
    }
    if (!selectedStyle) {
      toast.warning("Missing Style", {
        description: "Please select an enhancement style.",
      });
      return;
    }

    const transcript = await handleTranscribe(audioSource);
    if (transcript) {
      const enhanced = await handleEnhance(transcript, selectedStyle);
      if (enhanced) {
        await handleSynthesize(enhanced, selectedStyle);
      }
    }
  };

  const handleFileSelect = (file: File | null) => {
    resetState(true);
    setAudioFile(file);
    setAudioBlob(null);
    if (file) console.log("Audio file selected:", file.name);
  };

  const handleRecordingComplete = (blob: Blob | null) => {
    resetState(true);
    setAudioBlob(blob);
    setAudioFile(null);
    if (blob) console.log("Audio recording completed, size:", blob.size);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 overflow-x-hidden">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Tone Twist
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Craft your character&apos;s voice with AI magic
          </p>
        </header>

        <main className="space-y-8">
          {/* Step 1: Voice Input */}
          <div className="rounded-xl bg-background p-6 border shadow-sm">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">🎤 Step 1: Add Your Voice</h2>
              {hasAudioInput && (
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetState(true)}
                    className="text-xs flex items-center gap-1"
                  >
                    Replace
                  </Button>
                </div>
              )}
            </div>

            {hasAudioInput ? (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="bg-primary/10 rounded-full p-2 mr-3">
                      <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {audioFile ? audioFile.name : "Voice recording"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {audioFile
                          ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "Ready to transform"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Tabs
                value={inputTab}
                onValueChange={(v) => setInputTab(v as "upload" | "record")}
                layoutIdPrefix="input-tabs"
              >
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" /> Upload Audio
                  </TabsTrigger>
                  <TabsTrigger
                    value="record"
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" /> Record Voice
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-0">
                  <AudioUploader
                    onFileSelect={handleFileSelect}
                    currentFile={audioFile}
                    disabled={isProcessing}
                  />
                </TabsContent>

                <TabsContent value="record" className="mt-0">
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    disabled={isProcessing}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Step 2: Choose Character */}
          <div className="rounded-xl bg-background p-6 border shadow-sm">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">
                🎭 Step 2: Choose Your Character
              </h2>
            </div>
            <StyleSelector
              styles={enhancementStyles}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              disabled={isProcessing}
            />
          </div>

          {/* Transform Button */}
          <div className="py-4">
            <div className="relative">
              {isComplete ? (
                <Button
                  size="lg"
                  className="w-full py-8 text-xl font-bold border-2 border-primary hover:bg-primary/10"
                  onClick={() => {
                    resetState(false);

                    setTimeout(handleTransform, 0);
                  }}
                  variant="outline"
                  disabled={isProcessing}
                >
                  🪄 Cook Again!
                </Button>
              ) : (
                <Button
                  size="lg"
                  className={cn(
                    "w-full py-8 text-xl font-bold",
                    "text-primary-foreground dark:text-primary-foreground"
                  )}
                  onClick={handleTransform}
                  disabled={isProcessing || (!audioFile && !audioBlob)}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {currentStep === "transcribing" &&
                        "🎧 Listening closely..."}
                      {currentStep === "enhancing" &&
                        "✨ Adding magic ingredients..."}
                      {currentStep === "synthesizing" &&
                        "🎤 Breathing life into your voice..."}
                    </span>
                  ) : (
                    "🔮 Start Cookin'"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {(isProcessing ||
            isComplete ||
            transcribedText ||
            enhancedText ||
            audioUrl) && (
            <ResultsDisplay
              currentStep={currentStep}
              isComplete={isComplete}
              transcribedText={transcribedText}
              enhancedText={enhancedText}
              audioUrl={audioUrl}
              activeResultTab={activeResultTab}
              setActiveResultTab={setActiveResultTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}
