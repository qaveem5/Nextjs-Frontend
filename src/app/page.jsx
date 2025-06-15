import { getPayload } from "payload"
import configPromise from "@payload-config"
import { cache } from "react"
import Header from "../components/Header"
import HeroBanner from "../components/HeroBanner"
import CategoriesSection from "../components/CategoriesSection"
import Footer from "../components/Footer"

// Server-side data fetching with caching
const getHomePageData = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch banners and categories in parallel
  const [banners, categories] = await Promise.all([
    payload.find({
      collection: "banners",
      where: {
        isActive: { equals: true },
      },
      limit: 10,
      sort: "order",
    }),
    payload.find({
      collection: "categories",
      where: {
        isActive: { equals: true },
      },
      limit: 20,
      sort: "name",
    }),
  ])

  return {
    banners: banners.docs,
    categories: categories.docs,
  }
})

export default async function HomePage() {
  const { banners, categories } = await getHomePageData()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner banners={banners} />
        <CategoriesSection categories={categories} />
      </main>
      <Footer />
    </div>
  )
}

export const revalidate = 3600 // Revalidate every hour
