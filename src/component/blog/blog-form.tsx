"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBlog, updateBlog, getBlogById } from "@/services/blog";
import { toast } from "sonner";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import Loader from "../Loader";
import { RichTextEditor } from "../textEditor/text-Editor";

interface Blog {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}


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
  const editorRef = useRef<Editor | null>(null);
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const fetchBlog = async () => {
    if (!blogId) return;
    try {
      setLoading(true);
      const data = await getBlogById(blogId);
      const blog = data?.data || data;
      if (blog) {
        // Backend uses 'thumbnail' but frontend expects 'image'
        const imageUrl = blog.image || blog.thumbnail || "";
        setFormData({
          title: blog.title || "",
          content: blog.content || "",
          image: imageUrl,
          author: blog.author || "",
        });
        setImagePreview(imageUrl);
        if (editorRef.current) {
          editorRef.current.commands.setContent(blog.content || "");
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

  // Fetch blog when blogId is available
  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  // Update editor content when editor becomes ready (fallback if value prop doesn't work)
  useEffect(() => {
    if (blogId && editorRef.current && formData.content) {
      const currentContent = editorRef.current.getHTML().trim();
      const normalizedContent = formData.content.trim();
      
      // Only update if editor is empty and we have content (fallback for value prop)
      if (
        (currentContent === '' || currentContent === '<p></p>' || currentContent === '<p><br></p>') &&
        normalizedContent !== '' && 
        normalizedContent !== '<p></p>'
      ) {
        // Use a small delay to ensure editor is fully ready
        const timer = setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.commands.setContent(formData.content, { emitUpdate: false });
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [blogId, formData.content]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!formData.title.trim()) {
      toast.error("Please enter a blog title");
      return;
    }

    // Get the latest content from the editor (always prefer editor content)
    let finalContent = formData.content;
    if (editorRef.current) {
      const editorContent = editorRef.current.getHTML();
      // Use editor content if it exists and is not empty
      if (editorContent && editorContent.trim() !== '' && editorContent.trim() !== '<p></p>' && editorContent.trim() !== '<p><br></p>') {
        finalContent = editorContent;
      }
    }

    // Validate content - check if content is empty or just contains empty HTML tags
    const contentText = finalContent.replace(/<[^>]*>/g, '').trim();
    if (!contentText || contentText.length === 0) {
      toast.error("Please enter blog content");
      return;
    }

    // Validate token
    if (!token) {
      toast.error("You must be logged in to create a blog");
      return;
    }

    // Calculate content size before submission
    const contentSize = new Blob([finalContent]).size;
    const hasBase64Images = finalContent.includes('data:image');
    
    setIsSubmitting(true);
    try {
      let dataToSend: FormData | { title: string; content: string; author?: string; image?: string; imageUrl?: string };

      // Check content size - if content is large (>500KB), use FormData to avoid 413 errors
      const shouldUseFormData = imageFile || contentSize > 500 * 1024 || hasBase64Images;

      if (shouldUseFormData) {
        // Use FormData for large content or when there are images
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("content", finalContent);
        if (formData.author && formData.author.trim()) {
          formDataToSend.append("author", formData.author.trim());
        }
        if (imageFile) {
          formDataToSend.append("image", imageFile);
        } else if (formData.image && formData.image.trim()) {
          // If image is base64, we should convert it to a file or use imageUrl
          if (formData.image.startsWith('data:')) {
            // For base64 images, send as imageUrl if possible, or include in FormData
            // Note: Large base64 images should be uploaded separately
            formDataToSend.append("image", formData.image);
          } else {
            formDataToSend.append("imageUrl", formData.image);
          }
        }
        dataToSend = formDataToSend;
      } else {
        // Use JSON for smaller content
        const jsonData: { title: string; content: string; author?: string; image?: string; imageUrl?: string } = {
          title: formData.title.trim(),
          content: finalContent,
        };
        if (formData.author && formData.author.trim()) {
          jsonData.author = formData.author.trim();
        }
        if (formData.image && formData.image.trim()) {
          if (formData.image.startsWith('data:')) {
            // Warn if base64 image is too large
            const base64Size = formData.image.length;
            if (base64Size > 100 * 1024) { // > 100KB
              console.warn("Large base64 image detected, consider uploading separately");
            }
            jsonData.image = formData.image;
          } else {
            jsonData.imageUrl = formData.image;
          }
        }
        dataToSend = jsonData;
      }

      // Debug logging
      const contentSizeKB = Math.round(contentSize / 1024);
      console.log("Sending blog data:", {
        title: formData.title,
        hasContent: !!finalContent,
        contentLength: finalContent.length,
        contentSizeKB: `${contentSizeKB} KB`,
        contentPreview: finalContent.substring(0, 100),
        contentFromEditor: editorRef.current ? editorRef.current.getHTML().substring(0, 100) : "N/A",
        hasAuthor: !!formData.author,
        hasImage: !!(imageFile || formData.image),
        hasBase64Images: hasBase64Images,
        dataType: shouldUseFormData ? "FormData" : "JSON",
        hasToken: !!token,
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
      
      // Safely log error details
      if (err?.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error status:", err.response.status);
        if (err.response.headers) {
          try {
            console.error("Error headers:", err.response.headers);
          } catch (e) {
            // Headers might not be serializable, skip logging
          }
        }
      }
      
      // Extract error message safely
      let errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        err?.response?.data?.msg || 
        err?.message || 
        "Failed to save blog";
      
      // Handle 413 Payload Too Large error specifically
      if (err?.response?.status === 413) {
        errorMessage = "Content is too large. Please reduce image sizes or content length. " + 
          (errorMessage !== "Failed to save blog" ? errorMessage : "");
        console.error("Payload too large. Content size:", Math.round(contentSize / 1024), "KB");
        console.error("Tip: Consider removing large base64 images from content or uploading images separately");
      }
      
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
              key={blogId || "new-blog"}
              value={formData.content}
              onChange={(html) => setFormData({
                ...formData,
                content: html
              })}
              editorRef={editorRef}
              placeholder="Enter blog content..."
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

