"use client"

import { useState, useEffect, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"

// Memoized ProductCard component for better performance
const ProductCard = memo(({ product }) => {
  const handleWishlistClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Add wishlist logic here
  }, [])

  const handleAddToBag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Add to bag logic here
  }, [])

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded-lg">
          {/* Main Image */}
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            quality={80}
            loading="lazy"
          />

          {/* Secondary Image (shown on hover) */}
          {product.secondaryImage && product.secondaryImage !== product.image && (
            <Image
              src={product.secondaryImage || "/placeholder.svg"}
              alt={`${product.name} hover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              quality={80}
              loading="lazy"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isNew && (
              <span className="bg-black text-white text-xs px-3 py-1 font-semibold rounded-full">NEW</span>
            )}
            {product.isSale && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 font-semibold rounded-full">SALE</span>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4 text-gray-700" />
          </button>

          {/* Add to Bag Button */}
          <button
            className="absolute bottom-3 left-3 right-3 bg-black/90 backdrop-blur-sm text-white py-3 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black flex items-center justify-center gap-2 z-10 rounded-lg"
            onClick={handleAddToBag}
          >
            <ShoppingBag className="w-4 h-4" />
            ADD TO BAG
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <div className="font-bold text-gray-900 text-lg">{product.price}</div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Available in:</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <span key={index} className="text-xs text-gray-600 capitalize">
                  {color}
                  {index < Math.min(product.colors.length - 1, 2) ? "," : ""}
                </span>
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-500">+{product.colors.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ProductCard.displayName = "ProductCard"

// Loading skeleton component
const ProductSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
))

ProductSkeleton.displayName = "ProductSkeleton"

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
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const responseData = await res.json()

        if (!responseData.data || !Array.isArray(responseData.data)) {
          setProducts([])
          return
        }

        // Optimized data processing
        const formattedProducts = responseData.data.map((item) => {
          const productData = item.attributes || item

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

          const mainImage = getStrapiImageUrl(productData.image)
          let secondaryImage = mainImage

          // Get secondary image from gallery
          if (productData.gallery) {
            if (Array.isArray(productData.gallery) && productData.gallery.length > 0) {
              const galleryUrl = getStrapiImageUrl(productData.gallery[0])
              if (galleryUrl) secondaryImage = galleryUrl
            } else if (productData.gallery.data && Array.isArray(productData.gallery.data) && productData.gallery.data.length > 0) {
              const firstGalleryImage = productData.gallery.data[0]
              if (firstGalleryImage.attributes?.url) {
                const galleryUrl = firstGalleryImage.attributes.url
                secondaryImage = galleryUrl.startsWith("http") ? galleryUrl : `${API_URL}${galleryUrl}`
              }
            }
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

        setProducts(formattedProducts)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [API_URL])

  return (
    <div className="min-h-screen bg-white">
      {/* Beautiful Header */}
      <header className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\">%3Cg fill=\\"none\\" fillRule=\\"evenodd\\">%3Cg fill=\\"%23ffffff\\" fillOpacity=\\"0.1\\">%3Ccircle cx=\\"30\\" cy=\\"30\\" r=\\"2\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>\
        </div>
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Brand Logo/Title */}
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  SAPPHIRE
                </span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Collection Title */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-200">
                Men's Premium Collection
              </h2>
              <p className="text-lg md:text-xl text-gray-300 font-medium">
                Shalwar Kameez • Kurtas • Traditional Wear
              </p>
              <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Discover our exquisite range of traditional Pakistani menswear, crafted with premium fabrics and contemporary designs
              </p>
            </div>

            {/* Stats or Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">100+</div>
                <div className="text-sm text-gray-300">Premium Designs</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-400">✨</div>
                <div className="text-sm text-gray-300">Handcrafted Quality</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-400">🚚</div>
                <div className="text-sm text-gray-300">Free Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </svg>
        </div>
      </header>

      {/* Product Listing */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
              <p className="text-red-700 mb-4">Unable to load products. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Products Count */}
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No products available at the moment</p>
                  <p className="text-gray-400 text-sm mt-2">Please check back later</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )\
}
