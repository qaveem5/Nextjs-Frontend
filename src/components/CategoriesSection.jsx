import Link from "next/link"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

const getStrapiImageUrl = (imageData, itemName = "category") => {
  console.log(`🖼️ Processing ${itemName} image data:`, imageData)
  console.log(`🔍 Image data type:`, typeof imageData)
  console.log(`🔍 Image data keys:`, imageData ? Object.keys(imageData) : "null/undefined")

  if (!imageData) {
    console.log(`⚠️ No image data found for ${itemName}`)
    return null
  }

  // Log the full structure for debugging
  console.log(`📋 Full ${itemName} image structure:`, JSON.stringify(imageData, null, 2))

  // Handle array of images (multiple images)
  if (Array.isArray(imageData) && imageData.length > 0) {
    const firstImage = imageData[0]
    console.log(`🔍 First image in array:`, firstImage)
    if (firstImage?.attributes?.url) {
      const url = firstImage.attributes.url
      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
      console.log(`✅ ${itemName} image URL (array):`, fullUrl)
      return fullUrl
    }
  }

  // Handle single image with data wrapper
  if (imageData.data) {
    console.log(`🔍 Image data.data:`, imageData.data)

    // Single image
    if (imageData.data.attributes?.url) {
      const url = imageData.data.attributes.url
      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
      console.log(`✅ ${itemName} image URL (data.attributes):`, fullUrl)
      return fullUrl
    }

    // Array of images in data
    if (Array.isArray(imageData.data) && imageData.data.length > 0) {
      const firstImage = imageData.data[0]
      console.log(`🔍 First image in data array:`, firstImage)
      if (firstImage?.attributes?.url) {
        const url = firstImage.attributes.url
        const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
        console.log(`✅ ${itemName} image URL (data array):`, fullUrl)
        return fullUrl
      }
    }
  }

  // Handle direct attributes
  if (imageData.attributes?.url) {
    const url = imageData.attributes.url
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
    console.log(`✅ ${itemName} image URL (attributes):`, fullUrl)
    return fullUrl
  }

  // Handle direct URL
  if (imageData.url) {
    const url = imageData.url
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
    console.log(`✅ ${itemName} image URL (direct):`, fullUrl)
    return fullUrl
  }

  // Handle string URL
  if (typeof imageData === "string") {
    const fullUrl = imageData.startsWith("http") ? imageData : `${API_URL}${imageData}`
    console.log(`✅ ${itemName} image URL (string):`, fullUrl)
    return fullUrl
  }

  // Handle nested image field (common in Strapi v4)
  if (imageData.image) {
    console.log(`🔍 Nested image field:`, imageData.image)
    return getStrapiImageUrl(imageData.image, itemName)
  }

  // Handle formats field (Strapi image formats)
  if (imageData.formats) {
    console.log(`🔍 Image formats available:`, Object.keys(imageData.formats))
    const format = imageData.formats.medium || imageData.formats.small || imageData.formats.thumbnail
    if (format?.url) {
      const fullUrl = format.url.startsWith("http") ? format.url : `${API_URL}${format.url}`
      console.log(`✅ ${itemName} image URL (format):`, fullUrl)
      return fullUrl
    }
  }

  console.log(`❌ Could not extract ${itemName} image URL from:`, imageData)
  return null
}

const CategoriesSection = ({ categories }) => {
  const processedCategories = categories.map((item) => {
    console.log("🔄 Processing category:", item)
    console.log("🔍 Category attributes:", item.attributes)
    const categoryData = item.attributes

    const categoryImage = getStrapiImageUrl(categoryData?.image, `category-${item.id}`)

    return {
      id: item.id,
      name: categoryData?.name || "Category",
      slug: categoryData?.slug || "",
      description: categoryData?.description || "Discover our collection",
      image: categoryImage,
    }
  })
  // Remove this filter temporarily to see all categories
  // .filter((category) => category.image)

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Explore Our Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  )
}

const CategoryCard = ({ category }) => {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative block h-64 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <Image
        src={category.image || "/placeholder.svg"}
        alt={category.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
        onError={(e) => {
          console.error("❌ Category image failed to load:", category.image)
          e.currentTarget.src = "/placeholder.svg"
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <h3 className="text-xl font-semibold text-white group-hover:scale-110 transition-transform duration-300">
          {category.name}
        </h3>
      </div>
    </Link>
  )
}

export default CategoriesSection
