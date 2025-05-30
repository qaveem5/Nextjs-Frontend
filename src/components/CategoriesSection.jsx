"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  // Function to properly extract Strapi image URLs
  const getStrapiImageUrl = (imageData) => {
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
      const fallbackUrl = `${API_URL}/uploads/${imageData.name}`
      console.log("✅ Constructed fallback URL:", fallbackUrl)
      return fallbackUrl
    }

    console.log("❌ Could not extract image URL from:", imageData)
    return null
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("🚀 Fetching categories from:", `${API_URL}/api/categories?populate=image`)

        const res = await fetch(`${API_URL}/api/categories?populate=image`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const responseData = await res.json()
        console.log("✅ Category API Response:", responseData)

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const formattedCategories = responseData.data
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

          console.log("🎯 Final formatted categories:", formattedCategories)
          setCategories(formattedCategories)
        } else {
          console.log("⚠️ No category data found")
          setCategories([])
        }
      } catch (error) {
        console.error("💥 Error fetching categories:", error)
        setCategories([])
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
            // Only use placeholder as last resort
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
