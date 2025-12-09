"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NoteIconPickerProps {
  icon: string | null | undefined;
  onIconChange: (icon: string | null) => void;
  className?: string;
}

// Common emoji categories for notes
const EMOJI_CATEGORIES = [
  {
    name: "Recents",
    emojis: ["📝", "📋", "📌", "📎", "✅", "⭐", "💡", "🎯"],
  },
  {
    name: "Work",
    emojis: ["💼", "📊", "📈", "💻", "🖥️", "📧", "📅", "🗂️"],
  },
  {
    name: "Personal",
    emojis: ["🏠", "❤️", "🎉", "🎂", "✈️", "🏖️", "🎬", "🎵"],
  },
  {
    name: "Ideas",
    emojis: ["💡", "🧠", "🔮", "🎨", "🚀", "⚡", "🔥", "💎"],
  },
  {
    name: "Status",
    emojis: ["✅", "⏳", "❌", "⚠️", "🔄", "🔒", "📌", "🏷️"],
  },
  {
    name: "Nature",
    emojis: ["🌸", "🌿", "🌙", "☀️", "🌈", "⛰️", "🌊", "🍃"],
  },
];

export function NoteIconPicker({ icon, onIconChange, className }: NoteIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    onIconChange(emoji);
    setOpen(false);
  };

  const handleRemoveIcon = () => {
    onIconChange(null);
    setOpen(false);
  };

  // Show static placeholder during SSR
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-auto p-1 text-4xl hover:bg-muted/50 transition-all text-muted-foreground/40",
          className
        )}
      >
        📄
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-auto p-1 text-4xl hover:bg-muted/50 transition-all",
            !icon && "text-muted-foreground/40 hover:text-muted-foreground",
            className
          )}
        >
          {icon || "📄"}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[320px] p-3" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Choose Icon</h4>
            {icon && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveIcon}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            )}
          </div>
          
          {EMOJI_CATEGORIES.map((category) => (
            <div key={category.name} className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{category.name}</p>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded text-lg hover:bg-muted transition-colors",
                      icon === emoji && "bg-muted ring-2 ring-primary"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
