/**
 * Azure OpenAI Connection Test Script
 *
 * Run this to verify your Azure OpenAI setup:
 * npx tsx scripts/test-azure-ai.ts
 */

import { createAzure } from "@ai-sdk/azure"
import { generateText } from "ai"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function testAzureOpenAI() {
  console.log("🔍 Testing Azure OpenAI Configuration...\n")

  // Check environment variable
  const apiKey = process.env.AZURE_OPENAI_API_KEY

  if (!apiKey) {
    console.error("❌ ERROR: AZURE_OPENAI_API_KEY not found in .env.local")
    console.error("Please add your Azure OpenAI API key to .env.local file\n")
    process.exit(1)
  }

  console.log("✅ API Key found:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 5))

  try {
    // Initialize Azure OpenAI
    const azure = createAzure({
      resourceName: "afro-ai-resource",
      apiKey: apiKey,
      baseURL: "https://afro-ai-resource.openai.azure.com/openai/deployments/gpt-4o",
    })

    const gpt4o = azure("gpt-4o")

    console.log("\n🚀 Sending test request to Azure OpenAI...")
    console.log("Resource: afro-ai-resource")
    console.log("Deployment: gpt-4o")
    console.log("Endpoint: https://afro-ai-resource.openai.azure.com/\n")

    // Test with a simple WHO-related query
    const { text, usage } = await generateText({
      model: gpt4o,
      prompt: "What are the WHO grading levels for disease outbreaks? Provide a brief summary.",
      maxTokens: 200,
    })

    console.log("✅ SUCCESS! Azure OpenAI is working correctly.\n")
    console.log("📝 Response:")
    console.log("─".repeat(80))
    console.log(text)
    console.log("─".repeat(80))

    console.log("\n📊 Token Usage:")
    console.log(`   Prompt tokens: ${usage?.promptTokens || 0}`)
    console.log(`   Completion tokens: ${usage?.completionTokens || 0}`)
    console.log(`   Total tokens: ${usage?.totalTokens || 0}`)

    console.log("\n✅ All tests passed! Your Azure OpenAI setup is correct.")
    console.log("   You can now use AI features in the WHO Signal Intelligence Dashboard.\n")
  } catch (error: any) {
    console.error("\n❌ ERROR: Failed to connect to Azure OpenAI\n")

    if (error.message?.includes("401") || error.message?.includes("authentication")) {
      console.error("Authentication Error:")
      console.error("  - Your API key may be invalid or expired")
      console.error("  - Verify your key at: https://portal.azure.com")
      console.error("  - Check that you're using the correct key (Key 1 or Key 2)")
    } else if (error.message?.includes("404")) {
      console.error("Resource Not Found:")
      console.error("  - Check that the resource name is correct: afro-ai-resource")
      console.error("  - Verify the deployment name is: gpt-4o")
      console.error("  - Ensure the deployment is active in Azure Portal")
    } else if (error.message?.includes("429")) {
      console.error("Rate Limit Error:")
      console.error("  - You may have exceeded your API quota")
      console.error("  - Check your usage in Azure Portal")
      console.error("  - Wait a few minutes and try again")
    } else if (error.message?.includes("network") || error.message?.includes("ENOTFOUND")) {
      console.error("Network Error:")
      console.error("  - Check your internet connection")
      console.error("  - Verify the endpoint URL is accessible")
      console.error("  - Check if there are firewall/proxy restrictions")
    } else {
      console.error("Unexpected Error:")
      console.error(error.message)
    }

    console.error("\n📖 Troubleshooting Guide:")
    console.error("1. Verify AZURE_OPENAI_API_KEY in .env.local")
    console.error("2. Check Azure Portal: https://portal.azure.com")
    console.error("3. Navigate to: afro-ai-resource > Keys and Endpoint")
    console.error("4. Ensure GPT-4o deployment is active")
    console.error("5. Check API quota and billing status\n")

    process.exit(1)
  }
}

// Run the test
testAzureOpenAI()
