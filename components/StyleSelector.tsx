"use client";

import * as React from "react";
import { ChevronsUpDown, Volume2, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StyleOption } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  disabled?: boolean;
}

export function StyleSelector({
  styles,
  selectedStyle,
  onStyleChange,
  disabled = false,
}: StyleSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null); // Ref for audio element
  const [currentlyPlaying, setCurrentlyPlaying] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const selectedStyleObj = styles.find(
    (style) => style.value === selectedStyle
  );

  const playSample = (styleValue: string) => {
    const audioPath = `/${styleValue}.mp3`;

    if (audioRef.current) {
      audioRef.current.pause();
      if (
        audioRef.current.src.endsWith(audioPath) &&
        currentlyPlaying === styleValue
      ) {
        setCurrentlyPlaying(null);
        return;
      }
    }

    audioRef.current = new Audio(audioPath);
    audioRef.current.play().catch((err) => {
      console.error("Error playing audio sample:", err);
      setCurrentlyPlaying(null);
    });
    setCurrentlyPlaying(styleValue);

    audioRef.current.onended = () => {
      setCurrentlyPlaying(null);
    };
    audioRef.current.onerror = () => {
     
      console.error(`Error loading audio file: ${audioPath}`);
      setCurrentlyPlaying(null);
    };
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-20 p-4 hover:shadow-2xs bg-accent/20 shadow-sm transition-colors duration-200 ease-in-out"
          disabled={disabled}
        >
          {selectedStyleObj ? (
            <div className="flex items-start gap-3 text-left overflow-hidden">
              <Avatar className="h-12 w-12 mt-0.5 flex-shrink-0">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {selectedStyleObj.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="font-bold text-lg truncate">
                  {selectedStyleObj.label}
                </div>

                {selectedStyleObj.description && (
                  <p className="text-sm text-muted-foreground hidden sm:block line-clamp-1">
                    {selectedStyleObj.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">
              Select a character voice...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{
          width: triggerWidth > 0 ? `${triggerWidth}px` : undefined,
        }}
      >
        <Command>
          <CommandInput
            placeholder="Search character voices..."
            className="h-10"
          />
          <CommandList>
            <CommandEmpty>No character voice found.</CommandEmpty>
            <ScrollArea className="h-[300px]">
              <CommandGroup>
                {styles.map((style) => (
                  <CommandItem
                    key={style.value}
                    value={style.value}
                    onSelect={(currentValue) => {
                      onStyleChange(currentValue);
                      setOpen(false);
                    }}
                    className="flex items-start py-3"
                    disabled={disabled}
                  >
                    <div className="flex items-start gap-3 flex-1 overflow-hidden">
                      <Avatar className="h-10 w-10 mt-0.5 flex-shrink-0">
                        <AvatarFallback className="text-base bg-primary/10 text-primary">
                          {style.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center">
                          <span className="font-medium truncate">
                            {style.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 ml-2 rounded-full opacity-70 hover:opacity-100 flex-shrink-0",
                              currentlyPlaying === style.value &&
                                "bg-primary/10"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              playSample(style.value);
                            }}
                            aria-label={`Play sample for ${style.label}`}
                          >
                            {currentlyPlaying === style.value ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {style.description && (
                          <p className="text-sm text-muted-foreground hidden sm:block line-clamp-1">
                            {style.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
