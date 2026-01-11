"use server"

export async function getMapboxToken() {
  const token = process.env.MAPBOX_ACCESS_TOKEN || ""

  if (
    !token ||
    token.trim() === "" ||
    token === "undefined" ||
    token === "null" ||
    token.length < 20 ||
    !token.startsWith("pk.")
  ) {
    return ""
  }

  return token
}
