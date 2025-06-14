import { cache } from "react"
import Header from "../components/Header"
import HeroBanner from "../components/HeroBanner"
import CategoriesSection from "../components/CategoriesSection"
import Footer from "../components/Footer"

export const revalidate = 3600 // Revalidate every hour

// Cached function to get home page data
const getHomePageData = cache(async () => {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  try {
    // Fetch both banners and categories in parallel for better performance
    const [bannersRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/api/banners?populate=image`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/api/categories?populate=image`, {
        next: { revalidate: 3600 },
      }),
    ])

    const [bannersData, categoriesData] = await Promise.all([
      bannersRes.ok ? bannersRes.json() : { data: [] },
      categoriesRes.ok ? categoriesRes.json() : { data: [] },
    ])

    return {
      banners: bannersData.data || [],
      categories: categoriesData.data || [],
      success: true,
    }
  } catch (error) {
    console.error("Error fetching home page data:", error)
    return {
      banners: [],
      categories: [],
      success: false,
    }
  }
})

export default async function HomePage() {
  const homeData = await getHomePageData()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner banners={homeData.banners} />
        <CategoriesSection categories={homeData.categories} />
      </main>
      <Footer />
    </div>
  )
}

export function generateMetadata() {
  return {
    title: "Sapphire - Premium Pakistani Fashion",
    description: "Discover our exquisite collection of premium Pakistani fashion for men and women",
    keywords: "Pakistani fashion, clothing, men, women, stitched, unstitched",
  }
}
