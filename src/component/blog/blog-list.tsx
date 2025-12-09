"use client";

import { useState, useEffect } from "react";
import { getBlogs, getBlogById } from "@/services/blog";
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

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getBlogs(1, 100);
      if (data?.data && Array.isArray(data.data)) {
        setBlogs(data.data);
      } else if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
      }
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-lg text-gray-600">Latest articles and updates</p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/blogs/${blog._id}`)}
              >
                {blog.image && (
                  <div className="relative h-48 w-full">
                    <NextImage
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h2>
                  {blog.author && (
                    <p className="text-sm text-gray-500 mb-3">By {blog.author}</p>
                  )}
                  {blog.createdAt && (
                    <p className="text-xs text-gray-400 mb-4">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <div
                    className="text-gray-600 text-sm line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: blog.content?.substring(0, 150) + "..." || "",
                    }}
                  />
                  <button className="mt-4 text-primaryColor hover:underline font-medium">
                    Read more →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

