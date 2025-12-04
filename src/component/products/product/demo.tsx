"use client"

import { createProduct, singleProduct, updateProduct } from "@/services/product"
import type React from "react"
import { useState, useEffect } from "react"
import * as z from "zod"
import { type SubmitHandler, useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@heroui/button"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown"
import Image from "next/image"
import { SiTicktick } from "react-icons/si"
import { CiCirclePlus } from "react-icons/ci"
import { IoCloseCircle } from "react-icons/io5"
import { MdKeyboardArrowDown } from "react-icons/md"
import { toast } from "sonner"
import { getAllCategories } from "@/services/categories"
import { useParams, useRouter } from "next/navigation"
import { josefin } from "@/utils/font"
import { IoArrowBackOutline } from "react-icons/io5"
import { TailwindSwitch } from "@/components/ui/switch"

interface SubCategory {
  name: string
  _id: string
}

interface Category {
  name: string
  subCategories: SubCategory[]
  _id: string
}

interface Variant {
  _id: string
  name: string
  price: number
  stock: number
  imgUrl: string
}

interface Size {
  name: string
  price: number | null
  size: string
}

const schema = z.object({
  title: z.string().nonempty("Product title is required."),
  description: z.string().nonempty("Product description is required."),
  faces: z.string().nonempty("Please specify the number of faces."),
  country: z.string().nonempty("Country of origin is required."),
  price: z
    .string()
    .optional()
    .refine((val) => {
      // Allow empty string, undefined, or null - price is optional
      if (!val || val === "" || val === null || val === undefined) return true
      // If value exists, it must be a valid number >= 0
      const numVal = Number(val)
      return !isNaN(numVal) && numVal >= 0
    }, {
      message: "Price must be a valid number (0 or more).",
    }),
  stock: z
    .string()
    .nonempty("Stock quantity is required.")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stock must be a valid number (0 or more).",
    }),
  isSale: z.string().optional().nullable(),
  isSpecial: z.string().optional().nullable(),
  isExclusive: z.string().optional().nullable(),
  isTopSelling: z.string().optional().nullable(),
  isLabCertified: z.string().optional().nullable(),
  isExpertVerified: z.string().optional().nullable(),
  category: z.string().nonempty("Product category is required."),
  subCategory: z.string().optional(),
  img: z
    .array(z.any())
    .min(1, "At least one product image is required."),
  keywords: z
    .array(z.string())
    .optional()
    .default([]),
  benefits: z
    .array(z.string())
    .optional()
    .default([]),
  discount: z
    .array(
      z.object({
        title: z.string().nonempty("Discount title is required."),
        percentage: z
          .number()
          .min(1, "Discount must be at least 1%.")
          .max(100, "Discount cannot exceed 100%."),
      })
    )
    .optional(),
  weightSizeOptions: z
    .array(
      z.object({
        weight: z.number().default(0),
        size: z.string().nonempty("Size is required."),
      })
    )
    .optional()
    .default([]),
  variants: z.array(z.string()).optional().default([]),
  defaultVariant: z.string().optional(),
});

export type formFields = z.infer<typeof schema>

const Demo: React.FC = () => {
  const router = useRouter()
  const [page, setPage] = useState<boolean>(false)
  const params = useParams<{ id: string }>()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<formFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: "",
      weightSizeOptions: [],
    },
  })
  const [removedImages, setRemovedImages] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [productImages, setProductImages] = useState<string[]>([])
  const [selectImage, setSelectImage] = useState<string>("")
  const [subCategory, setSubCategory] = useState<Category[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategory[]>([])
  const [diableDiscountAdd, setDiableDiscountAdd] = useState<boolean>(false)

  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState<string>("")
  const [benefits, setBenefits] = useState<string[]>([])
  const [benefitInput, setBenefitInput] = useState<string>("")
  const [weightSizeOptions, setWeightSizeOptions] = useState<{ weight: number; size: string }[]>([])
  const [sizeInput, setSizeInput] = useState<string>("")
  const [discounts, setDiscounts] = useState<{ title: string; percentage: number }[]>([])
  const [discountTitle, setDiscountTitle] = useState<string>("")
  const [discountPercentage, setDiscountPercentage] = useState<string>("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set())
  const [defaultVariant, setDefaultVariant] = useState<string>("")
  const [sizes, setSizes] = useState<Size[]>([])
  const [newSizeName, setNewSizeName] = useState<string>("")
  const [newSizePrice, setNewSizePrice] = useState<string>("")
  const [newSizeMm, setNewSizeMm] = useState<string>("")
  const [contactForPrice, setContactForPrice] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [editingDiscountIndex, setEditingDiscountIndex] = useState<number | null>(null)

  // Watch the image field to handle the selected images
  const watchImages = watch("img", [])
  const selectedCategory = watch("category")

  useEffect(() => {
    // Reset subcategory value when category changes
    setValue("subCategory", "")

    const foundCategory = subCategory.find((cat) => cat?.name === selectedCategory)
    if (foundCategory) {
      setSubCategoryOptions(foundCategory ? foundCategory.subCategories : [])
    } else {
      setSubCategoryOptions([])
    }

    console.log("Category changed to:", selectedCategory)
    console.log("Found category:", foundCategory)
  }, [selectedCategory, subCategory, setValue])

  // Handle the image selection
  const handleSelectImage = (index: number): void => {
    setSelectImage(watchImages[index])
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
  if (e.target.files && e.target.files.length > 0) {
    const files = Array.from(e.target.files)
    
    if (productImages.length + files.length > 4) {
      toast.error("You can only upload a maximum of 4 images.")
      return
    }

    const fileUrls = files.map((file) => URL.createObjectURL(file))

    setUploadedFiles((prev) => [...prev, ...files])
    setProductImages((prev) => [...prev, ...fileUrls])
    setValue("img", [...productImages, ...fileUrls]) // Use productImages instead of watchImages
  }
}

  const handleRemoveImage = (indexToRemove: number): void => {
  const imageToRemove = productImages[indexToRemove]

  if (imageToRemove.startsWith("http")) {
    setRemovedImages((prev) => [...prev, imageToRemove])
  } else {
    // For newly uploaded files, we need to find and remove the corresponding file
    // Count how many http images come before this index
    const httpImagesBefore = productImages.slice(0, indexToRemove).filter(img => img.startsWith("http")).length
    const fileIndexToRemove = indexToRemove - httpImagesBefore
    
    const newFiles = uploadedFiles.filter((_, i) => i !== fileIndexToRemove)
    setUploadedFiles(newFiles)
  }

  const newImages = productImages.filter((_, i) => i !== indexToRemove)
  setProductImages(newImages)
  setValue("img", newImages)
  
  if (selectImage === imageToRemove) {
    setSelectImage(newImages[0] || "")
  }
}

  useEffect(() => {
    if (productImages.length > 0) {
      setSelectImage(productImages[0]) // Set first image as default
    } else {
      setSelectImage("") // Reset selection if no images
    }
  }, [productImages])

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      const newKeywords = [...keywords, keywordInput.trim()]
      setKeywords(newKeywords)
      setValue("keywords", newKeywords)
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index)
    setKeywords(newKeywords)
    setValue("keywords", newKeywords)
  }

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      const newBenefits = [...benefits, benefitInput.trim()]
      setBenefits(newBenefits)
      setValue("benefits", newBenefits)
      setBenefitInput("")
    }
  }

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index)
    setBenefits(newBenefits)
    setValue("benefits", newBenefits)
  }

  const handleAddWeightSize = () => {
    const size = sizeInput.trim()
    
    if (size) {
      // Ensure "mm" is included in the size value
      const sizeWithUnit = size.toLowerCase().includes('mm') ? size : `${size} mm`
      const newWeightSizeOptions = [
        ...weightSizeOptions,
        { weight: 0, size: sizeWithUnit },
      ]
      setWeightSizeOptions(newWeightSizeOptions)
      setValue("weightSizeOptions", newWeightSizeOptions)
      setSizeInput("")
    } else {
      toast.error("Please enter a valid size value")
    }
  }

  const handleRemoveWeightSize = (index: number) => {
    const newWeightSizeOptions = weightSizeOptions.filter((_, i) => i !== index)
    setWeightSizeOptions(newWeightSizeOptions)
    setValue("weightSizeOptions", newWeightSizeOptions)
  }

  const handleAddDiscount = () => {
  if (discountTitle.trim() && discountPercentage) {
    if (editingDiscountIndex !== null) {
      // Update existing discount
      const newDiscounts = [...discounts]
      newDiscounts[editingDiscountIndex] = { 
        title: discountTitle.trim(), 
        percentage: Number(discountPercentage) 
      }
      setDiscounts(newDiscounts)
      setValue("discount", newDiscounts)
      setEditingDiscountIndex(null)
    } else {
      // Add new discount
      const newDiscounts = [...discounts, { title: discountTitle.trim(), percentage: Number(discountPercentage) }]
      setDiscounts(newDiscounts)
      setValue("discount", newDiscounts)
      setDiableDiscountAdd(true)
    }
    setDiscountTitle("")
    setDiscountPercentage("")
  }
}

// Add function to start editing
const handleEditDiscount = (index: number) => {
  setEditingDiscountIndex(index)
  setDiscountTitle(discounts[index].title)
  setDiscountPercentage(String(discounts[index].percentage))
  setDiableDiscountAdd(false)
}

// Add function to cancel editing
const handleCancelEditDiscount = () => {
  setEditingDiscountIndex(null)
  setDiscountTitle("")
  setDiscountPercentage("")
  setDiableDiscountAdd(discounts.length > 0)
}

// Update handleRemoveDiscount
const handleRemoveDiscount = (index: number) => {
  const newDiscounts = discounts.filter((_, i) => i !== index)
  setDiableDiscountAdd(false)
  setDiscounts(newDiscounts)
  setValue("discount", newDiscounts)
  
  // If we were editing this discount, cancel the edit
  if (editingDiscountIndex === index) {
    setEditingDiscountIndex(null)
    setDiscountTitle("")
    setDiscountPercentage("")
  }
}

  const handleAddSize = () => {
    if (newSizeName.trim() || newSizePrice || newSizeMm.trim()) {
      // Ensure "mm" is included in the size value
      const sizeMm = newSizeMm.trim()
      const sizeWithUnit = sizeMm.toLowerCase().includes('mm') ? sizeMm : `${sizeMm} mm`
      const newSizes = [...sizes, { 
        name: newSizeName.trim(), 
        price: newSizePrice ? Number(newSizePrice): null, 
        size: newSizeMm?sizeWithUnit: ""
      }]
      setSizes(newSizes)
      setNewSizeName("")
      setNewSizePrice("")
      setNewSizeMm("")
    }
  }

  const handleRemoveSize = (index: number) => {
    const newSizes = sizes.filter((_, i) => i !== index)
    setSizes(newSizes)
  }

  const fetchVariants = async (): Promise<void> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_BASE_URL is not set")
        return
      }

      const response = await fetch(`${apiUrl}/variant/get`)
      if (!response.ok) {
        throw new Error("Failed to fetch variants")
      }
      const data = await response.json()
      setVariants(data.data)
      console.log("[v0] Fetched variants:", data)
    } catch (error) {
      console.error("Failed to fetch variants:", error)
      toast.error("Failed to fetch variants")
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      if (productImages.length + imageFiles.length > 4) {
        toast.error("You can only upload a maximum of 4 images.")
        return
      }

      const fileUrls = imageFiles.map((file) => URL.createObjectURL(file))
      setUploadedFiles((prev) => [...prev, ...imageFiles])
      setProductImages((prev) => [...prev, ...fileUrls])
      setValue("img", [...watchImages, ...fileUrls])
    }
  }

  const onSubmit: SubmitHandler<formFields> = async (data) => {
    try {
      setIsLoading(true)

      console.log("Form data:", data)
      console.log("Form errors:", errors)

      if(subCategoryOptions.length > 0 && !data.subCategory){
        toast.error("Add at least one Sub Category")
        setIsLoading(false)
        return
      }

      // Validate price: either price > 0 or contactForPrice toggle is on
      const price = Number(data.price) || 0
      if (!contactForPrice && price <= 0) {
        toast.error("Please enter a valid price (> 0) or enable 'Contact for Price'")
        setIsLoading(false)
        return
      }

      if (uploadedFiles.length === 0 && productImages.length === 0) {
        toast.error("Please upload at least one image")
        setIsLoading(false)
        return
      }

      const formData = new FormData()

      // Type-safe way to append form data
      ;(Object.keys(data) as Array<keyof formFields>).forEach((key) => {
        if (key !== "img" && key !== "keywords" && key !== "benefits" && key !== "discount" && key !== "variants" && key !== "weightSizeOptions") {
          const value = data[key]
          // Convert all values to strings, handle price specially
          if (key === "price") {
            // If contactForPrice is enabled, send empty string, otherwise send the price
            if (contactForPrice) {
              formData.append(key, "")
            } else {
              formData.append(key, value && value !== "" ? String(value) : "")
            }
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        }
      })

      if (sizes.length > 0) {
        formData.append("size", JSON.stringify(sizes))
      }

      if (keywords.length > 0) {
        formData.append("keywords", JSON.stringify(keywords))
      }
      if (benefits.length > 0) {
        formData.append("benefits", JSON.stringify(benefits))
      }
      if (weightSizeOptions.length > 0) {
        // Ensure weight is always 0 for all options
        const formattedOptions = weightSizeOptions.map(option => ({
          weight: 0,
          size: option.size
        }))
        formData.append("weightSizeOptions", JSON.stringify(formattedOptions))
      }
      if (discounts.length > 0) {
        formData.append("discount", JSON.stringify(discounts))
      }
      if (selectedVariants.size > 0) {
        formData.append("variants", JSON.stringify(Array.from(selectedVariants)))
      }
      // Append image files
      if (!page) {
        uploadedFiles.forEach((file) => {
          formData.append("img", file)
        })
        console.log(formData,"formdata")
        await createProduct(formData)
        toast.success("Product added successfully")
        router.push("/products")
        reset()
        productImages.forEach((url) => URL.revokeObjectURL(url))
        setIsLoading(false)

        return
      } else {
        formData.append("removedImages", JSON.stringify(removedImages))
        uploadedFiles.forEach((file) => {
          formData.append("imgFile", file)
        })
        await updateProduct(params.id, formData)
        toast.success("Product updated successfully")
        router.push("/products")
        productImages.forEach((url) => URL.revokeObjectURL(url))
        setIsLoading(false)

        return
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save product")
      setIsLoading(false)
    }
  }

  const fetchProduct = async (id: string): Promise<void> => {
    try {
      const data = await singleProduct(id)
      setValue("title", data.product.title)
      setValue("category", data.product.category)
      setValue("country", data.product.country)
      setValue("description", data.product.description)
      setValue("faces", data.product.faces)
      // Handle price - can be null, undefined, or a number
      if (data.product.price != null && data.product.price !== undefined && data.product.price > 0) {
        setValue("price", String(data.product.price))
        setContactForPrice(false)
      } else {
        setValue("price", "")
        setContactForPrice(true) // If no price or price is 0, assume contact for price
      }
      
      setValue("stock", String(data.product.stock))
      setValue("img", data.product.img)
      setValue("subCategory", data.product.subCategory)
      setProductImages(data.product.img)
      setSelectImage(data.product.img[0])

      // Set boolean fields
      // setValue("isSale", data.product.isSale ? "True" : "False")
      setValue("isSale", data.product.isSale ? "True" : "False")
      setValue("isExclusive", data.product.isExclusive ? "True" : "False")
      setValue("isSpecial", data.product.isSpecial ? "True" : "False")
      setValue("isTopSelling", data.product.isTopSelling ? "True" : "False")
      setValue("isLabCertified", data.product.isLabCertified ? "True" : "False")
      setValue("isExpertVerified", data.product.isExpertVerified ? "True" : "False")
      setValue("subCategory", data.product.subCategory)

      if (data.product.size && Array.isArray(data.product.size)) {
        setSizes(data.product.size)
      }

      if (data.product.keywords) {
        setKeywords(data.product.keywords)
        setValue("keywords", data.product.keywords)
      }
      if (data.product.benefits) {
        setBenefits(data.product.benefits)
        setValue("benefits", data.product.benefits)
      }
      if (data.product.weightSizeOptions && Array.isArray(data.product.weightSizeOptions)) {
        // Ensure weightSizeOptions are in correct format with size as string and weight as 0
        const formattedOptions = data.product.weightSizeOptions.map((option: any) => ({
          weight: 0,
          size: typeof option.size === 'string' ? option.size : String(option.size || ''),
        })).filter((option: any) => option.size && option.size.trim() !== '')
        
        setWeightSizeOptions(formattedOptions)
        setValue("weightSizeOptions", formattedOptions)
      } else {
        setWeightSizeOptions([])
        setValue("weightSizeOptions", [])
      }
      if (data.product.discount) {
        if (data.product.discount.length === 1) {
          setDiableDiscountAdd(true)
        }
        setDiscounts(data.product.discount)
        setValue("discount", data.product.discount)
      }
      if (data.product.variants) {
        const variantIds = data.product.variants.map((v: any) => v._id || v)
        setSelectedVariants(new Set(variantIds))
        setValue("variants", variantIds)
      }
      if (data.product.defaultVariant) {
        const defaultId =
          typeof data.product.defaultVariant === "object"
            ? data.product.defaultVariant._id
            : data.product.defaultVariant
        setDefaultVariant(defaultId)
        setValue("defaultVariant", defaultId)
      }

      console.log(data)
    } catch (error) {
      console.error("Fetch failed:", error)
      toast.error("Failed to fetch product data")
    }
  }

  const fetchSubCategory = async (): Promise<void> => {
    try {
      const data = await getAllCategories()
      setSubCategory(data)
      console.log("Fetched categories:", data)

      // If category is already selected, update subcategory options
      if (selectedCategory) {
        const foundCategory = data.find((cat: any) => cat.name === selectedCategory)
        if (foundCategory) {
          setSubCategoryOptions(foundCategory.subCategories)
          console.log("Setting subcategories for", selectedCategory, foundCategory.subCategories)
        }
      }
    } catch (error) {
      console.error("Fetch failed:", error)
    }
  }

  useEffect(() => {
    if (params.id === "new") {
      setPage(false)
    } else {
      console.log(params)
      setPage(true)
      fetchProduct(params.id)
    }
    fetchSubCategory()
    fetchVariants()
  }, [params])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <button className="absolute top-2 text-4xl rounded-full" onClick={() => router.push("/products")}>
        <IoArrowBackOutline />
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-bold text-gray-800 ${josefin.className}`}>
            {page ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 mt-2">
            {page ? "Update your product information" : "Fill in the details to create a new product"}
          </p>
        </div>
        <Button
          className="bg-primaryColor absolute top-4 right-16 z-50 text-white rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 px-8 py-6 text-base font-medium"
          type="button"
          onClick={() => {
            const form = document.getElementById("product-form") as HTMLFormElement
            if (form) {
              form.requestSubmit()
            }
          }}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : page ? null : (
              <SiTicktick className="h-4 w-4" />
            )}
            {isLoading ? "Saving..." : page ? "Save Changes" : "Add Product"}
          </div>
        </Button>
      </div>

      <form 
        id="product-form"
        onSubmit={handleSubmit(
          onSubmit,
          (errors) => {
            console.error("Form validation errors:", errors)
            // Get the first error message
            const firstError = Object.values(errors)[0]
            if (firstError?.message) {
              toast.error(firstError.message)
            } else {
              // If no specific message, show which fields have errors
              const errorFields = Object.keys(errors).join(", ")
              toast.error(`Please fix errors in: ${errorFields}`)
            }
            // Scroll to first error field
            const firstErrorField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`) as HTMLElement
            if (firstErrorField) {
              firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
              firstErrorField.focus()
            }
          }
        )} 
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - General Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  General Information
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      placeholder="Enter your product name"
                      className={`bg-gray-50 w-full h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor ${
                        errors.title ? "border-red-500" : "border-gray-200"
                      }`}
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      placeholder="Enter your product description"
                      className={`bg-gray-50 rounded-xl px-4 py-3 scrollbar-hide w-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor ${
                        errors.description ? "border-red-500" : "border-gray-200"
                      }`}
                      rows={4}
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="faces" className="block text-sm font-semibold text-gray-700 mb-2">
                        Faces <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="faces"
                        type="number"
                        placeholder="Enter product faces"
                        className={`bg-gray-50 h-12 px-4 w-full rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor ${
                          errors.faces ? "border-red-500" : "border-gray-200"
                        }`}
                        {...register("faces")}
                      />
                      {errors.faces && (
                        <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.faces.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Country <span className="text-red-500">*</span>
                    </div>
                    <Controller
                      name="country"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              className={`capitalize w-full h-12 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                errors.country ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                              } text-gray-700 text-base font-medium shadow-sm flex items-center justify-between`}
                              variant="bordered"
                            >
                              <span>{field.value || "Select Country"}</span>
                              <MdKeyboardArrowDown className="text-gray-500" size={20} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            disallowEmptySelection
                            aria-label="Country selection"
                            selectedKeys={field.value ? new Set([field.value]) : undefined}
                            selectionMode="single"
                            variant="flat"
                            onSelectionChange={(keys) => {
                              const selectedValue = Array.from(keys)[0]
                              field.onChange(selectedValue)
                            }}
                          >
                            <DropdownItem key="nepal">Nepal</DropdownItem>
                            <DropdownItem key="indonesia">Indonesia</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      )}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Pricing and Stock
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                        Price
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                            $
                          </span>
                          <input
                            id="price"
                            type="string"
                            placeholder="0.00"
                            disabled={contactForPrice}
                            className={`bg-gray-50 h-12 px-4 pl-10 w-full rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor ${
                              errors.price ? "border-red-500" : "border-gray-200"
                            } ${contactForPrice ? "opacity-50 cursor-not-allowed" : ""}`}
                            {...register("price")}
                          />
                        </div>
                        <div className="flex items-center gap-2 px-3 h-12 bg-gray-50 rounded-xl border-2 border-gray-200">
                          <TailwindSwitch
                            checked={contactForPrice}
                            onCheckedChange={(checked) => {
                              setContactForPrice(checked)
                              if (checked) {
                                setValue("price", "")
                              }
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Contact for Price</span>
                        </div>
                      </div>
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.price.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="stock"
                        type="number"
                        placeholder="Enter product stock"
                        className={`bg-gray-50 h-12 px-4 w-full rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor ${
                          errors.stock ? "border-red-500" : "border-gray-200"
                        }`}
                        {...register("stock")}
                      />
                      {errors.stock && (
                        <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.stock.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Flags</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1.5">Sale</div>
                        <Controller
                          name="isSale"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-11 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.isSale ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-sm font-medium shadow-sm flex items-center justify-between`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={18} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Sale selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                <DropdownItem key="True">True</DropdownItem>
                                <DropdownItem key="False">False</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1.5">Exclusive</div>
                        <Controller
                          name="isExclusive"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-11 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.isExclusive ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-sm font-medium shadow-sm flex items-center justify-between`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={18} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Exclusive selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                <DropdownItem key="True">True</DropdownItem>
                                <DropdownItem key="False">False</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1.5">Special</div>
                        <Controller
                          name="isSpecial"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-11 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.isSpecial ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-sm font-medium shadow-sm flex items-center justify-between`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={18} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Special selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                <DropdownItem key="True">True</DropdownItem>
                                <DropdownItem key="False">False</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1.5">Top Selling</div>
                        <Controller
                          name="isTopSelling"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-11 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.isTopSelling ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-sm font-medium shadow-sm flex items-center justify-between`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={18} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Top Selling selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                <DropdownItem key="True">True</DropdownItem>
                                <DropdownItem key="False">False</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1.5">Lab Certified</div>
                        <Controller
                          name="isLabCertified"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-11 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.isLabCertified ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-sm font-medium shadow-sm flex items-center justify-between`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={18} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Lab Certified selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                <DropdownItem key="True">True</DropdownItem>
                                <DropdownItem key="False">False</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1.5">Expert Verified</div>
                        <Controller
                          name="isExpertVerified"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-11 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.isExpertVerified ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-sm font-medium shadow-sm flex items-center justify-between`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={18} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Expert Verified selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                <DropdownItem key="True">True</DropdownItem>
                                <DropdownItem key="False">False</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Size Options
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      className="bg-gray-50 h-12 px-4 flex-1 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={newSizePrice}
                        onChange={(e) => setNewSizePrice(e.target.value)}
                        className="bg-gray-50 h-12 px-4 pl-8 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Size (mm)"
                      value={newSizeMm}
                      onChange={(e) => setNewSizeMm(e.target.value)}
                      className="bg-gray-50 h-12 px-4 flex-1 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSize}
                      className="bg-primaryColor text-white h-12 px-4 rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                    >
                      <CiCirclePlus size={20} />
                      Add
                    </Button>
                  </div>

                  {sizes.length > 0 ? (
                    <div className="space-y-2">
                      {sizes.map((size, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl flex justify-between items-center border border-gray-200 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primaryColor/10 text-primaryColor px-3 py-1 rounded-lg font-semibold text-sm">
                              {size.name}
                            </div>
                            <span className="font-medium text-gray-700">{size.price?`$${size.price}`:""}</span>
                            <span className="font-medium text-gray-600">{size.size}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(index)}
                            className="hover:scale-110 transition-transform"
                          >
                            <IoCloseCircle className="text-red-500" size={24} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-sm">No sizes added yet. Click the + button to add sizes.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Keywords
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add keyword (e.g., handmade, organic)"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                      className="bg-gray-50 h-12 px-4 flex-1 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                    />
                    <Button
                      type="button"
                      onClick={handleAddKeyword}
                      className="bg-primaryColor text-white h-12 px-6 rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Add
                    </Button>
                  </div>
                  {keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 text-primaryColor px-4 py-2 rounded-full flex items-center gap-2 border border-primaryColor/20 transition-all duration-200 hover:shadow-md"
                        >
                          <span className="font-medium">{keyword}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(index)}
                            className="hover:scale-110 transition-transform"
                          >
                            <IoCloseCircle className="text-red-500" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-sm">No keywords added yet. Add keywords to improve searchability.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Benefits
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add benefit (e.g., Promotes spiritual growth)"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBenefit())}
                      className="bg-gray-50 h-12 px-4 flex-1 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                    />
                    <Button
                      type="button"
                      onClick={handleAddBenefit}
                      className="bg-primaryColor text-white h-12 px-6 rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Add
                    </Button>
                  </div>
                  {benefits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 text-primaryColor px-4 py-2 rounded-full flex items-center gap-2 border border-primaryColor/20 transition-all duration-200 hover:shadow-md"
                        >
                          <span className="font-medium">{benefit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(index)}
                            className="hover:scale-110 transition-transform"
                          >
                            <IoCloseCircle className="text-red-500" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-sm">No benefits added yet. Add benefits to highlight product advantages.</p>
                    </div>
                  )}
                </div>
              </div>
            </div> */}

           <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
  <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
      Discounts
    </h2>
  </div>
  <div className="p-6">
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Discount title"
          value={discountTitle}
          disabled={diableDiscountAdd && editingDiscountIndex === null}
          onChange={(e) => setDiscountTitle(e.target.value)}
          className="bg-gray-50 h-12 px-4 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
        />
        <input
          type="number"
          placeholder="Percentage"
          value={discountPercentage}
          disabled={diableDiscountAdd && editingDiscountIndex === null}
          onChange={(e) => setDiscountPercentage(e.target.value)}
          className="bg-gray-50 h-12 px-4 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={diableDiscountAdd && editingDiscountIndex === null}
            onClick={handleAddDiscount}
            className="bg-primaryColor text-white h-12 flex-1 rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            {editingDiscountIndex !== null ? "Update" : "Add Discount"}
          </Button>
          {editingDiscountIndex !== null && (
            <Button
              type="button"
              onClick={handleCancelEditDiscount}
              className="bg-gray-500 text-white h-12 px-4 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      {discounts.length > 0 ? (
        <div className="space-y-2">
          {discounts.map((discount, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl flex justify-between items-center border-2 transition-all duration-200 hover:shadow-md ${
                editingDiscountIndex === index ? "border-primaryColor bg-primaryColor/5" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primaryColor/10 text-primaryColor px-3 py-1 rounded-lg font-bold text-sm">
                  {discount.percentage}%
                </div>
                <span className="font-medium text-gray-700">{discount.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditDiscount(index)}
                  className="hover:scale-110 transition-transform bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                  disabled={editingDiscountIndex !== null && editingDiscountIndex !== index}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveDiscount(index)}
                  className="hover:scale-110 transition-transform"
                >
                  <IoCloseCircle className="text-red-500" size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-sm">No discounts added yet. Add discounts to attract customers.</p>
        </div>
      )}
    </div>
  </div>
</div>
          </div>

          {/* Right column - Images and Category */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Category
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Product Category <span className="text-red-500">*</span>
                    </div>
                    <Controller
                      name="category"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <div className="space-y-2">
                          {subCategory.length > 0 ? (
                            subCategory.map((cat) => (
                              <label
                                key={cat._id}
                                className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                              >
                                <input
                                  type="radio"
                                  name="category"
                                  value={cat.name}
                                  checked={field.value === cat.name}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="w-4 h-4 text-primaryColor cursor-pointer"
                                />
                                <span className="font-medium text-gray-700">{cat.name}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No categories available</p>
                          )}
                        </div>
                      )}
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Sub Category {subCategoryOptions.length > 0 && <span className="text-red-500">*</span>}
                    </div>
                    <Controller
                      name="subCategory"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <>
                          {subCategoryOptions.length > 0 ? (
                            <Dropdown isDisabled={!selectedCategory}>
                              <DropdownTrigger>
                                <Button
                                  className={`capitalize w-full h-12 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                                    errors.subCategory ? "ring-2 ring-red-500" : "border-2 border-gray-200"
                                  } text-gray-700 text-base font-medium shadow-sm flex items-center justify-between ${!selectedCategory ? "opacity-50 cursor-not-allowed" : ""}`}
                                  variant="bordered"
                                >
                                  <span>{field.value || "Select Sub-Category"}</span>
                                  <MdKeyboardArrowDown className="text-gray-500" size={20} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disallowEmptySelection
                                aria-label="Sub-Category selection"
                                selectedKeys={field.value ? new Set([field.value]) : undefined}
                                selectionMode="single"
                                variant="flat"
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)[0]
                                  field.onChange(selectedValue)
                                }}
                              >
                                 {subCategoryOptions.map((sub) => (
                                  <DropdownItem key={sub.name} value={sub.name}>
                                    {sub.name}
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          ) : (
                            <div className="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center px-4 text-gray-500">
                              No subcategories available for this category
                            </div>
                          )}
                        </>
                      )}
                    />
                    {errors.subCategory && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.subCategory.message}
                      </p>
                    )}
                    {!selectedCategory && (
                      <p className="text-gray-500 text-xs mt-1.5">Select a category first to choose subcategory</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Variants
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-3">Select Variants</div>
                    <div className="space-y-2">
                      {variants.length > 0 ? (
                        variants.map((variant) => (
                          <label
                            key={variant._id}
                            className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedVariants.has(variant._id)}
                              onChange={(e) => {
                                const newSelection = new Set(selectedVariants)
                                if (e.target.checked) {
                                  newSelection.add(variant._id)
                                } else {
                                  newSelection.delete(variant._id)
                                }
                                setSelectedVariants(newSelection)
                                setValue("variants", Array.from(newSelection))
                              }}
                              className="w-4 h-4 text-primaryColor cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="font-medium text-gray-700">{variant.name}</span>
                              <span className="text-gray-500 text-sm ml-2">${variant.price}</span>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No variants available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Default Variant</div>
                    <Dropdown isDisabled={selectedVariants.size === 0}>
                      <DropdownTrigger>
                        <Button
                          className={`capitalize w-full h-12 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                            selectedVariants.size === 0 ? "opacity-50 cursor-not-allowed" : "border-2 border-gray-200"
                          } text-gray-700 text-base font-medium shadow-sm flex items-center justify-between`}
                          variant="bordered"
                        >
                          <span>
                            {defaultVariant
                              ? variants.find((v) => v._id === defaultVariant)?.name || "Select Default Variant"
                              : "Select Default Variant"}
                          </span>
                          <MdKeyboardArrowDown className="text-gray-500" size={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Default variant selection"
                        selectedKeys={defaultVariant ? new Set([defaultVariant]) : undefined}
                        selectionMode="single"
                        variant="flat"
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0] as string
                          setDefaultVariant(selectedValue)
                          setValue("defaultVariant", selectedValue)
                        }}
                      >
                        {variants.length > 0 ? (
                          variants
                            .filter((v) => selectedVariants.has(v._id))
                            .map((variant) => (
                              <DropdownItem key={variant._id}>
                                {variant.name} - ${variant.price}
                              </DropdownItem>
                            ))
                        ) : (
                          <DropdownItem key="noVariants">No variants available</DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                    {selectedVariants.size === 0 && (
                      <p className="text-gray-500 text-xs mt-1.5">Select at least one variant first</p>
                    )}
                  </div>

                  {selectedVariants.size > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-700">Selected Variants:</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(selectedVariants).map((variantId) => {
                          const variant = variants.find((v) => v._id === variantId)
                          return variant ? (
                            <div
                              key={variantId}
                              className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 text-primaryColor px-3 py-1.5 rounded-full text-sm font-medium border border-primaryColor/20"
                            >
                              {variant.name}
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-sm">No variants selected yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Keywords
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add keyword (e.g., handmade, organic)"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                      className="bg-gray-50 h-12 px-4 flex-1 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                    />
                    <Button
                      type="button"
                      onClick={handleAddKeyword}
                      className="bg-primaryColor text-white h-12 px-6 rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Add
                    </Button>
                  </div>
                  {keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 text-primaryColor px-4 py-2 rounded-full flex items-center gap-2 border border-primaryColor/20 transition-all duration-200 hover:shadow-md"
                        >
                          <span className="font-medium">{keyword}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(index)}
                            className="hover:scale-110 transition-transform"
                          >
                            <IoCloseCircle className="text-red-500" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-sm">No keywords added yet. Add keywords to improve searchability.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                  Benefits
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add benefit (e.g., Promotes spiritual growth)"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBenefit())}
                      className="bg-gray-50 h-12 px-4 flex-1 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor"
                    />
                    <Button
                      type="button"
                      onClick={handleAddBenefit}
                      className="bg-primaryColor text-white h-12 px-6 rounded-xl hover:bg-primaryColor/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Add
                    </Button>
                  </div>
                  {benefits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 text-primaryColor px-4 py-2 rounded-full flex items-center gap-2 border border-primaryColor/20 transition-all duration-200 hover:shadow-md"
                        >
                          <span className="font-medium">{benefit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(index)}
                            className="hover:scale-110 transition-transform"
                          >
                            <IoCloseCircle className="text-red-500" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-sm">No benefits added yet. Add benefits to highlight product advantages.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg">
            <div className="bg-gradient-to-r from-primaryColor/5 to-primaryColor/10 px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primaryColor rounded-full"></span>
                Product Images
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                  <div
                    className={`h-40 w-full rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 ${
                      isDragging
                        ? "border-primaryColor bg-primaryColor/5 scale-105"
                        : errors.img
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    {errors.img ? (
                      <div className="text-center">
                        <p className="text-red-500 font-medium">⚠ {errors.img.message}</p>
                        <p className="text-gray-400 text-sm mt-2">Drag and drop or click to upload</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CiCirclePlus size={48} className="text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600">Drag and drop images here</p>
                        <p className="text-gray-400 text-sm mt-1">Upload up to 4 images</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {productImages.map((img, index) => (
                    <div key={index} className="relative group">
                      {/* Increased min-height and made grid full width */}
                      <div className="relative bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center aspect-square">
                        <Image
                          alt={`Product image ${index + 1}`}
                          src={img || "/placeholder.svg"}
                          width={500}
                          height={500}
                          quality={100}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-xl"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <IoCloseCircle size={48} className="text-red-500 bg-white rounded-full shadow-lg" />
                      </button>
                    </div>
                  ))}

                  {productImages.length < 4 && (
                    <label className="relative bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-primaryColor/5 hover:border-primaryColor transition-all duration-200 min-h-80">
                      <div className="text-center">
                        <CiCirclePlus size={40} className="text-primaryColor mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Add Image</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  {productImages.length}/4 images uploaded. Use object-contain display.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Demo
