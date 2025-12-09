"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, Paintbrush } from "lucide-react"
import { useState } from "react"

export const PRESET_COLORS = [
  "#64748b", // Slate
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
]

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex w-full items-center gap-2">
            {value ? (
              <div 
                className="h-4 w-4 rounded-full border border-muted-foreground/20" 
                style={{ backgroundColor: value }} 
              />
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <span className="truncate">{value || "Pick a color"}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="font-medium text-xs text-muted-foreground">Presets</div>
            <div className="flex flex-wrap gap-1">
              {PRESET_COLORS.map((color) => (
                <div
                  key={color}
                  className={cn(
                    "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-muted-foreground/20 hover:scale-105 active:scale-95 transition-all",
                    value === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color)
                    setIsOpen(false)
                  }}
                >
                  {value === color && <Check className="h-3 w-3 text-white mix-blend-difference" />}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5">
             <div className="font-medium text-xs text-muted-foreground">Custom</div>
             <div className="flex items-center gap-2">
                <Input 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="h-8 flex-1"
                />
                 <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-muted-foreground/20">
                    <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: value }} 
                     />
                     <input 
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                     />
                 </div>
             </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
