import Link from "next/link"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

// Function to properly extract Strapi image URLs
function getStrapiImageUrl(imageData) {
  if (!imageData) return null

  // Check if image data has a direct URL property
  if (imageData.url) {
    return imageData.url
  }

  // Check if we have the full Strapi media URL pattern
  if (imageData.name && imageData.documentId) {
    // Try the Strapi Cloud media URL pattern
    return `https://attractive-heart-9d123fcb13.media.strapiapp.com/${imageData.name}`
  }

  // Fallback: construct URL with name only
  if (imageData.name) {
    return `${API_URL}/uploads/${imageData.name}`
  }

  return null
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

export default async function CategoriesSection() {
  let categories = []

  try {
    const res = await fetch(`${API_URL}/api/categories?populate=image`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (res.ok) {
      const responseData = await res.json()

      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        categories = responseData.data
          .filter((item) => item.isActive !== false)
          .map((item) => {
            const categoryImage = getStrapiImageUrl(item.image)

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
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
  }

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
