"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaTrash, FaEdit, FaInfoCircle } from "react-icons/fa";
import { getBannerByName, createBanner, deleteBannerImage, updateBanner } from "@/services/banner";
import Loader from "../Loader";
import { toast } from "sonner";

interface Banner {
  name: string;
  images: string[];
  videos?: string[];
}

interface BannerSection {
  name: string;
  displayName: string;
  type: "home" | "page";
  description: string;
}

const BANNER_SECTIONS: BannerSection[] = [
  {
    name: "home",
    displayName: "Home Page Banner",
    type: "home",
    description: "Hero section - Must have exactly 3 images (images only, no videos). Recommended aspect ratio: 16:9",
  },
  {
    name: "rudraksha",
    displayName: "Rudraksha Page Banner",
    type: "page",
    description: "Must have exactly 1 image OR 1 video file OR 1 YouTube link. Recommended aspect ratio: 1200:500",
  },
  {
    name: "mala",
    displayName: "Mala Page Banner",
    type: "page",
    description: "Must have exactly 1 image OR 1 video file OR 1 YouTube link. Recommended aspect ratio: 1200:500",
  },
  {
    name: "bracelet",
    displayName: "Bracelet Page Banner",
    type: "page",
    description: "Must have exactly 1 image OR 1 video file OR 1 YouTube link. Recommended aspect ratio: 1200:500",
  },
  {
    name: "exclusive",
    displayName: "Exclusive Page Banner",
    type: "page",
    description: "Must have exactly 1 image OR 1 video file OR 1 YouTube link. Recommended aspect ratio: 1200:500",
  },
  {
    name: "consultation",
    displayName: "Consultation Page Banner",
    type: "page",
    description: "Must have exactly 1 image OR 1 video file OR 1 YouTube link. Recommended aspect ratio: 1200:500",
  },
  {
    name: "contact",
    displayName: "Contact Page Banner",
    type: "page",
    description: "Must have exactly 1 image OR 1 video file OR 1 YouTube link. Recommended aspect ratio: 1200:500",
  },
];

export default function BannerManagement() {
  const [banners, setBanners] = useState<Record<string, Banner>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<{ name: string; imageUrl: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanner = async (name: string) => {
    try {
      const data = await getBannerByName(name);
      // Always set the banner, even if empty array is returned
      if (Array.isArray(data)) {
        const validMedia = data.filter((item) => item && item.trim() !== "");
        
        setBanners((prev) => ({
          ...prev,
          [name]: { name, images: validMedia },
        }));
      }
    } catch (err: any) {
      // Handle any errors by initializing empty banner
        console.error("Error fetching banner:", err);
      setBanners((prev) => ({
        ...prev,
        [name]: { name, images: [] },
      }));
    }
  };

  const fetchAllBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all predefined banners
      await Promise.all(
        BANNER_SECTIONS.map((section) => fetchBanner(section.name))
      );
    } catch (err: any) {
      console.error("Error fetching banners:", err);
      setError(err?.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBanners();
  }, []);

  const getBannerForSection = (sectionName: string): Banner => {
    return banners[sectionName] || { name: sectionName, images: [] };
  };

  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith("video/");
  };

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, sectionName: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const section = BANNER_SECTIONS.find((s) => s.name === sectionName);
    if (!section) return;

    const currentBanner = getBannerForSection(sectionName);
    const currentMedia = currentBanner.images || [];

    if (section.type === "home") {
      // Home: exactly 3 images, images only
      const imageFiles = files.filter(isImageFile);
      const videoFiles = files.filter(isVideoFile);

      if (videoFiles.length > 0) {
        toast.error("Home page banner only accepts images, not videos");
        return;
      }

      if (imageFiles.length === 0) {
        toast.error("Please select image files only");
        return;
      }

      const totalImages = currentMedia.length + imageFiles.length;
      if (totalImages > 3) {
        toast.error(`Home page banner must have exactly 3 images. Currently has ${currentMedia.length}, you can add ${3 - currentMedia.length} more.`);
        return;
      }

      if (totalImages < 3 && currentMedia.length + imageFiles.length < 3) {
        toast.warning(`Home page banner requires exactly 3 images. You've selected ${imageFiles.length}, but need ${3 - currentMedia.length} more.`);
      }

      setSelectedFiles(imageFiles);
    } else {
      // Page: exactly 1 image OR 1 video
      if (files.length > 1) {
        toast.error(`${section.displayName} can only have 1 image OR 1 video`);
        return;
      }

      const file = files[0];
      const isVideo = isVideoFile(file);
      const isImage = isImageFile(file);

      if (!isVideo && !isImage) {
        toast.error("Please select an image or video file");
      return;
    }

      // Check if current banner has media
      if (currentMedia.length > 0) {
        const currentIsVideo = currentMedia[0]?.match(/\.(mp4|webm|ogg|mov)$/i) || currentMedia[0]?.includes("video");
        if ((isVideo && !currentIsVideo) || (!isVideo && currentIsVideo)) {
          toast.warning("This will replace the existing media. Make sure you want to change the type.");
        }
      }

      setSelectedFiles([file]);
    }
    
    // Create previews
    const previews: string[] = [];
    const filesToPreview = section.type === "home" ? files.filter(isImageFile) : files;
    
    filesToPreview.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.trim() !== "") {
          previews.push(result);
        }
        if (previews.length === filesToPreview.length) {
          setFilePreviews(previews);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
        if (previews.length === filesToPreview.length) {
          setFilePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (sectionName: string) => {
    const section = BANNER_SECTIONS.find((s) => s.name === sectionName);
    if (!section) return;

    const currentBanner = getBannerForSection(sectionName);
    const currentMedia = currentBanner.images || [];

    // Validation
    if (section.type === "home") {
      // Home: exactly 3 images (files only, no YouTube)
      if (youtubeLinks.length > 0) {
        toast.error("Home page banner does not support YouTube links");
      return;
    }

    if (selectedFiles.length === 0) {
        toast.error("Please select 3 image files");
        return;
      }

      const imageFiles = selectedFiles.filter(isImageFile);
      const totalImages = currentMedia.length + imageFiles.length;

      if (totalImages !== 3) {
        toast.error(`Home page banner must have exactly 3 images. You have ${currentMedia.length} existing and ${imageFiles.length} new, totaling ${totalImages}. Please ensure total is exactly 3.`);
        return;
      }

      const hasVideos = selectedFiles.some(isVideoFile);
      if (hasVideos) {
        toast.error("Home page banner only accepts images, not videos");
        return;
      }
    } else {
      // Page: exactly 1 image OR 1 video file OR 1 YouTube link
      const totalMedia = selectedFiles.length + youtubeLinks.length;
      
      if (totalMedia === 0) {
        toast.error(`${section.displayName} must have exactly 1 image, 1 video file, or 1 YouTube link`);
      return;
    }

      if (totalMedia > 1) {
        toast.error(`${section.displayName} can only have 1 media item`);
      return;
      }

      if (selectedFiles.length === 1) {
        const file = selectedFiles[0];
        if (!isImageFile(file) && !isVideoFile(file)) {
          toast.error("Please select an image or video file");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Determine if we're replacing or adding
      if (section.type === "home") {
        // For home: if selected files = 3, replace all. Otherwise, add to existing.
        if (selectedFiles.length === 3) {
          // Replacing all 3 images
          await updateBanner(sectionName, selectedFiles);
        } else {
          // Adding to existing images (must total exactly 3)
          await createBanner(sectionName, selectedFiles);
        }
      } else {
        // For page banners: always replace (since it's always exactly 1)
        if (currentMedia.length > 0) {
          await updateBanner(sectionName, selectedFiles, youtubeLinks);
        } else {
          await createBanner(sectionName, selectedFiles, youtubeLinks);
        }
      }

      toast.success(`${section.displayName} updated successfully`);
      setSelectedFiles([]);
      setFilePreviews([]);
      setYoutubeLinks([]);
      setYoutubeLinkInput("");
      setOpenDialog(null);
      await fetchBanner(sectionName);
    } catch (err: any) {
      console.error("Error saving banner:", err);
      toast.error(err?.response?.data?.message || "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedia = async (name: string, mediaUrl: string) => {
    try {
      await deleteBannerImage(name, mediaUrl);
      toast.success("Media deleted successfully");
      setOpenDeleteDialog(null);
      await fetchBanner(name);
    } catch (err: any) {
      console.error("Error deleting media:", err);
      toast.error(err?.response?.data?.message || "Failed to delete media");
    }
  };

  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeYouTubeLink = () => {
    setYoutubeLinks([]);
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setYoutubeLinks([]);
    setYoutubeLinkInput("");
  };

  const handleAddYouTubeLink = (sectionName: string) => {
    const section = BANNER_SECTIONS.find((s) => s.name === sectionName);
    if (!section) return;

    if (section.type === "home") {
      toast.error("Home page banner does not support YouTube links");
      return;
    }

    if (!youtubeLinkInput.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(youtubeLinkInput.trim())) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    const currentBanner = getBannerForSection(sectionName);
    const currentMedia = currentBanner.images || [];

    // Check if we already have media
    if (currentMedia.length > 0 || selectedFiles.length > 0 || youtubeLinks.length > 0) {
      toast.error("You can only have 1 media item. Please remove existing media first.");
      return;
    }

    setYoutubeLinks([youtubeLinkInput.trim()]);
    setYoutubeLinkInput("");
  };

  const getMediaType = (url: string): "image" | "video" | "youtube" => {
    if (isValidYouTubeUrl(url)) return "youtube";
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("video") ? "video" : "image";
  };

  const getFullUrl = (mediaUrl: string): string => {
    if (mediaUrl.startsWith("http")) {
      return mediaUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const cleanBaseUrl = baseUrl.replace("/api", "").replace(/\/$/, "");
    const cleanMediaUrl = mediaUrl.startsWith("/") ? mediaUrl : `/${mediaUrl}`;
    return `${cleanBaseUrl}${cleanMediaUrl}`;
  };

  if (loading) return <Loader />;
  if (error && Object.keys(banners).length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-500">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner Management</h1>
          <p className="text-gray-600">Manage banners for different pages with specific requirements</p>
        </div>

        <div className="space-y-6">
          {BANNER_SECTIONS.map((section) => {
            const banner = getBannerForSection(section.name);
            const media = banner.images || [];
            const isHome = section.type === "home";
            const isValid = isHome
              ? media.length === 3 && media.every((m) => getMediaType(m) === "image")
              : media.length === 1 && (getMediaType(media[0]) === "image" || getMediaType(media[0]) === "video" || getMediaType(media[0]) === "youtube");

            return (
              <div
                key={section.name}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  !isValid ? "border-2 border-yellow-300" : ""
                }`}
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {section.displayName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <FaInfoCircle className="text-blue-500 text-sm" />
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isValid && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {isHome
                            ? `Requires exactly 3 images (currently: ${media.length})`
                            : `Requires exactly 1 image or video (currently: ${media.length})`}
                        </span>
                      )}
                      <Dialog
                        open={openDialog === section.name}
                        onOpenChange={(open) => {
                          setOpenDialog(open ? section.name : null);
                          if (!open) {
                            resetForm();
                            setIsSubmitting(false);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FaEdit className="mr-2 h-4 w-4" />
                            {media.length > 0 ? "Edit" : "Add"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit {section.displayName}</DialogTitle>
                            <DialogDescription>{section.description}</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor={`file-${section.name}`} className="font-medium">
                                {isHome ? "Select Images" : "Select Image or Video"}
                              </Label>
                              <input
                                id={`file-${section.name}`}
                                type="file"
                                accept={isHome ? "image/*" : "image/*,video/*"}
                                multiple={isHome}
                                onChange={(e) => handleFileChange(e, section.name)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primaryColor file:text-white hover:file:bg-primaryColor/90"
                              />
                              {filePreviews.length > 0 && (
                                <div className={`grid gap-2 mt-2 ${isHome ? "grid-cols-3" : "grid-cols-1"}`}>
                                  {filePreviews.map((preview, index) => {
                                    const file = selectedFiles[index];
                                    const isVideo = file && isVideoFile(file);
                                    return (
                                      <div key={index} className="relative">
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                          {isVideo ? (
                                            <video
                                              src={preview}
                                              className="w-full h-full object-cover"
                                              controls
                                              muted
                                            />
                                          ) : (
                                            <Image
                                              src={preview}
                                              alt={`Preview ${index + 1}`}
                                              fill
                                              className="object-cover"
                                            />
                                          )}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-1 right-1 h-6 w-6 p-0"
                                          onClick={() => removePreview(index)}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {isHome
                                  ? `Selected: ${selectedFiles.length}/3 images required`
                                  : "Selected: 1 image or video required"}
                              </p>
                            </div>
                            {!isHome && (
                              <div className="space-y-2">
                                <Label htmlFor={`youtube-${section.name}`} className="font-medium">
                                  Or Enter YouTube Link
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    id={`youtube-${section.name}`}
                                    type="text"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={youtubeLinkInput}
                                    onChange={(e) => setYoutubeLinkInput(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => handleAddYouTubeLink(section.name)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Add
                                  </Button>
                                </div>
                                {youtubeLinks.length > 0 && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-blue-800">
                                        YouTube: {youtubeLinks[0]}
                                      </p>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeYouTubeLink}
                                        className="h-6 w-6 p-0 text-red-600"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setOpenDialog(null);
                                resetForm();
                              }}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSave(section.name)}
                              className="bg-primaryColor hover:bg-primaryColor/90"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Uploading..." : "Save"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {media.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No media uploaded yet. Click "Add" to upload.
                    </div>
                  ) : (
                    <div
                      className={`grid gap-4 ${
                        isHome ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-md"
                      }`}
                    >
                      {media.map((mediaUrl, index) => {
                        const mediaType = getMediaType(mediaUrl);
                        const fullUrl = getFullUrl(mediaUrl);
                        const isYouTube = mediaType === "youtube";
                        const getYouTubeEmbedUrl = (url: string) => {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                          const match = url.match(regExp);
                          const videoId = (match && match[2].length === 11) ? match[2] : null;
                          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0` : url;
                        };
                        return (
                          <div key={index} className="relative group">
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                              {isYouTube ? (
                                <iframe
                                  src={getYouTubeEmbedUrl(mediaUrl)}
                                  className="w-full h-full"
                                  allow="autoplay; encrypted-media"
                                  allowFullScreen
                                  title={`${section.displayName} YouTube video`}
                                />
                              ) : mediaType === "video" ? (
                                <video
                                  src={fullUrl}
                                  className="w-full h-full object-cover"
                                  controls
                                  muted
                                  onError={() => {
                                    console.error("Error loading video:", fullUrl);
                                    toast.error("Failed to load video");
                                  }}
                                />
                              ) : (
                                <Image
                                  src={fullUrl}
                                  alt={`${section.displayName} ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  onError={() => {
                                    console.error("Error loading image:", fullUrl);
                                    toast.error("Failed to load image");
                                  }}
                                />
                              )}
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      setOpenDeleteDialog({ name: section.name, imageUrl: mediaUrl })
                                    }
                                  >
                                    <FaTrash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete this{" "}
                                      {mediaType === "youtube" ? "YouTube link" : mediaType === "video" ? "video" : "image"}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border border-gray-300">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() =>
                                        openDeleteDialog &&
                                        handleDeleteMedia(openDeleteDialog.name, openDeleteDialog.imageUrl)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
