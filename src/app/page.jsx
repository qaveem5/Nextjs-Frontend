"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products?populate=*`, {
          method: "GET",
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const responseData = await res.json()
        console.log("Full API Response:", JSON.stringify(responseData, null, 2))

        if (!responseData.data || !Array.isArray(responseData.data)) {
          setProducts([])
          return
        }

        // Map the data according to your Strapi structure
        const formattedProducts = responseData.data.map((item) => {
          const productData = item.attributes || item
          console.log(`Processing product ${item.id}:`, JSON.stringify(productData, null, 2))

          // Helper function to get Strapi image URL
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

          // Get main image
          const mainImage = getStrapiImageUrl(productData.image)
          console.log(`Product ${item.id} main image:`, mainImage)

          // Get gallery images for hover effect - REWRITTEN LOGIC
          let secondaryImage = mainImage // Default fallback

          // Debug gallery structure
          console.log(`Product ${item.id} gallery structure:`, JSON.stringify(productData.gallery, null, 2))

          // Check if gallery exists
          if (productData.gallery) {
            console.log(`Product ${item.id} has gallery field`)

            // Check if it's an array directly
            if (Array.isArray(productData.gallery) && productData.gallery.length > 0) {
              console.log(`Product ${item.id} gallery is direct array with ${productData.gallery.length} items`)
              const firstGalleryImage = productData.gallery[0]
              const galleryUrl = getStrapiImageUrl(firstGalleryImage)
              if (galleryUrl) {
                secondaryImage = galleryUrl
                console.log(`Product ${item.id} using direct gallery image for hover:`, secondaryImage)
              }
            }
            // Check if it has data property with array
            else if (
              productData.gallery.data &&
              Array.isArray(productData.gallery.data) &&
              productData.gallery.data.length > 0
            ) {
              console.log(`Product ${item.id} gallery has data array with ${productData.gallery.data.length} items`)
              const firstGalleryImage = productData.gallery.data[0]
              console.log(
                `Product ${item.id} first gallery image structure:`,
                JSON.stringify(firstGalleryImage, null, 2),
              )

              // Gallery images have structure: { attributes: { url: "..." } }
              if (firstGalleryImage.attributes?.url) {
                const galleryUrl = firstGalleryImage.attributes.url
                secondaryImage = galleryUrl.startsWith("http") ? galleryUrl : `${API_URL}${galleryUrl}`
                console.log(`Product ${item.id} using gallery image for hover:`, secondaryImage)
              } else if (firstGalleryImage.url) {
                const galleryUrl = firstGalleryImage.url
                secondaryImage = galleryUrl.startsWith("http") ? galleryUrl : `${API_URL}${galleryUrl}`
                console.log(`Product ${item.id} using gallery image for hover:`, secondaryImage)
              } else {
                console.log(`Product ${item.id} gallery image has no URL:`, firstGalleryImage)
              }
            } else {
              console.log(`Product ${item.id} gallery exists but has no usable data`)
            }
          } else {
            console.log(`Product ${item.id} has no gallery field`)
          }

          return {
            id: item.id,
            name: productData.name || "Unnamed Product",
            slug: productData.slug || "",
            price: productData.price || "Price not available",
            description: productData.description || "",
            colors: Array.isArray(productData.colors)
              ? productData.colors
              : productData.colors
                ? [productData.colors]
                : [],
            image: mainImage,
            secondaryImage: secondaryImage,
            isNew: productData.isNew || false,
            isSale: productData.isSale || false,
          }
        })

        console.log("Final formatted products:", formattedProducts)
        setProducts(formattedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [API_URL])

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">Sapphire Men</h1>
          <p className="text-center text-gray-600">Shalwar Kameez Collection</p>
        </div>
      </header>

      {/* Product Listing */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">Connection Error</h3>
              <p className="text-red-700 mb-4">Unable to connect to Strapi server.</p>
              <p className="text-sm text-red-600">Error: {error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="group relative">
                  <Link href={`/product/${product.id}`} className="block">
                    {/* Product Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                      {/* Main Image */}
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                      />

                      {/* Secondary Image (shown on hover) - Only if different from main */}
                      {product.secondaryImage && product.secondaryImage !== product.image && (
                        <Image
                          src={product.secondaryImage || "/placeholder.svg"}
                          alt={`${product.name} hover`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                        />
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {product.isNew && (
                          <span className="bg-black text-white text-xs px-2 py-1 font-medium">NEW IN</span>
                        )}
                        {product.isSale && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 font-medium">SALE</span>
                        )}
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-50 z-10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("Added to wishlist:", product.name)
                        }}
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>

                      {/* Add to Bag Button */}
                      <button
                        className="absolute bottom-3 right-3 bg-black text-white px-4 py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-800 flex items-center gap-2 z-10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("Added to bag:", product.name)
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        ADD TO BAG
                      </button>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <div className="font-bold text-gray-900 mb-2">{product.price}</div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-500">Colors:</span>
                        <div className="flex gap-1">
                          {product.colors.map((color, index) => (
                            <span key={index} className="text-xs text-gray-700">
                              {color}
                              {index < product.colors.length - 1 ? "," : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500">No products found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
