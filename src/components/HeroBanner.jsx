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

  // Fallback banner data
  const fallbackBanners = [
    {
      id: "fallback-1",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop&crop=center&auto=format&q=80",
      title: "MAN",
      subtitle: "EID COLLECTION",
      primaryButtonText: "UNSTITCHED",
      secondaryButtonText: "STITCHED",
      primaryButtonLink: "/products?category=men&type=unstitched",
      secondaryButtonLink: "/products?category=men&type=stitched",
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
    async function fetchBanners() {
      try {
        console.log("🚀 Fetching banners from:", `${API_URL}/api/banners?populate=image`)

        const res = await fetch(`${API_URL}/api/banners?populate=image`)

        console.log("📡 Banner API Response status:", res.status)

        if (!res.ok) {
          console.error("❌ Banner API failed with status:", res.status)
          throw new Error(`HTTP ${res.status}`)
        }

        const responseData = await res.json()
        console.log("✅ Banner API Response:", responseData)

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const formattedBanners = responseData.data
            .filter((item) => {
              const isActive = item.isActive !== false
              return isActive
            })
            .map((item) => {
              console.log("🔍 Processing banner item:", item)

              const bannerImage = getStrapiImageUrl(item.image)
              console.log("🎯 Final banner image URL:", bannerImage)

              return {
                id: item.id,
                image: bannerImage,
                title: item.title || "MAN",
                subtitle: item.subtitle || "EID COLLECTION",
                primaryButtonText: item.primaryButtonText || "UNSTITCHED",
                secondaryButtonText: item.secondaryButtonText || "STITCHED",
                primaryButtonLink: item.primaryButtonLink || "/products?category=men&type=unstitched",
                secondaryButtonLink: item.secondaryButtonLink || "/products?category=men&type=stitched",
              }
            })

          console.log("🎯 Final formatted banners:", formattedBanners)
          setBanners(formattedBanners.length > 0 ? formattedBanners : fallbackBanners)
        } else {
          console.log("⚠️ No banner data found, using fallback")
          setBanners(fallbackBanners)
        }
      } catch (error) {
        console.error("💥 Error fetching banners, using fallback:", error)
        setBanners(fallbackBanners)
        setError(true)
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
          onError={(e) => {
            console.error("❌ Banner image failed to load:", currentBanner.image)
            // Fallback to high-quality stock image
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop&crop=center&auto=format&q=80"
          }}
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
          Using fallback images
        </div>
      )}
    </section>
  )
}
