"use client"

import { useState, useEffect } from "react"

export default function TestPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching data from Strapi...")
        const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
        console.log("API URL:", API_URL)

        const response = await fetch(`${API_URL}/api/products`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log("Data received:", result)
        setData(result)
      } catch (e) {
        console.error("Fetch error:", e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Strapi API Test</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Environment Variables:</h2>
        <p>NEXT_PUBLIC_STRAPI_API_URL: {process.env.NEXT_PUBLIC_STRAPI_API_URL || "Not set"}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Products Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
