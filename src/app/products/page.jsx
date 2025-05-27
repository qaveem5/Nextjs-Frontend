"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

// Using your exact working ProductCard component
const ProductCard = memo(({ product }) => {
  const handleWishlistClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleAddToBag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            quality={80}
            loading="lazy"
          />

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

          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isNew && (
              <span className="bg-black text-white text-xs px-3 py-1 font-semibold rounded-full">NEW</span>
            )}
            {product.isSale && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 font-semibold rounded-full">SALE</span>
            )}
          </div>

          <button
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4 text-gray-700" />
          </button>

          <button
            className="absolute bottom-3 left-3 right-3 bg-black/90 backdrop-blur-sm text-white py-3 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black flex items-center justify-center gap-2 z-10 rounded-lg"
            onClick={handleAddToBag}
          >
            <ShoppingBag className="w-4 h-4" />
            ADD TO BAG
          </button>
        </div>
      </Link>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <div className="font-bold text-gray-900 text-lg">{product.price}</div>

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

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchParams = useSearchParams()
  const category = searchParams.get("category")
  const type = searchParams.get("type")

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products?populate=*`, {
          method: "GET",
          next: { revalidate: 3600 },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const responseData = await res.json()

        if (!responseData.data || !Array.isArray(responseData.data)) {
          setProducts([])
          return
        }

        // Using your exact working data processing logic
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
            } else if (
              productData.gallery.data &&
              Array.isArray(productData.gallery.data) &&
              productData.gallery.data.length > 0
            ) {
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

        // Apply client-side filtering
        let filteredProducts = formattedProducts
        if (category) {
          filteredProducts = filteredProducts.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
        }
        if (type) {
          filteredProducts = filteredProducts.filter((p) => p.type?.toLowerCase() === type.toLowerCase())
        }

        setProducts(filteredProducts)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [API_URL, category, type])

  const getPageTitle = () => {
    if (category && type) {
      return `${category.charAt(0).toUpperCase() + category.slice(1)} ${
        type.charAt(0).toUpperCase() + type.slice(1)
      } Collection`
    }
    if (category) {
      return `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`
    }
    return "All Products"
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{getPageTitle()}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of premium Pakistani fashion
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/products"
              className={`px-6 py-2 rounded-full transition-colors ${
                !category && !type
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-300 hover:border-black"
              }`}
            >
              All Products
            </Link>

            <Link
              href="/products?category=men"
              className={`px-6 py-2 rounded-full transition-colors ${
                category === "men"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-300 hover:border-black"
              }`}
            >
              Men
            </Link>
            <Link
              href="/products?category=women"
              className={`px-6 py-2 rounded-full transition-colors ${
                category === "women"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-300 hover:border-black"
              }`}
            >
              Women
            </Link>
            <Link
              href="/products?category=accessories"
              className={`px-6 py-2 rounded-full transition-colors ${
                category === "accessories"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-300 hover:border-black"
              }`}
            >
              Accessories
            </Link>

            {category === "men" && (
              <>
                <Link
                  href="/products?category=men&type=stitched"
                  className={`px-6 py-2 rounded-full transition-colors ${
                    type === "stitched"
                      ? "bg-black text-white"
                      : "bg-white text-black border border-gray-300 hover:border-black"
                  }`}
                >
                  Stitched
                </Link>
                <Link
                  href="/products?category=men&type=unstitched"
                  className={`px-6 py-2 rounded-full transition-colors ${
                    type === "unstitched"
                      ? "bg-black text-white"
                      : "bg-white text-black border border-gray-300 hover:border-black"
                  }`}
                >
                  Unstitched
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
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
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
                {category && <span> in {category} category</span>}
                {type && <span> ({type})</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products && products.length > 0 ? (
                products.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
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

      <Footer />
    </div>
  )
}
