"use client"

import Link from "next/link"

export default function ProductsClient({ searchParams }) {
  const { category, type } = searchParams

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      <Link
        href="/products"
        className={`px-6 py-2 rounded-full transition-colors ${
          !category && !type ? "bg-black text-white" : "bg-white text-black border border-gray-300 hover:border-black"
        }`}
      >
        All Products
      </Link>

      <Link
        href="/products?category=men"
        className={`px-6 py-2 rounded-full transition-colors ${
          category === "men" ? "bg-black text-white" : "bg-white text-black border border-gray-300 hover:border-black"
        }`}
      >
        Men
      </Link>
      <Link
        href="/products?category=women"
        className={`px-6 py-2 rounded-full transition-colors ${
          category === "women" ? "bg-black text-white" : "bg-white text-black border border-gray-300 hover:border-black"
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
  )
}
