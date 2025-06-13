import { notFound } from "next/navigation"
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"
import ProductDetail from "./ProductDetail"

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

export default async function ProductDetailPage({ params }) {
  let product = null
  let relatedProducts = []

  try {
    const allProductsRes = await fetch(`${API_URL}/api/products?populate=*`, {
      next: { revalidate: 3600 },
    })
    const allProductsData = await allProductsRes.json()

    const productFromList = allProductsData.data?.find((p) => p.id === Number.parseInt(params.id))

    if (!productFromList) {
      notFound()
    }

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

    product = {
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
      images: allImages,
    }

    // Get related products
    relatedProducts = allProductsData.data
      .filter((item) => item.id !== Number.parseInt(params.id))
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
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
      <Footer />
    </div>
  )
}
