/**
 * Utility function to extract image URLs from Strapi responses
 * @param {Object} imageData - The image data from Strapi
 * @param {string} apiUrl - The base API URL
 * @returns {string|null} - The full image URL or null if not found
 */
export function getStrapiImageUrl(imageData, apiUrl) {
  if (!imageData) {
    return null
  }

  // Handle the specific Strapi structure we're seeing in your API
  if (imageData.name && imageData.documentId) {
    // Construct URL from documentId and name
    return `${apiUrl}/uploads/${imageData.name}`
  }

  // Handle case where image is an object with data property
  if (imageData.data && imageData.data.attributes && imageData.data.attributes.url) {
    const url = imageData.data.attributes.url
    return url.startsWith("http") ? url : `${apiUrl}${url}`
  }

  // Handle direct URL in the image object
  if (imageData.url) {
    return imageData.url.startsWith("http") ? imageData.url : `${apiUrl}${imageData.url}`
  }

  // Handle string URL
  if (typeof imageData === "string") {
    return imageData.startsWith("http") ? imageData : `${apiUrl}${imageData}`
  }

  // Fallback to placeholder
  return null
}
