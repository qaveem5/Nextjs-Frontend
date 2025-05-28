"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { fallbackBanners } from "./fallback-data"

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://fallback-disabled"

  useEffect(() => {
    async function fetchBanners() {
      if (API_URL === "https://fallback-disabled") {
        console.log("Using fallback data - API not configured")
        setBanners(fallbackBanners)
        setLoading(false)
        return
      }

      try {
        console.log("🚀 Fetching banners from:", `${API_URL}/api/banners?populate=*`)

        const res = await fetch(`${API_URL}/api/banners?populate=*`, {
          // Add a timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }).catch((err) => {
          console.error("DNS/Network error:", err)
          throw new Error("API unavailable")
        })

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
              // Check if banner is active
              const isActive = item.attributes?.isActive !== false
              console.log(`Banner ${item.id} isActive:`, isActive)
              return isActive
            })
            .map((item) => {
              console.log("🔄 Processing banner:", item)
              console.log("🔍 Banner attributes:", item.attributes)
              const bannerData = item.attributes

              const getStrapiImageUrl = (imageData, itemName = "banner") => {
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

              const bannerImage = getStrapiImageUrl(bannerData?.image, `banner-${item.id}`)

              return {
                id: item.id,
                image: bannerImage,
                title: bannerData?.title || "MAN",
                subtitle: bannerData?.subtitle || "EID II",
                primaryButtonText: bannerData?.primaryButtonText || "UNSTITCHED",
                secondaryButtonText: bannerData?.secondaryButtonText || "STITCHED",
                primaryButtonLink: bannerData?.primaryButtonLink || "/products?category=men&type=unstitched",
                secondaryButtonLink: bannerData?.secondaryButtonLink || "/products?category=men&type=stitched",
              }
            })
          // Remove this filter temporarily to see all banners
          // .filter((banner) => banner.image)

          console.log("🎯 Final formatted banners:", formattedBanners)
          setBanners(formattedBanners)
        } else {
          console.log("⚠️ No banner data found in response, using fallbacks")
          setBanners(fallbackBanners)
        }
      } catch (error) {
        console.error("💥 Error fetching banners:", error)
        setError(true)
        // Use fallback data when API fails
        setBanners(fallbackBanners)
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
          src={currentBanner.image || "/placeholder.svg?height=800&width=1600"}
          alt="Sapphire Banner"
          fill
          className="object-cover"
          priority
          quality={90}
          onError={(e) => {
            console.error("❌ Banner image failed to load:", currentBanner.image)
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

      {error && (
        <div className="absolute bottom-4 right-4 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800">
          Using fallback data (API connection error)
        </div>
      )}
    </section>
  )
}
