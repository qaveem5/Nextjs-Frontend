"use client"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Minus, Plus, ChevronRight } from "lucide-react"
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"

// Using your exact working components
const ProductImage = memo(({ src, alt, priority = false }) => (
  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg">
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      className="object-cover hover:scale-105 transition-transform duration-300"
      priority={priority}
      quality={85}
    />
  </div>
))

const SizeButton = memo(({ size, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`min-w-[48px] h-12 px-4 border-2 text-sm font-medium transition-all duration-200 hover:border-gray-900 ${
      isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-900"
    }`}
    aria-pressed={isSelected}
  >
    {size}
  </button>
))

const QuantitySelector = memo(({ quantity, onIncrement, onDecrement }) => (
  <div className="flex items-center border-2 border-gray-900 rounded-full bg-white shadow-sm">
    <button
      onClick={onDecrement}
      className="w-12 h-12 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-l-full border-r border-gray-200"
      aria-label="Decrease quantity"
    >
      <Minus className="w-5 h-5 font-bold" />
    </button>
    <span className="px-8 py-3 min-w-[100px] text-center font-bold text-xl text-gray-900 bg-white">{quantity}</span>
    <button
      onClick={onIncrement}
      className="w-12 h-12 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-r-full border-l border-gray-200"
      aria-label="Increase quantity"
    >
      <Plus className="w-5 h-5 font-bold" />
    </button>
  </div>
))

const RelatedProduct = memo(({ product }) => (
  <Link href={`/product/${product.id}`} className="group block">
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-lg">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          quality={75}
        />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <div className="font-bold text-gray-900">{product.price}</div>
      </div>
    </div>
  </Link>
))

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

        const allProductsRes = await fetch(`${API_URL}/api/products?populate=*`)
        const allProductsData = await allProductsRes.json()

        const productFromList = allProductsData.data?.find((p) => p.id === Number.parseInt(productId))

        if (productFromList) {
          const productData = productFromList.attributes || productFromList

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

          const allImages = []

          // Add main image first
          const mainImage = getStrapiImageUrl(productData.image)
          if (mainImage) {
            allImages.push(mainImage)
          }

          // Add gallery images
          if (productData.gallery) {
            if (Array.isArray(productData.gallery)) {
              productData.gallery.forEach((img) => {
                const imageUrl = getStrapiImageUrl(img)
                if (imageUrl) {
                  allImages.push(imageUrl)
                }
              })
            } else if (productData.gallery.data && Array.isArray(productData.gallery.data)) {
              productData.gallery.data.forEach((img) => {
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
                }
              })
            }
          }

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

          if (formattedProduct.colors.length > 0) {
            setSelectedColor(formattedProduct.colors[0])
          }

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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="mb-6 text-gray-600 text-sm">
              {error || "The product you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              href="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb Navigation */}
      <nav className="border-b bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="container mx-auto px-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li>
              <Link href="/products?category=men" className="hover:text-gray-900 transition-colors">
                Man
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li>
              <Link href="/products?category=men&type=stitched" className="hover:text-gray-900 transition-colors">
                Men's Stitched
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Detail */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {productImages.slice(0, 2).map((image, index) => (
                <ProductImage
                  key={index}
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  priority={index === 0}
                />
              ))}
            </div>

            {productImages.length > 2 && (
              <div className="grid grid-cols-2 gap-4">
                {productImages.slice(2, 4).map((image, index) => (
                  <ProductImage key={index + 2} src={image} alt={`${product.name} view ${index + 3}`} />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Wishlist */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-3">{product.name}</h1>
                <div className="text-3xl font-bold text-gray-900 mb-2">{product.price}</div>
                <div className="text-sm text-gray-600">
                  <strong>SKU:</strong> {product.sku}
                </div>
              </div>
              <button
                className="p-3 hover:bg-gray-100 rounded-full transition-colors ml-4"
                aria-label="Add to wishlist"
              >
                <Heart className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Type Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wide text-sm">TYPE: SLIM FIT</h3>
              <div className="flex gap-3">
                <button className="border-2 border-gray-900 bg-white text-gray-900 px-6 py-3 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors">
                  Slim Fit
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                  SIZE: {selectedSize || "SELECT YOUR SIZE"}
                </h3>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline flex items-center gap-1">
                  📏 Size Chart
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <SizeButton
                    key={size}
                    size={size}
                    isSelected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  />
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <QuantitySelector quantity={quantity} onIncrement={incrementQuantity} onDecrement={decrementQuantity} />
                <button className="flex-1 bg-gray-900 text-white py-4 px-8 font-semibold hover:bg-gray-800 transition-colors uppercase tracking-wide rounded-full text-sm">
                  ADD TO BAG
                </button>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t pt-8">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 py-4 uppercase tracking-wide text-sm">
                  PRODUCT DETAILS
                  <span className="text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="mt-4 text-gray-700 space-y-4 text-sm leading-relaxed">
                  <p>{product.description}</p>

                  <div className="space-y-3">
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

                  <div className="border-t pt-4 mt-6">
                    <p className="font-semibold mb-2">Size & Fit</p>
                    <p>Model Height: 6 Feet 1 Inches</p>
                    <p>Model Wears Size: Medium-Slim Fit</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">You May Also Like</h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProduct key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
