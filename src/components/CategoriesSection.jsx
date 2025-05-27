"use client"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import Image from "next/image"

const CategoryCard = memo(({ category }) => (
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
))

CategoryCard.displayName = "CategoryCard"

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_URL}/api/categories?populate=*`)

        if (res.ok) {
          const responseData = await res.json()

          if (responseData.data && responseData.data.length > 0) {
            const formattedCategories = responseData.data.map((item) => {
              const categoryData = item.attributes

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

              const categoryImage = getStrapiImageUrl(categoryData.image)

              return {
                id: item.id,
                name: categoryData.name || "Category",
                slug: categoryData.slug || "",
                description: categoryData.description || "Discover our collection",
                image: categoryImage,
              }
            })

            setCategories(formattedCategories.filter((c) => c.image))
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [API_URL])

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
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ))
            : categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      </div>
    </section>
  )
}
