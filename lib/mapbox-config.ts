"use server"

export async function getMapboxToken() {
  return process.env.MAPBOX_ACCESS_TOKEN || ""
}
