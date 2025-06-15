import Link from "next/link"
import Image from "next/image"

// Function to properly extract Strapi image URLs (keeping your exact logic)
function getStrapiImageUrl(imageData) {
  if (!imageData) {
    console.log("❌ No image data provided")
    return null
  }

  console.log("🔍 Processing image data:", imageData)

  // Check if image data has a direct URL property
  if (imageData.url) {
    console.log("✅ Found direct URL:", imageData.url)
    return imageData.url
  }

  // Check if we have the full Strapi media URL pattern
  if (imageData.name && imageData.documentId) {
    // Try the Strapi Cloud media URL pattern
    const mediaUrl = `https://attractive-heart-9d123fcb13.media.strapiapp.com/${imageData.name}`
    console.log("✅ Constructed media URL:", mediaUrl)
    return mediaUrl
  }

  // Fallback: construct URL with name only
  if (imageData.name) {
    const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
    const fallbackUrl = `${API_URL}/uploads/${imageData.name}`
    console.log("✅ Constructed fallback URL:", fallbackUrl)
    return fallbackUrl
  }

  console.log("❌ Could not extract image URL from:", imageData)
  return null
}

// Process categories data (keeping your exact logic)
function processCategories(categoriesData) {
  if (!categoriesData || !Array.isArray(categoriesData)) return []

  return categoriesData
    .filter((item) => item.isActive !== false)
    .map((item) => {
      console.log("🔍 Processing category item:", item)

      const categoryImage = getStrapiImageUrl(item.image)
      console.log("🎯 Final category image URL:", categoryImage)

      return {
        id: item.id,
        name: item.name || "Category",
        slug: item.slug || "",
        description: item.description || "Discover our collection",
        image: categoryImage,
      }
    })
    .filter((category) => category.image) // Only keep categories with valid images
}

const CategoryCard = ({ category }) => (
  <Link href={`/products?category=${category.slug}`} className="group">
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={85}
          onError={(e) => {
            console.error("❌ Category image failed to load:", category.image)
            e.currentTarget.src = "/placeholder.svg?height=600&width=800"
          }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-white text-2xl md:text-3xl font-bold tracking-wide text-center">
            {category.name.toUpperCase()}
          </h3>
        </div>
      </div>

      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{category.name}</h3>
        <p className="text-gray-600">{category.description}</p>
        <div className="mt-4">
          <span className="inline-block bg-black text-white px-4 py-2 text-sm font-medium group-hover:bg-gray-800 transition-colors">
            SHOP NOW
          </span>
        </div>
      </div>
    </div>
  </Link>
)

export default function CategoriesSection({ categories: categoriesData }) {
  const categories = processCategories(categoriesData)

  if (!categories.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600">No categories available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of premium fashion for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}