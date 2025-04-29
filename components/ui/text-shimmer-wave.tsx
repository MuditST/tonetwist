"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextShimmerWaveProps {
  children: string;
  className?: string;
  duration?: number;
}

export function TextShimmerWave({
  children,
  className,
  duration = 2,
}: TextShimmerWaveProps) {
  return (
    <div className={"inline-block overflow-hidden"}>
      <motion.span
        className={cn("inline-block", className)}
        initial={{ backgroundPositionX: "0%" }}
        animate={{ backgroundPositionX: "100%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {children}
      </motion.span>
    </div>
  );
}
