"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
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
    async function fetchBanners() {
      try {
        console.log("🚀 Fetching banners from:", `${API_URL}/api/banners?populate=image`)

        const res = await fetch(`${API_URL}/api/banners?populate=image`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const responseData = await res.json()
        console.log("✅ Banner API Response:", responseData)

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const formattedBanners = responseData.data
            .filter((item) => item.isActive !== false)
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
            .filter((banner) => banner.image) // Only keep banners with valid images

          console.log("🎯 Final formatted banners:", formattedBanners)
          setBanners(formattedBanners)
        } else {
          console.log("⚠️ No banner data found")
          setBanners([])
        }
      } catch (error) {
        console.error("💥 Error fetching banners:", error)
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
          <div className="text-gray-400">Loading banners...</div>
        </div>
      </div>
    )
  }

  if (!banners.length) {
    return (
      <div className="relative h-[70vh] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">No banners available</div>
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
          alt={currentBanner.title || "Banner"}
          fill
          className="object-cover"
          priority
          quality={90}
          onError={(e) => {
            console.error("❌ Banner image failed to load:", currentBanner.image)
            // Only use placeholder as last resort
            e.currentTarget.src = "/placeholder.svg?height=800&width=1600"
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
    </section>
  )
}
