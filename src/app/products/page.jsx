import { Suspense } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import ProductsList from "./ProductsList"

export default function ProductsPage({ searchParams }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getPageTitle(searchParams.category, searchParams.type)}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of premium Pakistani fashion
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <FilterButton href="/products" isActive={!searchParams.category && !searchParams.type}>
              All Products
            </FilterButton>

            <FilterButton
              href="/products?category=men"
              isActive={searchParams.category === "men" && !searchParams.type}
            >
              Men
            </FilterButton>

            <FilterButton href="/products?category=women" isActive={searchParams.category === "women"}>
              Women
            </FilterButton>

            <FilterButton href="/products?category=accessories" isActive={searchParams.category === "accessories"}>
              Accessories
            </FilterButton>

            {searchParams.category === "men" && (
              <>
                <FilterButton
                  href="/products?category=men&type=stitched"
                  isActive={searchParams.category === "men" && searchParams.type === "stitched"}
                >
                  Stitched
                </FilterButton>

                <FilterButton
                  href="/products?category=men&type=unstitched"
                  isActive={searchParams.category === "men" && searchParams.type === "unstitched"}
                >
                  Unstitched
                </FilterButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Listing */}
      <Suspense fallback={<ProductsLoading />}>
        <ProductsList category={searchParams.category} type={searchParams.type} />
      </Suspense>

      <Footer />
    </div>
  )
}

function FilterButton({ href, isActive, children }) {
  return (
    <a
      href={href}
      className={`px-6 py-2 rounded-full transition-colors ${
        isActive ? "bg-black text-white" : "bg-white text-black border border-gray-300 hover:border-black"
      }`}
    >
      {children}
    </a>
  )
}

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

function getPageTitle(category, type) {
  if (category && type) {
    return `${category.charAt(0).toUpperCase() + category.slice(1)} ${
      type.charAt(0).toUpperCase() + type.slice(1)
    } Collection`
  }
  if (category) {
    return `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`
  }
  return "All Products"
}
