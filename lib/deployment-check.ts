/**
 * Deployment Health Check Utility
 * Server-side only - do not use in client components
 */

export async function checkDeploymentHealth() {
  const checks = {
    database: false,
    dataFetch: false,
    aiService: false,
  }

  const errors: string[] = []

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL environment variable not set")
  } else if (!process.env.DATABASE_URL.includes("afro-server.postgres.database.azure.com")) {
    errors.push("DATABASE_URL does not point to Azure PostgreSQL")
  } else {
    checks.database = true
  }

  // Check WHO Data URL
  if (!process.env.NEXT_PUBLIC_WHO_DATA_URL) {
    errors.push("NEXT_PUBLIC_WHO_DATA_URL environment variable not set")
  } else if (!process.env.NEXT_PUBLIC_WHO_DATA_URL.includes("pub?output=xlsx")) {
    errors.push("NEXT_PUBLIC_WHO_DATA_URL missing /pub?output=xlsx export format")
  } else {
    checks.dataFetch = true
  }

  // Check Azure OpenAI
  if (!process.env.AZURE_OPENAI_API_KEY) {
    errors.push("AZURE_OPENAI_API_KEY not set - AI analysis will not work")
  } else if (!process.env.AZURE_OPENAI_ENDPOINT?.includes("afro-ai-resource")) {
    errors.push("AZURE_OPENAI_ENDPOINT does not match expected resource")
  } else {
    checks.aiService = true
  }

  return {
    healthy: errors.length === 0,
    checks,
    errors,
    timestamp: new Date().toISOString(),
  }
}
