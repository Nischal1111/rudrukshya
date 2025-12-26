"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaBold, FaItalic, FaListUl, FaListOl, FaHeading, FaImage, FaLink, FaUndo, FaRedo } from "react-icons/fa";
import { createBlog, updateBlog, getBlogById } from "@/services/blog";
import { toast } from "sonner";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import Loader from "../Loader";
import { RichTextEditor } from "../textEditor/text-Editor";
import { form } from "@heroui/theme";

interface Blog {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any; onImageUpload: () => void }) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl);
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-gray-50">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
          title="Bold"
        >
          <FaBold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
          title="Italic"
        >
          <FaItalic className="h-4 w-4" />
        </Button>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }, 0);
          }}
          className={editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}
          title="Heading 1"
        >
          <FaHeading className="h-4 w-4" /> H1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }, 0);
          }}
          className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}
          title="Heading 2"
        >
          <FaHeading className="h-4 w-4" /> H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }, 0);
          }}
          className={editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""}
          title="Heading 3"
        >
          <FaHeading className="h-4 w-4" /> H3
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              editor.chain().focus().setParagraph().run();
            }, 0);
          }}
          className={editor.isActive("paragraph") ? "bg-gray-200" : ""}
          title="Paragraph"
        >
          P
        </Button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              editor.chain().focus().toggleBulletList().run();
            }, 0);
          }}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          title="Bullet List"
        >
          <FaListUl className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              editor.chain().focus().toggleOrderedList().run();
            }, 0);
          }}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          title="Numbered List"
        >
          <FaListOl className="h-4 w-4" />
        </Button>
      </div>

      {/* Media & Links */}
      <div className="flex gap-1 border-r border-gray-300 pr-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onImageUpload();
          }}
          title="Insert Image"
        >
          <FaImage className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            addLink();
          }}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
          title="Insert Link"
        >
          <FaLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <FaUndo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <FaRedo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface BlogFormProps {
  blogId?: string;
}

export default function BlogForm({ blogId }: BlogFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Blog>({
    title: "",
    content: "",
    image: "",
    author: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!blogId);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const editor = useEditor({
    immediatelyRender: false,
    editable: true,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  useEffect(() => {
    if (blogId && editor) {
      fetchBlog();
    }
  }, [blogId, editor]);

  const fetchBlog = async () => {
    if (!blogId) return;
    try {
      setLoading(true);
      const data = await getBlogById(blogId);
      const blog = data?.data || data;
      if (blog) {
        setFormData({
          title: blog.title || "",
          content: blog.content || "",
          image: blog.image || "",
          author: blog.author || "",
        });
        setImagePreview(blog.image || "");
        if (editor) {
          editor.commands.setContent(blog.content || "");
        }
      }
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      toast.error("Failed to fetch blog");
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditorImageUpload = () => {
    editorImageInputRef.current?.click();
  };

  const handleEditorImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {


    setIsSubmitting(true);
    try {
      let dataToSend: FormData | { title: string; content: string; author?: string; image?: string; imageUrl?: string };

      // If there's an image file, use FormData
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("content", formData.content);
        if (formData.author && formData.author.trim()) {
          formDataToSend.append("author", formData.author.trim());
        }
        formDataToSend.append("image", imageFile);
        dataToSend = formDataToSend;
      } else {
        // Otherwise, send as JSON
        const jsonData: { title: string; content: string; author?: string; image?: string; imageUrl?: string } = {
          title: formData.title.trim(),
          content: formData.content,
        };
        if (formData.author && formData.author.trim()) {
          jsonData.author = formData.author.trim();
        }
        if (formData.image && formData.image.trim()) {
          if (formData.image.startsWith('data:')) {
            jsonData.image = formData.image;
          } else {
            jsonData.imageUrl = formData.image;
          }
        }
        dataToSend = jsonData;
      }

      // Debug logging
      console.log("Sending blog data:", {
        title: formData.title,
        hasContent: !!formData.content,
        contentLength: formData.content.length,
        hasAuthor: !!formData.author,
        hasImage: !!(imageFile || formData.image),
        dataType: imageFile ? "FormData" : "JSON",
      });

      if (blogId) {
        await updateBlog(blogId, dataToSend, token);
        toast.success("Blog updated successfully");
      } else {
        await createBlog(dataToSend, token);
        toast.success("Blog created successfully");
      }
      router.push("/blog");
    } catch (err: any) {
      console.error("Error saving blog:", err);
      console.error("Error response:", err?.response?.data);
      console.error("Error status:", err?.response?.status);
      console.error("Error headers:", err?.response?.headers);
      const errorMessage = err?.message || err?.response?.data?.message || err?.response?.data?.error || err?.response?.data?.msg || "Failed to save blog";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full bg-gray-50 p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {blogId ? "Edit Blog" : "Create New Blog"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter blog title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="font-medium">
              Author
            </Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="font-medium">
              Featured Image
            </Label>
            <Input
              ref={imageInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-2">
                <NextImage
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="font-medium">
              Content *
            </Label>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData({
                ...formData,
                content: html
              })}
              placeholder="Enter event description..."
              minHeight="300px"
            />
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/blog")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primaryColor hover:bg-primaryColor/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (blogId ? "Updating..." : "Creating...") : (blogId ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

