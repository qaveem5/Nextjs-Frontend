"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  // Fallback banner data
  const fallbackBanners = [
    {
      id: 1,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WiXZvH1DMetYVAtr1YwqrpU1mAqgHx.png",
    },
  ]

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch(`${API_URL}/api/banners?populate=*&filters[isActive][$eq]=true&sort=order:asc`)

        if (res.ok) {
          const data = await res.json()
          if (data.data && data.data.length > 0) {
            const formattedBanners = data.data.map((banner) => ({
              id: banner.id,
              image: banner.attributes.image?.data?.attributes?.url
                ? `${API_URL}${banner.attributes.image.data.attributes.url}`
                : fallbackBanners[0].image,
            }))
            setBanners(formattedBanners)
          } else {
            setBanners(fallbackBanners)
          }
        } else {
          setBanners(fallbackBanners)
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
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
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentSlide] || fallbackBanners[0]

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.image || "/placeholder.svg"}
          alt="Sapphire Men Collection"
          fill
          className="object-cover"
          priority
          quality={90}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg">
            {/* Title */}
            <div className="text-white mb-8">
              <h1 className="text-6xl md:text-8xl font-bold tracking-wider mb-2">MAN</h1>
              <h2 className="text-2xl md:text-3xl font-light tracking-widest">EID II</h2>
            </div>

            {/* Action Buttons - Both go to Men's listing page */}
            <div className="flex gap-4">
              <Link
                href="/products?category=men&type=unstitched"
                className="bg-white text-black px-8 py-3 font-semibold tracking-wide hover:bg-gray-100 transition-colors"
              >
                UNSTITCHED
              </Link>
              <Link
                href="/products?category=men&type=stitched"
                className="bg-transparent border-2 border-white text-white px-8 py-3 font-semibold tracking-wide hover:bg-white hover:text-black transition-colors"
              >
                STITCHED
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
