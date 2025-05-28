"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  useEffect(() => {
    async function fetchBanners() {
      try {
        console.log("🚀 Fetching banners from:", `${API_URL}/api/banners?populate=*`)

        const res = await fetch(`${API_URL}/api/banners?populate=*`)

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
              const isActive = item.attributes?.isActive !== false
              console.log(`Banner ${item.id} isActive:`, isActive)
              return isActive
            })
            .map((item) => {
              console.log("🔄 Processing banner:", item)
              const bannerData = item.attributes

              const getStrapiImageUrl = (imageData) => {
                console.log("🖼️ Processing banner image data:", imageData)

                if (!imageData) {
                  console.log("⚠️ No image data found")
                  return null
                }

                // Handle array of images (multiple images)
                if (Array.isArray(imageData) && imageData.length > 0) {
                  const firstImage = imageData[0]
                  if (firstImage?.attributes?.url) {
                    const url = firstImage.attributes.url
                    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                    console.log("✅ Banner image URL (array):", fullUrl)
                    return fullUrl
                  }
                }

                // Handle single image with data wrapper
                if (imageData.data) {
                  // Single image
                  if (imageData.data.attributes?.url) {
                    const url = imageData.data.attributes.url
                    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                    console.log("✅ Banner image URL (data.attributes):", fullUrl)
                    return fullUrl
                  }

                  // Array of images in data
                  if (Array.isArray(imageData.data) && imageData.data.length > 0) {
                    const firstImage = imageData.data[0]
                    if (firstImage?.attributes?.url) {
                      const url = firstImage.attributes.url
                      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                      console.log("✅ Banner image URL (data array):", fullUrl)
                      return fullUrl
                    }
                  }
                }

                // Handle direct attributes
                if (imageData.attributes?.url) {
                  const url = imageData.attributes.url
                  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                  console.log("✅ Banner image URL (attributes):", fullUrl)
                  return fullUrl
                }

                // Handle direct URL
                if (imageData.url) {
                  const url = imageData.url
                  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                  console.log("✅ Banner image URL (direct):", fullUrl)
                  return fullUrl
                }

                // Handle string URL
                if (typeof imageData === "string") {
                  const fullUrl = imageData.startsWith("http") ? imageData : `${API_URL}${imageData}`
                  console.log("✅ Banner image URL (string):", fullUrl)
                  return fullUrl
                }

                console.log("❌ Could not extract banner image URL from:", imageData)
                return null
              }

              const bannerImage = getStrapiImageUrl(bannerData?.image)

              const banner = {
                id: item.id,
                image: bannerImage,
                title: bannerData?.title || "Banner",
                subtitle: bannerData?.subtitle || "",
                primaryButtonText: bannerData?.primaryButtonText || "UNSTITCHED",
                secondaryButtonText: bannerData?.secondaryButtonText || "STITCHED",
                primaryButtonLink: bannerData?.primaryButtonLink || "/products?category=men&type=unstitched",
                secondaryButtonLink: bannerData?.secondaryButtonLink || "/products?category=men&type=stitched",
              }

              console.log("🎯 Processed banner:", banner)
              return banner
            })
            .filter((banner) => banner.image) // Only keep banners with valid images

          console.log("🎯 Final formatted banners:", formattedBanners)
          setBanners(formattedBanners)
        } else {
          console.log("⚠️ No banner data found in response")
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
          alt={currentBanner.title || "Sapphire Banner"}
          fill
          className="object-cover"
          priority
          quality={90}
          onError={(e) => {
            console.error("❌ Banner image failed to load:", currentBanner.image)
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg">
            <div className="text-white mb-8">
              <h1 className="text-6xl md:text-8xl font-bold tracking-wider mb-2">
                {currentBanner.title?.split(" ")[0] || "MAN"}
              </h1>
              <h2 className="text-2xl md:text-3xl font-light tracking-widest">{currentBanner.subtitle || "EID II"}</h2>
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
