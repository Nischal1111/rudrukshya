"use client"

import { useState } from "react"

interface MediaItem {
  _id: string
  type: "image" | "youtube"
  url: string
}

interface MediaCardProps {
  media: MediaItem
  onDelete: () => Promise<void> | void
}

export default function MediaCard({ media, onDelete }: MediaCardProps) {
  const [deleting, setDeleting] = useState(false)

  const getYouTubeId = (url: string) => {
    // Match v=VIDEOID or youtu.be/VIDEOID
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/)
    return match?.[1] ?? null
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete?.()
    } finally {
      setDeleting(false)
    }
  }

  const isYouTube = media.type === "youtube"
  const youtubeId = isYouTube ? getYouTubeId(media.url) : null

  return (
    <div className="relative group rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-shadow">
      {isYouTube && youtubeId ? (
        <div className="w-full aspect-video bg-black flex items-center justify-center">
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
            alt="YouTube thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <img
          src={media.url || "/placeholder.svg"}
          alt="Gallery media"
          className="w-full aspect-square object-cover"
        />
      )}

      {/* Overlay delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
      >
        <div className="flex flex-col items-center gap-2">
          {deleting ? (
            <>
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
              <span className="text-white text-sm">Deleting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-white text-sm">Delete</span>
            </>
          )}
        </div>
      </button>
    </div>
  )
}
