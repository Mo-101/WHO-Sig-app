"use server"

export async function getMapboxToken() {
  const token = process.env.MAPBOX_ACCESS_TOKEN || ""

  // Return empty string if token is invalid to trigger proper error UI
  if (
    !token ||
    token.trim() === "" ||
    token === "undefined" ||
    token === "null" ||
    token.length < 20 ||
    !token.startsWith("pk.")
  ) {
    console.error("[v0] Invalid or missing Mapbox token")
    return ""
  }

  return token
}
