"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import MediaCard from "./media-card"
import PaginationControls from "./pagination-controls"
import { toast } from "sonner"

interface MediaItem {
  _id: string
  type: "image" | "youtube"
  url: string
}

interface Upload {
  _id: string
  gallery: {
    image: MediaItem[]
    youtube: MediaItem[]
  }
  createdAt: string
  updatedAt: string
}

interface GalleryProps {
  sendUploadId?: (id: string) => void
}

interface GalleryResponse {
  success: boolean
  data: Upload[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUploads: number
    limit: number
  }
}

export default function Gallery({ sendUploadId }: GalleryProps) {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGallery()
  }, [page])

  const fetchGallery = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get<GalleryResponse>(`${process.env.NEXT_PUBLIC_BASE_URL}/gallery`, {
        params: { page },
      })

      const { data, pagination } = response.data
      sendUploadId?.(data[0]?._id || "")
      setUploads(data)
      setTotalPages(pagination.totalPages)
    } catch (err) {
      console.error("Failed to load gallery:", err)
      setError("Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (uploadId: string, mediaId: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${uploadId}/media/${mediaId}`)
    toast.success("Media deleted successfully")
      fetchGallery()
    } catch (err) {
      console.error("Failed to delete media:", err)
    }
  }

  if (loading && uploads.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
  }

  if (!uploads || uploads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No media uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {uploads.map((upload) => (
        <div key={upload._id} className="space-y-4">
          {/* Image Gallery */}
          {upload.gallery.image.length > 0 && (
            <>
              <h3 className="text-base font-semibold">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {upload.gallery.image.map((media) => (
                  <MediaCard
                    key={media._id}
                    media={media}
                    onDelete={() => handleDeleteMedia(upload._id, media._id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* YouTube Gallery */}
          {upload.gallery.youtube.length > 0 && (
            <>
              <h3 className="text-base font-semibold mt-4">YouTube Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upload.gallery.youtube.map((media) => (
                  <MediaCard
                    key={media._id}
                    media={media}
                    onDelete={() => handleDeleteMedia(upload._id, media._id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-8">
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
