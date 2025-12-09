"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState, useTransition, useEffect } from "react"
import { updateTag } from "@/lib/actions/tags"
import { useRouter } from "next/navigation"
import { ColorPicker } from "@/components/ui/color-picker"
import { Tag } from "@/lib/types"

interface EditTagDialogProps {
  tag: Tag
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTagDialog({ tag, open, onOpenChange }: EditTagDialogProps) {
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color || "")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    setName(tag.name)
    setColor(tag.color || "")
  }, [tag, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Tag name is required")
      return
    }

    startTransition(async () => {
      const result = await updateTag(tag.id, name, color)
      if (result.success) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(result.error || "Failed to update tag")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Make changes to your tag here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Work, Personal, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
