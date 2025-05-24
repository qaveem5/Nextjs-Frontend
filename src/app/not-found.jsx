import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6 text-gray-600 text-sm">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/" className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
          Back to Products
        </Link>
      </div>
    </div>
  )
}
