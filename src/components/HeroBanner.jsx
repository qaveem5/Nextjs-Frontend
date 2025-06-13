import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import HeroBannerCarousel from "./HeroBannerCarousel"

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

// Function to properly extract Strapi image URLs
function getStrapiImageUrl(imageData) {
  if (!imageData) return null

  // Check if image data has a direct URL property
  if (imageData.url) {
    return imageData.url
  }

  // Check if we have the full Strapi media URL pattern
  if (imageData.name && imageData.documentId) {
    // Try the Strapi Cloud media URL pattern
    return `https://attractive-heart-9d123fcb13.media.strapiapp.com/${imageData.name}`
  }

  // Fallback: construct URL with name only
  if (imageData.name) {
    return `${API_URL}/uploads/${imageData.name}`
  }

  return null
}

// Server component that fetches banner data
export default async function HeroBanner() {
  let banners = []

  try {
    const res = await fetch(`${API_URL}/api/banners?populate=image`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (res.ok) {
      const responseData = await res.json()

      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        banners = responseData.data
          .filter((item) => item.isActive !== false)
          .map((item) => {
            const bannerImage = getStrapiImageUrl(item.image)

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
    }
  } catch (error) {
    console.error("Error fetching banners:", error)
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
      <HeroBannerCarousel banners={banners} />
    </Suspense>
  )
}
