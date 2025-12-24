/**
 * WHO Data Source Test Script
 *
 * Run this to verify your data source URL:
 * npx tsx scripts/test-data-source.ts
 */

import * as XLSX from "xlsx"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function testDataSource() {
  console.log("🔍 Testing WHO Data Source Connection...\n")

  const dataUrl = process.env.NEXT_PUBLIC_WHO_DATA_URL

  if (!dataUrl) {
    console.error("❌ ERROR: NEXT_PUBLIC_WHO_DATA_URL not found in .env.local")
    console.error("Please add your data source URL to .env.local file")
    console.error("\nExample:")
    console.error("NEXT_PUBLIC_WHO_DATA_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=xlsx\n")
    process.exit(1)
  }

  console.log("✅ Data URL found:")
  console.log(`   ${dataUrl}\n`)

  try {
    console.log("🚀 Fetching data from URL...")

    const response = await fetch(dataUrl, {
      headers: {
        "User-Agent": "WHO-Signal-Intelligence-Dashboard/1.0",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    console.log(`✅ Response received (${response.status} ${response.statusText})`)
    console.log(`   Content-Type: ${contentType}`)

    const arrayBuffer = await response.arrayBuffer()
    console.log(`   Size: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB\n`)

    console.log("📊 Parsing XLSX data...")
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    console.log(`✅ Workbook parsed successfully`)
    console.log(`   Total sheets: ${workbook.SheetNames.length}`)
    console.log(`   Sheet names: ${workbook.SheetNames.join(", ")}\n`)

    // Analyze each sheet
    let totalRows = 0
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      console.log(`📋 Sheet: "${sheetName}"`)
      console.log(`   Rows: ${jsonData.length}`)

      if (jsonData.length > 0) {
        const firstRow = jsonData[0] as any
        const columns = Object.keys(firstRow)
        console.log(`   Columns (${columns.length}): ${columns.join(", ")}`)

        // Check for required columns
        const requiredColumns = ["country", "disease", "latitude", "longitude", "grade"]
        const missingColumns = requiredColumns.filter(
          (col) =>
            !columns.some((c) => c.toLowerCase().includes(col.substring(0, 3))) && // Check partial match
            !columns.some((c) => c.toLowerCase() === col),
        )

        if (missingColumns.length > 0) {
          console.log(`   ⚠️  Potentially missing columns: ${missingColumns.join(", ")}`)
          console.log(`      (Check if they use different names)`)
        } else {
          console.log(`   ✅ All essential columns found`)
        }

        // Show sample data
        console.log(`   Sample row:`, JSON.stringify(firstRow, null, 2).split("\n").slice(0, 10).join("\n     "))
      }

      console.log("")
      totalRows += jsonData.length
    }

    console.log("─".repeat(80))
    console.log(`✅ SUCCESS! Data source is accessible and valid.`)
    console.log(`   Total sheets: ${workbook.SheetNames.length}`)
    console.log(`   Total data rows: ${totalRows}`)
    console.log(`\n   Your WHO Signal Intelligence Dashboard should be able to fetch this data.\n`)

    // Recommendations
    console.log("💡 Recommendations:")
    if (totalRows === 0) {
      console.log("   ⚠️  No data found in any sheets. Add some outbreak data to your sheet.")
    } else if (totalRows < 5) {
      console.log("   ⚠️  Very few rows found. Consider adding more data for better dashboard experience.")
    } else {
      console.log("   ✅ Good amount of data available for analysis.")
    }

    if (dataUrl.includes("docs.google.com")) {
      console.log("   ✅ Using Google Sheets - make sure it's shared publicly ('Anyone with link can view')")
    }

    console.log("")
  } catch (error: any) {
    console.error("\n❌ ERROR: Failed to fetch or parse data\n")

    if (error.message?.includes("404")) {
      console.error("Not Found (404):")
      console.error("  - The URL does not exist or is incorrect")
      console.error("  - For Google Sheets, verify the sheet ID is correct")
      console.error("  - Check that the sheet is shared publicly")
    } else if (error.message?.includes("403")) {
      console.error("Access Denied (403):")
      console.error("  - The sheet is not shared publicly")
      console.error("  - Go to Google Sheets > Share > 'Anyone with link can view'")
    } else if (error.message?.includes("network") || error.message?.includes("ENOTFOUND")) {
      console.error("Network Error:")
      console.error("  - Check your internet connection")
      console.error("  - Verify the URL is accessible")
    } else {
      console.error("Error:", error.message)
    }

    console.error("\n📖 Troubleshooting:")
    console.error("1. Verify NEXT_PUBLIC_WHO_DATA_URL in .env.local")
    console.error("2. Test the URL in your browser (should download an XLSX file)")
    console.error("3. For Google Sheets:")
    console.error("   - URL format: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=xlsx")
    console.error("   - Make sure sheet is shared publicly")
    console.error("4. For other sources, ensure URL returns a valid XLSX file\n")

    process.exit(1)
  }
}

// Run the test
testDataSource()
