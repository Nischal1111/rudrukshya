"use client"

import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"

interface UploadFormProps {
  onSuccess: () => void
  uploadId?: string // optional: if provided, add media to this upload
}

interface YouTubeInput {
  id: string
  url: string
}

export default function UploadForm({ onSuccess, uploadId }: UploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [youtubeUrls, setYoutubeUrls] = useState<YouTubeInput[]>([{ id: "1", url: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedFiles.length > 20) {
      setError("Maximum 20 images allowed")
      return
    }
    setError(null)
    setSelectedFiles([...selectedFiles, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleYoutubeUrlChange = (id: string, value: string) => {
    setYoutubeUrls(youtubeUrls.map((item) => (item.id === id ? { ...item, url: value } : item)))
  }

  const handleAddYoutubeUrl = () => {
    setYoutubeUrls([...youtubeUrls, { id: Date.now().toString(), url: "" }])
  }

  const handleRemoveYoutubeUrl = (id: string) => {
    setYoutubeUrls(youtubeUrls.filter((item) => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)


    try {
      const formData = new FormData()

      selectedFiles.forEach((file) => {
        formData.append("images", file)
      })

      const validYoutubeUrls = youtubeUrls.map((item) => item.url).filter((url) => url.trim())
      validYoutubeUrls.forEach((url) => formData.append("youtubeUrls", url))

      if (selectedFiles.length === 0 && validYoutubeUrls.length === 0) {
        setError("Please select files or add YouTube URLs")
        return
      }

      if (uploadId) {
        // Add media to existing upload
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${uploadId}/media`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        // Create a new upload
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/uploads`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
       
      }
     toast.success("Media uploaded successfully")
      setSelectedFiles([])
      setYoutubeUrls([{ id: "1", url: "" }])
      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err) {
      console.error(err)
      setError("Failed to upload media")
    } finally {
      setLoading(false)
    }
  }

  return (
       <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Upload Images (Max 20)</label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div>
            <svg
              className="w-12 h-12 text-muted-foreground mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-foreground font-medium">Click or drag images here</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 20 files</p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs text-center text-white bg-black/30 py-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YouTube URLs Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-foreground">YouTube URLs</label>
          <button
            type="button"
            onClick={handleAddYoutubeUrl}
            className="text-sm px-2 py-1 bg-secondary text-secondary-foreground rounded hover:opacity-80 transition-opacity"
          >
            + Add URL
          </button>
        </div>

        <div className="space-y-2">
          {youtubeUrls.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={item.url}
                onChange={(e) => handleYoutubeUrlChange(item.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {youtubeUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveYoutubeUrl(item.id)}
                  className="px-3 py-2 text-destructive border border-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-semibold flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
            Uploading...
          </>
        ) : (
          "Upload Media"
        )}
      </button>
    </form>
  )
}
