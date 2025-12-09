"use client";

import { useState, useEffect } from "react";
import { getBlogById } from "@/services/blog";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Loader from "../Loader";
import { toast } from "sonner";

interface Blog {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogDetail({ id }: { id: string }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await getBlogById(id);
      if (data?.data) {
        setBlog(data.data);
      } else if (data) {
        setBlog(data);
      }
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      toast.error("Failed to fetch blog");
      router.push("/blogs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-8 text-primaryColor hover:underline font-medium"
        >
          ← Back to Blogs
        </button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {blog.image && (
            <div className="relative h-96 w-full">
              <img
                src={blog.image.startsWith('data:') ? blog.image : blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b border-gray-200 pb-6">
                {blog.author && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">By {blog.author}</span>
                  </div>
                )}
                {blog.createdAt && (
                  <div className="flex items-center gap-2">
                    <time dateTime={blog.createdAt}>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                )}
              </div>
            </header>

            <div
              className="blog-prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: blog.content?.replace(/<img([^>]*src=")([^"]*)(")/g, (match, p1, src, p3) => {
                  // Decode base64 images if needed
                  if (src.startsWith('data:')) {
                    return match;
                  }
                  // If image is base64 encoded, ensure it's properly formatted
                  return p1 + src + p3;
                }) || ""
              }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}

