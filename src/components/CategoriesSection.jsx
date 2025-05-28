"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  const getStrapiImageUrl = (imageData) => {
    if (!imageData) return null

    if (imageData.data?.attributes?.url) {
      const url = imageData.data.attributes.url
      return url.startsWith("http") ? url : `${API_URL}${url}`
    }
    if (imageData.attributes?.url) {
      const url = imageData.attributes.url
      return url.startsWith("http") ? url : `${API_URL}${url}`
    }
    if (imageData.url) {
      const url = imageData.url
      return url.startsWith("http") ? url : `${API_URL}${url}`
    }
    return null
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Try multiple populate strategies
        const populateQueries = [
          `${API_URL}/api/categories?populate[image][fields][0]=url&populate[image][fields][1]=name`,
          `${API_URL}/api/categories?populate=image`,
          `${API_URL}/api/categories?populate[0]=image`,
          `${API_URL}/api/categories?populate=*`,
        ]

        let responseData = null
        let successfulQuery = null

        for (const query of populateQueries) {
          try {
            console.log("🚀 Trying category query:", query)
            const res = await fetch(query)

            if (res.ok) {
              const data = await res.json()
              console.log("✅ Category response for query:", query, data)

              // Check if this response has image data
              if (data.data && data.data[0] && data.data[0].attributes) {
                const attrs = data.data[0].attributes
                console.log("🔍 Category attributes:", attrs)
                console.log("🔍 Category attribute keys:", Object.keys(attrs))

                // If we find image data, use this response
                if (attrs.image !== undefined) {
                  responseData = data
                  successfulQuery = query
                  console.log("✅ Found image data in response!")
                  break
                }
              }
            }
          } catch (err) {
            console.log("❌ Query failed:", query, err.message)
            continue
          }
        }

        if (!responseData) {
          throw new Error("No successful query found")
        }

        console.log("🎯 Using successful query:", successfulQuery)
        console.log("🎯 Final category response:", responseData)

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const formattedCategories = responseData.data
            .filter((item) => {
              const isActive = item.attributes?.isActive !== false
              return isActive
            })
            .map((item) => {
              const categoryData = item.attributes

              console.log("🔍 Processing category item:", item)
              console.log("🔍 Category image field:", categoryData?.image)

              const categoryImage = getStrapiImageUrl(categoryData?.image)
              console.log("🎯 Extracted category image URL:", categoryImage)

              // Fallback images for each category
              const fallbackImages = {
                Men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=600&fit=crop&crop=center&auto=format&q=60",
                Women:
                  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop&crop=center&auto=format&q=60",
                Accessories:
                  "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&h=600&fit=crop&crop=center&auto=format&q=60",
              }

              return {
                id: item.id,
                name: categoryData?.name || "Category",
                slug: categoryData?.slug || "",
                description: categoryData?.description || "Discover our collection",
                image: categoryImage || fallbackImages[categoryData?.name] || fallbackImages.Men,
              }
            })

          console.log("🎯 Final formatted categories:", formattedCategories)
          setCategories(formattedCategories)
        } else {
          console.log("⚠️ No category data found in response")
          setCategories([])
        }
      } catch (error) {
        console.error("💥 Error fetching categories:", error)
        setError(true)
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

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Categories</h3>
          <p className="text-gray-600 mb-4">Unable to load categories. Please try again later.</p>
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
