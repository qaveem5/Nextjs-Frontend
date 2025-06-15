"use client"

import { useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"

export default function ProductCard({ product }) {
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
}