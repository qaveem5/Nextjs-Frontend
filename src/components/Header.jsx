"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-black text-white text-center py-2 px-4 text-sm">
        <p className="flex items-center justify-center gap-1">
          Get your Eid looks in time! ✨ Place your orders by 31st May for delivery before Eid. For Lahore customers
          only!
        </p>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Header Row */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold tracking-wider">
              SAPPHIRE
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="FIND YOUR FAVOURITES"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:border-black text-sm uppercase tracking-wide"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-4">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={`${isMenuOpen ? "block" : "hidden"} md:block border-t md:border-t-0 py-4 md:py-0`}>
            <ul className="flex flex-col md:flex-row md:items-center md:justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm font-medium tracking-wide">
              <li>
                <Link href="/products" className="hover:text-gray-600 transition-colors">
                  ALL PRODUCTS
                </Link>
              </li>
              <li>
                <Link href="/new-in" className="hover:text-gray-600 transition-colors">
                  NEW IN
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="hover:text-gray-600 transition-colors">
                  WOMAN
                </Link>
              </li>
              <li>
                <Link href="/products?category=men" className="hover:text-gray-600 transition-colors">
                  MAN
                </Link>
              </li>
              <li>
                <Link href="/mini-me" className="hover:text-gray-600 transition-colors">
                  MINI ME
                </Link>
              </li>
              <li>
                <Link href="/fragrances" className="hover:text-gray-600 transition-colors">
                  FRAGRANCES
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-gray-600 transition-colors">
                  ACCESSORIES
                </Link>
              </li>
              <li>
                <Link href="/special-offers" className="text-red-600 hover:text-red-700 transition-colors">
                  SPECIAL OFFERS
                </Link>
              </li>
              <li>
                <Link href="/the-edit" className="hover:text-gray-600 transition-colors">
                  THE EDIT
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  )
}