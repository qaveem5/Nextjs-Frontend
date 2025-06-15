import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import HeroBannerClient from "./HeroBannerClient"

// Function to properly extract Strapi image URLs (keeping your exact logic)
function getStrapiImageUrl(imageData) {
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
    const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
    const fallbackUrl = `${API_URL}/uploads/${imageData.name}`
    console.log("✅ Constructed fallback URL:", fallbackUrl)
    return fallbackUrl
  }

  console.log("❌ Could not extract image URL from:", imageData)
  return null
}

// Process banners data (keeping your exact logic)
function processBanners(bannersData) {
  if (!bannersData || !Array.isArray(bannersData)) return []

  return bannersData
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
}

export default function HeroBanner({ banners: bannersData }) {
  const banners = processBanners(bannersData)

  if (!banners.length) {
    return (
      <div className="relative h-[70vh] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">No banners available</div>
        </div>
      </div>
    )
  }

  // If only one banner, render it directly (no client-side logic needed)
  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <section className="relative h-[70vh] overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={banner.image || "/placeholder.svg"}
            alt={banner.title || "Banner"}
            fill
            className="object-cover"
            priority
            quality={90}
            onError={(e) => {
              console.error("❌ Banner image failed to load:", banner.image)
              e.currentTarget.src = "/placeholder.svg?height=800&width=1600"
            }}
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg">
              <div className="text-white mb-8">
                <h1 className="text-6xl md:text-8xl font-bold tracking-wider mb-2">{banner.title}</h1>
                <h2 className="text-2xl md:text-3xl font-light tracking-widest">{banner.subtitle}</h2>
              </div>

              <div className="flex gap-4">
                <Link
                  href={banner.primaryButtonLink}
                  className="bg-white text-black px-8 py-3 font-semibold tracking-wide hover:bg-gray-100 transition-colors"
                >
                  {banner.primaryButtonText}
                </Link>
                <Link
                  href={banner.secondaryButtonLink}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 font-semibold tracking-wide hover:bg-white hover:text-black transition-colors"
                >
                  {banner.secondaryButtonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If multiple banners, use client component for carousel functionality
  return (
    <Suspense
      fallback={
        <div className="relative h-[70vh] bg-gray-100 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">Loading banners...</div>
          </div>
        </div>
      }
    >
      <HeroBannerClient banners={banners} />
    </Suspense>
  )
}