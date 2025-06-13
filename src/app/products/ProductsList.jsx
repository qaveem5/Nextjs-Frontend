import ProductCard from "../../components/ProductCard"

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

export default async function ProductsList({ category, type }) {
  let products = []
  let error = null

  try {
    const res = await fetch(`${API_URL}/api/products?populate=*`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()

    if (responseData.data && Array.isArray(responseData.data)) {
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
          category: productData.category || "",
          type: productData.type || "",
        }
      })

      // Apply server-side filtering
      let filteredProducts = formattedProducts
      if (category) {
        filteredProducts = filteredProducts.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
      }
      if (type) {
        filteredProducts = filteredProducts.filter((p) => p.type?.toLowerCase() === type.toLowerCase())
      }

      products = filteredProducts
    }
  } catch (err) {
    error = err.message
    console.error("Error fetching products:", err)
  }

  if (error) {
    return (
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
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
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
    </main>
  )
}
