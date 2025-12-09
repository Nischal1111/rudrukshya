"use client";

import { use } from "react";
import BlogDetail from "@/component/blog/blog-detail";

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BlogDetail id={id} />;
}

