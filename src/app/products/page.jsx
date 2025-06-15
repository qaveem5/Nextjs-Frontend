import { cache } from "react"
import { Suspense } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import ProductsContent from "./ProductsContent"

export const revalidate = 1800 // Revalidate every 30 minutes

// Cached function to get products
const getProducts = cache(async () => {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  try {
    const res = await fetch(`${API_URL}/api/products?populate=*`, {
      next: { revalidate: 1800 },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    return responseData.data || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
})

function ProductsLoading() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default async function ProductsPage({ searchParams }) {
  const productsData = await getProducts()
  const category = searchParams?.category
  const type = searchParams?.type

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<ProductsLoading />}>
        <ProductsContent productsData={productsData} category={category} type={type} />
      </Suspense>
      <Footer />
    </div>
  )
}

export function generateMetadata({ searchParams }) {
  const category = searchParams?.category
  const type = searchParams?.type

  let title = "All Products - Sapphire"
  if (category && type) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)} - Sapphire`
  } else if (category) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection - Sapphire`
  }

  return {
    title,
    description: "Discover our exquisite collection of premium Pakistani fashion",
  }
}