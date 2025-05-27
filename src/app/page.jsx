"use client"

import Header from "../components/Header"
import HeroBanner from "../components/HeroBanner"
import CategoriesSection from "../components/CategoriesSection"
import Footer from "../components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  )
}
