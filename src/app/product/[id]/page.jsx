"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Minus, Plus, ChevronRight } from "lucide-react"

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [productImages, setProductImages] = useState([])
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  useEffect(() => {
    async function fetchProduct() {
      try {
        const resolvedParams = await params
        const productId = resolvedParams.id

        // Get all products to find the specific one
        const allProductsRes = await fetch(`${API_URL}/api/products?populate=*`)
        const allProductsData = await allProductsRes.json()

        console.log("All products data:", JSON.stringify(allProductsData, null, 2))

        const productFromList = allProductsData.data?.find((p) => p.id === Number.parseInt(productId))

        if (productFromList) {
          const productData = productFromList.attributes || productFromList

          const getStrapiImageUrl = (imageData) => {
            if (!imageData) return null

            // Handle different Strapi image data structures
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

          // Get all product images (main + gallery)
          const allImages = []

          // Add main image first
          const mainImage = getStrapiImageUrl(productData.image)
          if (mainImage) {
            allImages.push(mainImage)
            console.log("Added main image:", mainImage)
          }

          // Add gallery images - COMPLETELY REWRITTEN LOGIC
          console.log("Raw gallery data:", JSON.stringify(productData.gallery, null, 2))

          // Check if gallery exists
          if (productData.gallery) {
            console.log("Gallery field exists")

            // Check if it's an array directly (some Strapi versions)
            if (Array.isArray(productData.gallery)) {
              console.log(`Gallery is direct array with ${productData.gallery.length} items`)
              productData.gallery.forEach((img, index) => {
                const imageUrl = getStrapiImageUrl(img)
                if (imageUrl) {
                  allImages.push(imageUrl)
                  console.log(`Added direct gallery image ${index + 1}:`, imageUrl)
                }
              })
            }
            // Check if it has data property with array
            else if (productData.gallery.data && Array.isArray(productData.gallery.data)) {
              console.log(`Gallery has data array with ${productData.gallery.data.length} items`)
              productData.gallery.data.forEach((img, index) => {
                console.log(`Processing gallery image ${index + 1}:`, JSON.stringify(img, null, 2))

                // Try different structures
                let imageUrl = null

                if (img.attributes?.url) {
                  const url = img.attributes.url
                  imageUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                } else if (img.url) {
                  const url = img.url
                  imageUrl = url.startsWith("http") ? url : `${API_URL}${url}`
                }

                if (imageUrl) {
                  allImages.push(imageUrl)
                  console.log(`Added gallery image ${index + 1}:`, imageUrl)
                } else {
                  console.log(`Failed to get URL for gallery image ${index + 1}:`, img)
                }
              })
            } else {
              console.log("Gallery exists but has unexpected structure:", productData.gallery)
            }
          } else {
            console.log("No gallery field found")
          }

          console.log("Final all product images:", allImages)
          setProductImages(allImages)

          const formattedProduct = {
            id: productFromList.id,
            name: productData.name,
            slug: productData.slug,
            price: productData.price,
            description: productData.description,
            colors: Array.isArray(productData.colors)
              ? productData.colors
              : productData.colors
                ? [productData.colors]
                : ["Black"],
            sizes: Array.isArray(productData.sizes)
              ? productData.sizes
              : productData.sizes
                ? [productData.sizes]
                : ["XS", "S", "M", "L"],
            sku: productData.sku || `00002561DAD7_SLM`,
            features: productData.features || [],
          }

          setProduct(formattedProduct)

          // Set default selections
          if (formattedProduct.colors.length > 0) {
            setSelectedColor(formattedProduct.colors[0])
          }

          // Set related products (exactly 3 like in the official site)
          const filtered = allProductsData.data
            .filter((item) => item.id !== Number.parseInt(productId))
            .slice(0, 3)
            .map((item) => {
              const relatedData = item.attributes || item
              const relatedImageUrl = getStrapiImageUrl(relatedData.image)
              return {
                id: item.id,
                name: relatedData.name,
                slug: relatedData.slug,
                price: relatedData.price,
                image: relatedImageUrl,
              }
            })

          setRelatedProducts(filtered)
        } else {
          throw new Error(`Product with ID ${productId} not found`)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params, API_URL])

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-6 text-gray-600 text-sm">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/" className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <nav className="border-b bg-gray-50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/" className="hover:text-gray-900">
              Man
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/" className="hover:text-gray-900">
              Men's Stitched
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images - Exactly like Sapphire */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Show first 2 images side by side like in the official site */}
              {productImages.slice(0, 2).map((image, index) => (
                <div key={index} className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Additional images if more than 2 */}
            {productImages.length > 2 && (
              <div className="grid grid-cols-2 gap-4">
                {productImages.slice(2, 4).map((image, index) => (
                  <div key={index + 2} className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 3}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Debug info */}
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Total images: {productImages.length}
              {productImages.length > 0 && (
                <div className="mt-1">
                  Images: {productImages.map((img, i) => `${i + 1}. ${img.split("/").pop()}`).join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Exactly like Sapphire */}
          <div className="space-y-6">
            {/* Title and Wishlist */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">{product.name}</h1>
                <div className="text-2xl font-bold text-gray-900">{product.price}</div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* SKU */}
            <div className="text-sm text-gray-600">
              <strong>SKU:</strong> {product.sku}
            </div>

            {/* Type Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 uppercase tracking-wide">TYPE: SLIM FIT</h3>
              <div className="flex gap-2">
                <button className="border border-gray-900 bg-white text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors">
                  Slim Fit
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 uppercase tracking-wide">
                  SIZE: {selectedSize ? selectedSize : "SELECT YOUR SIZE"}
                </h3>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">📏 Size Chart</button>
              </div>
              <div className="flex gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 hover:border-gray-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-full">
                <button
                  onClick={decrementQuantity}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center font-medium">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button className="flex-1 bg-gray-900 text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors uppercase tracking-wide rounded-full">
                ADD TO BAG
              </button>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t pt-6">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 py-3 uppercase tracking-wide">
                  PRODUCT DETAILS
                  <span className="text-2xl group-open:rotate-45 transition-transform">—</span>
                </summary>
                <div className="mt-4 text-gray-700 space-y-4 text-sm">
                  <p>{product.description}</p>

                  <div className="space-y-2">
                    <p>
                      <strong>Details:</strong> Band Around the Placket Front Panel, Dyed Embroidered Back Panel, Band
                      Neckline, Open Sleeves, Standard Length
                    </p>
                    <p>
                      <strong>Colour:</strong> {selectedColor}
                    </p>
                    <p>
                      <strong>Fabric:</strong> Schiffli Cotton
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium">Size & Fit</p>
                    <p>Model Height: 6 Feet 1 Inches</p>
                    <p>Model Wears Size: medium-slim fit</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* You May Also Like - Centered like official site */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">You May Also Like</h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
                {relatedProducts.map((relatedProduct) => (
                  <Link href={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="group">
                    <div className="space-y-3">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <Image
                          src={relatedProduct.image || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900 mb-1">{relatedProduct.name}</h3>
                        <div className="font-bold text-gray-900">{relatedProduct.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
