"use client";

import { createContext, forwardRef, useContext } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring",
  stiffness: 170,
  damping: 24,
  mass: 1.2,
};

type TabsContextType = {
  value: string;
  layoutIdPrefix: string;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

type TabsProviderProps = {
  children: React.ReactNode;
  value: string;
  layoutIdPrefix: string;
};

function TabsProvider({ children, value, layoutIdPrefix }: TabsProviderProps) {
  return (
    <TabsContext.Provider value={{ value, layoutIdPrefix }}>
      {children}
    </TabsContext.Provider>
  );
}

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  layoutIdPrefix: string;
}

function Tabs({
  value,
  onValueChange,
  children,
  className,
  layoutIdPrefix,
}: TabsProps) {
  return (
    <MotionConfig transition={transition}>
      <TabsProvider value={value} layoutIdPrefix={layoutIdPrefix}>
        <TabsPrimitive.Root
          value={value}
          onValueChange={onValueChange}
          className={cn("relative", className)}
        >
          {children}
        </TabsPrimitive.Root>
      </TabsProvider>
    </MotionConfig>
  );
}

const TabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { value, layoutIdPrefix } = useTabs();
  const isActive = value === props.value;

  return (
    <div className="relative flex-1">
      {isActive && (
        <motion.div
          layoutId={`${layoutIdPrefix}-active-tab-bg`}
          className="absolute inset-0 z-0 rounded-md bg-background shadow-sm"
          style={{ borderRadius: 6 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "relative z-10 flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    </div>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
