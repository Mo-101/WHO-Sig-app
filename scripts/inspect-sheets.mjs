import XLSX from "xlsx"

const SHEET_URL =
  process.env.WHO_SHEET_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA/pub?output=xlsx"

const args = process.argv.slice(2)
const targetSheets =
  args.length > 0
    ? args
    : [
        "PHE 20251023",
        "Signal Verification Sheet",
        "RRA",
        "EIS",
        "HeRAMS",
        "CountryCode",
        "GIS_AdminLevels",
      ]

async function fetchWorkbook() {
  const res = await fetch(SHEET_URL)
  if (!res.ok) {
    throw new Error(`Sheet fetch failed: ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return XLSX.read(arrayBuffer, { type: "array" })
}

function summarizeSheet(workbook, sheetName) {
  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    console.warn(`\n[inspect] Sheet "${sheetName}" is missing.`)
    return
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false })
  console.log(`\n=== ${sheetName} ===`)
  console.log(`Rows: ${rows.length}`)

  if (!rows.length) return

  const headerSet = new Set()
  rows.slice(0, 25).forEach((row) => {
    Object.keys(row).forEach((key) => headerSet.add(key))
  })

  console.log("Headers:", Array.from(headerSet))
  console.log("First row sample:", rows[0])
}

;(async () => {
  try {
    const workbook = await fetchWorkbook()

    console.log("Available sheets:", workbook.SheetNames)

    for (const sheetName of targetSheets) {
      summarizeSheet(workbook, sheetName)
    }
  } catch (error) {
    console.error("[inspect] Failed to inspect sheets:", error)
    process.exit(1)
  }
})()
