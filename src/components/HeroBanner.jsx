"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
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
    async function fetchBanners() {
      try {
        // Try multiple populate strategies
        const populateQueries = [
          `${API_URL}/api/banners?populate[image][fields][0]=url&populate[image][fields][1]=name`,
          `${API_URL}/api/banners?populate=image`,
          `${API_URL}/api/banners?populate[0]=image`,
          `${API_URL}/api/banners?populate=*`,
        ]

        let responseData = null
        let successfulQuery = null

        for (const query of populateQueries) {
          try {
            console.log("🚀 Trying banner query:", query)
            const res = await fetch(query)

            if (res.ok) {
              const data = await res.json()
              console.log("✅ Banner response for query:", query, data)

              // Check if this response has image data
              if (data.data && data.data[0] && data.data[0].attributes) {
                const attrs = data.data[0].attributes
                console.log("🔍 Banner attributes:", attrs)
                console.log("🔍 Banner attribute keys:", Object.keys(attrs))

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
        console.log("🎯 Final banner response:", responseData)

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const formattedBanners = responseData.data
            .filter((item) => {
              const isActive = item.attributes?.isActive !== false
              return isActive
            })
            .map((item) => {
              const bannerData = item.attributes

              console.log("🔍 Processing banner item:", item)
              console.log("🔍 Banner image field:", bannerData?.image)

              const bannerImage = getStrapiImageUrl(bannerData?.image)
              console.log("🎯 Extracted banner image URL:", bannerImage)

              return {
                id: item.id,
                image:
                  bannerImage ||
                  `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop&crop=center&auto=format&q=60`,
                title: bannerData?.title || "MAN",
                subtitle: bannerData?.subtitle || "EID II",
                primaryButtonText: bannerData?.primaryButtonText || "UNSTITCHED",
                secondaryButtonText: bannerData?.secondaryButtonText || "STITCHED",
                primaryButtonLink: bannerData?.primaryButtonLink || "/products?category=men&type=unstitched",
                secondaryButtonLink: bannerData?.secondaryButtonLink || "/products?category=men&type=stitched",
              }
            })

          console.log("🎯 Final formatted banners:", formattedBanners)
          setBanners(formattedBanners)
        } else {
          console.log("⚠️ No banner data found in response")
          setBanners([])
        }
      } catch (error) {
        console.error("💥 Error fetching banners:", error)
        setError(true)
        setBanners([])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [API_URL])

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  if (loading) {
    return (
      <div className="relative h-[70vh] bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading banner...</div>
        </div>
      </div>
    )
  }

  if (!banners.length) {
    return (
      <div className="relative h-[70vh] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">No banners found</div>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentSlide]

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.image || "/placeholder.svg"}
          alt="Sapphire Banner"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg">
            <div className="text-white mb-8">
              <h1 className="text-6xl md:text-8xl font-bold tracking-wider mb-2">{currentBanner.title}</h1>
              <h2 className="text-2xl md:text-3xl font-light tracking-widest">{currentBanner.subtitle}</h2>
            </div>

            <div className="flex gap-4">
              <Link
                href={currentBanner.primaryButtonLink}
                className="bg-white text-black px-8 py-3 font-semibold tracking-wide hover:bg-gray-100 transition-colors"
              >
                {currentBanner.primaryButtonText}
              </Link>
              <Link
                href={currentBanner.secondaryButtonLink}
                className="bg-transparent border-2 border-white text-white px-8 py-3 font-semibold tracking-wide hover:bg-white hover:text-black transition-colors"
              >
                {currentBanner.secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 right-4 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800">
          Error loading banners
        </div>
      )}
    </section>
  )
}
