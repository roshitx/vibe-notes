import React, {
    useState,
    useEffect,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from 'react'
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ImageIcon,
    Quote,
    Code,
    Minus,
} from 'lucide-react'
import { CommandItemProps } from './extensions/slash-command'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/lib/actions/upload'

interface SlashCommandListProps {
    items: CommandItemProps[]
    command: (item: CommandItemProps) => void
    editor: any
}

export const SlashCommandList = forwardRef((props: SlashCommandListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Predefined list of commands
    // In a real scenario, this could be passed as props.items and filtered by query
    const items: CommandItemProps[] = [
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            icon: Heading1,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 1 })
                    .run()
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            icon: Heading2,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 2 })
                    .run()
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            icon: Heading3,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 3 })
                    .run()
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bullet list.',
            icon: List,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: 'Numbered List',
            description: 'Create a list with numbering.',
            icon: ListOrdered,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: 'Quote',
            description: 'Capture a quote.',
            icon: Quote,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setBlockquote().run()
            },
        },
        {
            title: 'Code Block',
            description: 'Capture a code snippet.',
            icon: Code,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setCodeBlock().run()
            },
        },
        {
            title: 'Divider',
            description: 'Visually separate content.',
            icon: Minus,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
            },
        },
        {
            title: 'Image',
            description: 'Upload an image from your computer.',
            icon: ImageIcon,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                
                // Create a temporary input element
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                        const formData = new FormData()
                        formData.append('file', file)
                        const result = await uploadImage(formData)
                        
                        if (result.success && result.data) {
                            editor.chain().focus().setImage({ src: result.data.url }).run()
                        } else {
                            alert("Failed to upload image")
                        }
                    }
                }
                input.click()
            },
        },
    ]

    const [filteredItems, setFilteredItems] = useState(items)

    // Filter items based on query
    useEffect(() => {
        // props.query is passed by Tiptap's suggestion plugin
        const query = (props as any).query?.toLowerCase() || ''
        const filtered = items.filter((item) =>
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        )
        setFilteredItems(filtered)
        setSelectedIndex(0)
    }, [(props as any).query])

    const selectItem = useCallback(
        (index: number) => {
            const item = filteredItems[index]
            if (item) {
                props.command(item)
            }
        },
        [filteredItems, props]
    )

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + filteredItems.length - 1) % filteredItems.length)
                return true
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % filteredItems.length)
                return true
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex)
                return true
            }
            return false
        },
    }))

    if (filteredItems.length === 0) {
        return null
    }

    return (
        <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in slide-in-from-bottom-1">
            {filteredItems.map((item, index) => (
                <button
                    key={index}
                    className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
                        index === selectedIndex ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => selectItem(index)}
                >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-muted-foreground/20 bg-muted/50">
                        <item.icon className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="font-medium">{item.title}</span>
                        {item.description && (
                            <span className="text-xs text-muted-foreground">
                                {item.description}
                            </span>
                        )}
                    </div>
                </button>
            ))}
        </div>
    )
})

SlashCommandList.displayName = "SlashCommandList"
