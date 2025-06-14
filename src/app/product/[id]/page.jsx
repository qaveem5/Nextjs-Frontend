import { cache } from "react"
import { notFound } from "next/navigation"
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"
import ProductDetail from "./ProductDetail"

export const revalidate = 1800 // Revalidate every 30 minutes

// Generate static params for better performance
export async function generateStaticParams() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  try {
    const res = await fetch(`${API_URL}/api/products?pagination[limit]=100&fields[0]=id`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []

    const data = await res.json()

    return (
      data.data?.map((product) => ({
        id: product.id.toString(),
      })) || []
    )
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

// Cached function to get product data
const getProductData = cache(async (id) => {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  try {
    const allProductsRes = await fetch(`${API_URL}/api/products?populate=*`, {
      next: { revalidate: 1800 },
    })

    if (!allProductsRes.ok) {
      throw new Error(`HTTP error! status: ${allProductsRes.status}`)
    }

    const allProductsData = await allProductsRes.json()
    const productFromList = allProductsData.data?.find((p) => p.id === Number.parseInt(id))

    if (!productFromList) {
      return null
    }

    return { productFromList, allProductsData }
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
})

export default async function ProductDetailPage({ params }) {
  const data = await getProductData(params.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProductDetail productData={data.productFromList} allProductsData={data.allProductsData} productId={params.id} />
      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }) {
  const data = await getProductData(params.id)

  if (!data) {
    return {
      title: "Product Not Found - Sapphire",
    }
  }

  const productData = data.productFromList.attributes || data.productFromList

  return {
    title: `${productData.name || "Product"} - Sapphire`,
    description: productData.description || "Shop premium Pakistani fashion at Sapphire",
  }
}
