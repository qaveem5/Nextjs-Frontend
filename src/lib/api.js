// Base URL for your Strapi API
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

// Helper to get full URL for Strapi images
function getStrapiMedia(url) {
  if (!url) return null
  if (url.startsWith("http") || url.startsWith("https")) {
    return url
  }
  return `${API_URL}${url}`
}

// Get all products
async function getProducts() {
  try {
    const url = `${API_URL}/api/products?populate=*`
    console.log("Fetching from:", url)

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`)
      return []
    }

    const responseData = await res.json()
    console.log("Response received, data length:", responseData.data?.length || 0)

    if (!responseData.data || !Array.isArray(responseData.data)) {
      console.log("No valid data array found")
      return []
    }

    const products = responseData.data.map((item) => {
      // Handle colors - they might be a string or array
      let colors = []
      if (item.attributes.colors) {
        if (Array.isArray(item.attributes.colors)) {
          colors = item.attributes.colors
        } else if (typeof item.attributes.colors === "string") {
          colors = [item.attributes.colors]
        }
      }

      return {
        id: item.id,
        name: item.attributes.name,
        slug: item.attributes.slug,
        price: item.attributes.price,
        description: item.attributes.description,
        colors: colors,
        image: item.attributes.image?.data?.attributes?.url
          ? getStrapiMedia(item.attributes.image.data.attributes.url)
          : "/placeholder.svg?height=400&width=300",
      }
    })

    console.log("Processed products:", products.length)
    return products
  } catch (error) {
    console.error("Error fetching products:", error.message)
    return []
  }
}

// Get a single product by ID
async function getProductById(id) {
  try {
    const url = `${API_URL}/api/products/${id}?populate=*`
    console.log("Fetching product by ID from:", url)

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`)
      return null
    }

    const { data } = await res.json()

    // Handle colors - they might be a string or array
    let colors = []
    if (data.attributes.colors) {
      if (Array.isArray(data.attributes.colors)) {
        colors = data.attributes.colors
      } else if (typeof data.attributes.colors === "string") {
        colors = [data.attributes.colors]
      }
    }

    return {
      id: data.id,
      name: data.attributes.name,
      slug: data.attributes.slug,
      price: data.attributes.price,
      description: data.attributes.description,
      colors: colors,
      image: data.attributes.image?.data?.attributes?.url
        ? getStrapiMedia(data.attributes.image.data.attributes.url)
        : "/placeholder.svg?height=600&width=500",
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message)
    return null
  }
}

// Export functions
export { getProducts, getProductById, getStrapiMedia }
