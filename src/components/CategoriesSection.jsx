"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  // Fallback category data
  const fallbackCategories = [
    {
      id: "fallback-1",
      name: "Men",
      slug: "men",
      description: "Discover our men's collection",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
    },
    {
      id: "fallback-2",
      name: "Women",
      slug: "women",
      description: "Explore our women's collection",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
    },
    {
      id: "fallback-3",
      name: "Accessories",
      slug: "accessories",
      description: "Complete your look with accessories",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
    },
  ]

  // Updated function with proxy and fallback support
  const getStrapiImageUrl = (imageData) => {
    if (!imageData) return null

    console.log("🔍 Processing image data:", imageData)

    try {
      // Check if we have a direct URL
      if (typeof imageData === "string" && imageData.includes("http")) {
        console.log("✅ Using direct URL:", imageData)
        return imageData
      }

      // Check if we have a name property
      if (imageData.name) {
        // Try multiple URL patterns with proxy fallback
        const directUrl = `${API_URL}/uploads/${imageData.name}`
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(directUrl)}`

        console.log("✅ Constructed proxy URL:", proxyUrl)
        return proxyUrl
      }

      // Other patterns
      if (imageData.url) {
        const url = imageData.url
        const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`
        console.log("✅ Using proxy URL from image data:", proxyUrl)
        return proxyUrl
      }

      if (imageData.data?.attributes?.url) {
        const url = imageData.data.attributes.url
        const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`
        console.log("✅ Using proxy URL from data.attributes:", proxyUrl)
        return proxyUrl
      }

      console.log("❌ Could not extract image URL from:", imageData)
      return null
    } catch (error) {
      console.error("❌ Error processing image URL:", error)
      return null
    }
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("🚀 Fetching categories from:", `${API_URL}/api/categories?populate=image`)

        const res = await fetch(`${API_URL}/api/categories?populate=image`)

        console.log("📡 Category API Response status:", res.status)

        if (!res.ok) {
          console.error("❌ Category API failed with status:", res.status)
          throw new Error(`HTTP ${res.status}`)
        }

        const responseData = await res.json()
        console.log("✅ Category API Response:", responseData)

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const formattedCategories = responseData.data
            .filter((item) => {
              const isActive = item.isActive !== false
              return isActive
            })
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

          console.log("🎯 Final formatted categories:", formattedCategories)
          setCategories(formattedCategories.length > 0 ? formattedCategories : fallbackCategories)
        } else {
          console.log("⚠️ No category data found, using fallback")
          setCategories(fallbackCategories)
        }
      } catch (error) {
        console.error("💥 Error fetching categories, using fallback:", error)
        setCategories(fallbackCategories)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [API_URL])

  if (loading) {
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
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

        {error && (
          <div className="text-center mt-8">
            <div className="inline-block bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
              Using fallback images due to connection issues
            </div>
          </div>
        )}
      </div>
    </section>
  )
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
            // Fallback to high-quality stock image based on category
            const fallbackImages = {
              men: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
              women:
                "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
              accessories:
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
            }
            e.currentTarget.src = fallbackImages[category.slug] || fallbackImages.accessories
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
