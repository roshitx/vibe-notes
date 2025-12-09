"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/lib/types"
import { createTag, addTagToNote, removeTagFromNote, getTags } from "@/lib/actions/tags"

interface TagSelectorProps {
  noteId: string
  initialTags?: Tag[]
  allTags?: Tag[] // Optional pre-loaded tags, but we can also fetch
}

export function TagSelector({ noteId, initialTags = [] }: TagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [tags, setTags] = React.useState<Tag[]>(initialTags)
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([])
  const [loading, setLoading] = React.useState(false)

  // Fetch available tags when popover opens
  React.useEffect(() => {
    if (open) {
      const fetchTags = async () => {
        const result = await getTags();
        setAvailableTags(result);
      };
      fetchTags();
    }
  }, [open]);

  // Update local tags state when initialTags changes (e.g. from parent refresh)
  React.useEffect(() => {
      setTags(initialTags);
  }, [initialTags]);

  const handleSelectTag = async (tag: Tag) => {
    const isSelected = tags.some((t) => t.id === tag.id)
    
    // Optimistic update
    if (isSelected) {
        setTags(tags.filter((t) => t.id !== tag.id))
        await removeTagFromNote(noteId, tag.id);
    } else {
        setTags([...tags, tag])
        await addTagToNote(noteId, tag.id);
    }
  }

  const handleCreateTag = async () => {
      if (!value) return;
      setLoading(true);
      const result = await createTag(value);
      setLoading(false);
      
      if (result.success && result.data) {
          // Add to available tags
          setAvailableTags([...availableTags, result.data]);
          // Select it immediately
          handleSelectTag(result.data);
          setValue("");
      }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Badge 
            key={tag.id} 
            variant="secondary" 
            className="flex items-center gap-1 pr-1"
            style={{ 
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                color: tag.color || undefined,
                borderColor: tag.color ? `${tag.color}40` : undefined
            }}
        >
          {tag.name}
          <button
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none"
            onClick={(e) => {
                e.stopPropagation(); // Prevent opening popover if used elsewhere
                handleSelectTag(tag);
            }}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </button>
        </Badge>
      ))}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="h-6 rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput 
                placeholder="Search tag..." 
                value={value}
                onValueChange={setValue}
            />
            <CommandList>
              <CommandEmpty className="py-2 text-center text-xs">
                 {value ? (
                     <button 
                        className="flex w-full items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={handleCreateTag}
                        disabled={loading}
                     >
                        <Plus className="h-3 w-3" />
                        Create "{value}"
                     </button>
                 ) : "No tags found."}
              </CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => {
                   const isSelected = tags.some((t) => t.id === tag.id) 
                   return (
                    <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => handleSelectTag(tag)}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                        )}
                        />
                         {tag.color && (
                            <div 
                                className="mr-2 h-2 w-2 rounded-full" 
                                style={{ backgroundColor: tag.color }}
                            />
                        )}
                        {tag.name}
                    </CommandItem>
                    )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
