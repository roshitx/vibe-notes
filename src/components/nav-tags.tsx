"use client"

import { Hash, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tag } from "@/lib/types"

import { CreateTagDialog } from "./tags/create-tag-dialog"

export function NavTags({ tags }: { tags: Tag[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTagId = searchParams.get("tag")

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center pr-2">
        <span>Tags</span>
        <CreateTagDialog />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {tags.length === 0 ? (
             <div className="px-2 py-1 text-xs text-muted-foreground">No tags yet</div>
          ) : (
            tags.map((tag) => (
              <NavTagItem key={tag.id} tag={tag} currentTagId={currentTagId} />
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

import { Edit2 } from "lucide-react"
import { useState } from "react"
import { EditTagDialog } from "./tags/edit-tag-dialog"

function NavTagItem({ tag, currentTagId }: { tag: Tag, currentTagId: string | null }) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <SidebarMenuItem className="group flex items-center justify-between pr-2">
            <SidebarMenuButton asChild isActive={currentTagId === tag.id || false} className="flex-1">
                <Link href={`/tags/${tag.id}`}>
                {tag.color ? (
                        <div 
                        className="h-4 w-4 rounded-full border shrink-0" 
                        style={{ backgroundColor: tag.color, borderColor: `${tag.color}40` }} 
                        />
                ) : (
                    <Hash />
                )}
                <span className="truncate">{tag.name}</span>
                </Link>
            </SidebarMenuButton>
            
            <button 
                onClick={() => setEditOpen(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            >
                <Edit2 className="h-3 w-3" />
                <span className="sr-only">Edit Tag</span>
            </button>

            <EditTagDialog 
                tag={tag} 
                open={editOpen} 
                onOpenChange={setEditOpen} 
            />
        </SidebarMenuItem>
    )
}
