// components/RichTextEditor.tsx
"use client"
import { useRef, useEffect, useCallback, memo } from "react"
import { EditorContent, useEditor, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapImage from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { FaBold, FaHeading, FaImage, FaItalic, FaLink, FaListOl, FaListUl, FaRedo, FaUndo } from "react-icons/fa"

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
  editorClassName?: string
  disabled?: boolean
  showHelperText?: boolean
}

interface MenuBarProps {
  editor: Editor | null
  onImageUpload: () => void
}

const ToolbarButton = memo(({ 
  onClick, 
  disabled, 
  isActive, 
  title, 
  icon: Icon,
  label 
}: { 
  onClick: (e: React.MouseEvent | React.PointerEvent) => void
  disabled?: boolean
  isActive?: boolean
  title: string
  icon: React.ComponentType<{ className?: string }>
  label?: string 
}) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onMouseDown={(e) => {
      e.preventDefault() // Prevent focus loss
      onClick(e)
    }}
    disabled={disabled}
    className={`${isActive ? "bg-blue-100 border-blue-300 text-blue-700" : ""} transition-all hover:bg-gray-100`}
    title={title}
  >
    <Icon className="h-4 w-4" />
    {label && <span className="ml-1 text-xs">{label}</span>}
  </Button>
))

ToolbarButton.displayName = "ToolbarButton"

const MenuBar = memo(({ editor, onImageUpload }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter link URL:", previousUrl)
    
    if (url === null) return
    
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    
    // Add https:// if no protocol specified
    const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
    editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run()
  }, [editor])

  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleHeading = useCallback((level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }, [editor])

  const setParagraph = useCallback(() => {
    editor.chain().focus().setParagraph().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor.chain().focus().toggleOrderedList().run()
  }, [editor])

  const undo = useCallback(() => {
    editor.chain().focus().undo().run()
  }, [editor])

  const redo = useCallback(() => {
    editor.chain().focus().redo().run()
  }, [editor])

  return (
    <div className="border border-gray-300 border-b-0 p-2 flex flex-wrap gap-2 bg-gray-50 rounded-t-md sticky top-0 z-10">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <ToolbarButton
          onClick={toggleBold}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
          icon={FaBold}
        />
        <ToolbarButton
          onClick={toggleItalic}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
          icon={FaItalic}
        />
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <ToolbarButton
          onClick={() => toggleHeading(1)}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
          icon={FaHeading}
          label="1"
        />
        <ToolbarButton
          onClick={() => toggleHeading(2)}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
          icon={FaHeading}
          label="2"
        />
        <ToolbarButton
          onClick={() => toggleHeading(3)}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
          icon={FaHeading}
          label="3"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault()
            setParagraph()
          }}
          className={editor.isActive("paragraph") ? "bg-blue-100 border-blue-300 text-blue-700" : ""}
          title="Paragraph"
        >
          <span className="text-xs font-medium">P</span>
        </Button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <ToolbarButton
          onClick={toggleBulletList}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
          icon={FaListUl}
        />
        <ToolbarButton
          onClick={toggleOrderedList}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
          icon={FaListOl}
        />
      </div>

      {/* Media & Links */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <ToolbarButton
          onClick={onImageUpload}
          title="Insert Image"
          icon={FaImage}
        />
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive("link")}
          title="Insert Link (Ctrl+K)"
          icon={FaLink}
        />
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={undo}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          icon={FaUndo}
        />
        <ToolbarButton
          onClick={redo}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          icon={FaRedo}
        />
      </div>
    </div>
  )
})

MenuBar.displayName = "MenuBar"

export const RichTextEditor: React.FC<RichTextEditorProps> = memo(({
  value = "",
  onChange,
  placeholder = "Start typing...",
  minHeight = "400px",
  className = "",
  editorClassName = "",
  disabled = false,
  showHelperText = true,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const isUpdatingRef = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc ml-6 my-2',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal ml-6 my-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'ml-1 pl-1',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-bold my-4',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'my-2',
          },
        },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none p-4 ${editorClassName}`,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (!isUpdatingRef.current) {
        const html = editor.getHTML()
        onChange?.(html)
      }
    },
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      isUpdatingRef.current = true
      const { from } = editor.state.selection
      editor.commands.setContent(value)
      
      // Restore cursor position
      try {
        editor.commands.focus(from)
      } catch (e) {
        editor.commands.focus('end')
      }
      
      isUpdatingRef.current = false
    }
  }, [value, editor])

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  const handleImageUpload = useCallback(() => {
    imageInputRef.current?.click()
  }, [])

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editor) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        e.target.value = ''
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file")
        e.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        editor.chain().focus().setImage({ src: base64 }).run()
      }
      reader.onerror = () => {
        alert("Failed to read image file")
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    e.target.value = ''
  }, [editor])

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .ProseMirror {
          min-height: ${minHeight};
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .ProseMirror a:hover {
          color: #1e40af;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1rem 0;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
      
      <MenuBar editor={editor} onImageUpload={handleImageUpload} />
      <div className="border border-gray-300 border-t-0 rounded-b-md bg-white overflow-auto">
        <EditorContent editor={editor} />
      </div>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />
      {showHelperText && (
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
          Tip: Use keyboard shortcuts for faster formatting - <strong>Ctrl+B</strong> (Bold), <strong>Ctrl+I</strong> (Italic)
        </p>
      )}
    </div>
  )
})

RichTextEditor.displayName = "RichTextEditor"

// Optional: Export a hook for accessing editor instance directly
export const useRichTextEditor = (initialContent = "") => {
  return useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc ml-6 my-2',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal ml-6 my-2',
          },
        },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: initialContent,
  })
}

// Export type for editor HTML content
export type EditorHTML = string