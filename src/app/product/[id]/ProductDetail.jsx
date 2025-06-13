"use client"

import { useState, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Minus, Plus, ChevronRight } from "lucide-react"

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

ProductImage.displayName = "ProductImage"

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

SizeButton.displayName = "SizeButton"

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

QuantitySelector.displayName = "QuantitySelector"

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

RelatedProduct.displayName = "RelatedProduct"

export default function ProductDetail({ product, relatedProducts }) {
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "")

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

  return (
    <>
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
              {product.images.slice(0, 2).map((image, index) => (
                <ProductImage
                  key={index}
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  priority={index === 0}
                />
              ))}
            </div>

            {product.images.length > 2 && (
              <div className="grid grid-cols-2 gap-4">
                {product.images.slice(2, 4).map((image, index) => (
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
    </>
  )
}
