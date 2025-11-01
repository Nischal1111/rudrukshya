"use client"

import { useState } from "react"
import Gallery from "@/component/gallery/gallery"
import UploadForm from "@/component/gallery/upload-form"

export default function Home() {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadId, setUploadId] = useState<string>("")
  const [refreshGallery, setRefreshGallery] = useState(0)
  console.log("Gallery refresh key:", )

  const handleUploadSuccess = () => {
    setShowUpload(false)
    setRefreshGallery((prev) => prev + 1)
  }

  const handleUploadId = (id: string) => {
    setUploadId(id)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Media Gallery</h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            {showUpload ? "Hide Upload" : "Add Media"}
          </button>
        </div>

        {showUpload && (
          <div className="mb-8 p-6 bg-card border border-border rounded-lg">
            <UploadForm onSuccess={handleUploadSuccess} uploadId={uploadId} />
          </div>
        )}

        <Gallery key={refreshGallery} sendUploadId={handleUploadId}  />
      </div>
    </main>
  )
}
