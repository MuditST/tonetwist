"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ProgressAnimation } from "@/components/ProgressAnimation";
import { AudioPlayer } from "@/components/AudioPlayer";
import {
  FileText,
  MessageSquare,
  Headphones,
  Lock as LockIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ProcessingStepId = "idle" | "transcribing" | "enhancing" | "synthesizing";
type ResultTabId = "transcript" | "enhanced" | "audio";

interface ResultsDisplayProps {
  currentStep: ProcessingStepId;
  isComplete: boolean;
  transcribedText: string;
  enhancedText: string;
  audioUrl: string | null;
  activeResultTab: ResultTabId;
  setActiveResultTab: (tab: ResultTabId) => void;
}

export function ResultsDisplay({
  currentStep,
  isComplete,
  transcribedText,
  enhancedText,
  audioUrl,
  activeResultTab,
  setActiveResultTab,
}: ResultsDisplayProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
       
        <h2 className="text-2xl font-bold">🎭 The Voice You&apos;ve Created</h2>
        <p className="text-sm text-muted-foreground ml-3">
          Each step unlocks as your voice transforms.
        </p>
      </div>

      <ProgressAnimation
        currentStep={currentStep}
        isComplete={isComplete}
        transcribedText={transcribedText}
        enhancedText={enhancedText}
        audioUrl={audioUrl}
      />

      <Card className="">
        <Tabs
          value={activeResultTab}
          onValueChange={(value) => setActiveResultTab(value as ResultTabId)}
          layoutIdPrefix="results-tabs"
        >
          <TabsList className="grid grid-cols-3 w-full/80 mx-5">
            {/* Transcript Tab Trigger */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="transcript"
                    
                    disabled={
                      !transcribedText && currentStep !== "transcribing"
                    }
                    className={`w-full ${
                   
                      !transcribedText && currentStep !== "transcribing"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">What You Said</span>
                      <span className="sm:hidden">Transcript</span>
                     
                      {!transcribedText && currentStep !== "transcribing" && (
                        <LockIcon className="h-3 w-3 ml-1 flex-shrink-0" />
                      )}
                    </div>
                  </TabsTrigger>
                </TooltipTrigger>
                {!transcribedText && currentStep !== "transcribing" && (
                  <TooltipContent>
                    <p>Run the magic to unlock this stage</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Enhanced Tab Trigger */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="enhanced"
                    
                    disabled={!enhancedText && currentStep !== "enhancing"}
                    className={`w-full ${
                      
                      !enhancedText && currentStep !== "enhancing"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">
                        What They&apos;d Say
                      </span>
                      <span className="sm:hidden">Enhanced</span>
                  
                      {!enhancedText && currentStep !== "enhancing" && (
                        <LockIcon className="h-3 w-3 ml-1 flex-shrink-0" />
                      )}
                    </div>
                  </TabsTrigger>
                </TooltipTrigger>
            
                {!enhancedText && currentStep !== "enhancing" && (
                  <TooltipContent>
                    <p>Complete the transcription step first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Audio Tab Trigger */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="audio"
                  
                    disabled={!audioUrl && currentStep !== "synthesizing"}
                    className={`w-full ${
                    
                      !audioUrl && currentStep !== "synthesizing"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Headphones className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">
                        Hear Your Character
                      </span>
                      <span className="sm:hidden">Audio</span>
                    
                      {!audioUrl && currentStep !== "synthesizing" && (
                        <LockIcon className="h-3 w-3 ml-1 flex-shrink-0" />
                      )}
                    </div>
                  </TabsTrigger>
                </TooltipTrigger>
             
                {!audioUrl && currentStep !== "synthesizing" && (
                  <TooltipContent>
                    <p>Complete the previous steps first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </TabsList>

          {/* Transcript Tab Content */}
          <TabsContent value="transcript" className="p-5 min-h-[220px]">
            {currentStep === "transcribing" ? (
              <div className="h-[220px] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Processing your voice...
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[220px] w-full rounded-md border p-4">
                <div className="whitespace-pre-wrap">
                  {transcribedText ? (
                    <p>{transcribedText}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Run the magic to see results
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Enhanced Tab Content */}
          <TabsContent value="enhanced" className="p-5 min-h-[220px]">
            {currentStep === "enhancing" ? (
              <div className="h-[220px] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Channeling the character...
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[220px] w-full rounded-md border p-4">
                <div className="whitespace-pre-wrap">
                  {enhancedText ? (
                    <p>{enhancedText}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Complete the transcription first
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Audio Tab Content */}
          <TabsContent value="audio" className="p-5 min-h-[220px]">
            <div className="h-[220px] flex flex-col items-center justify-center w-full max-w-md mx-auto">
              <AudioPlayer
           
                audioUrl={audioUrl}
                isLoading={currentStep === "synthesizing"}
              />
            
              {currentStep === "synthesizing" && (
                <p className="text-lg font-medium text-muted-foreground mt-4">
                  Breathing life into your character&apos;s voice...
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
