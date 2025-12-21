import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export async function exportToPDF(events: any[], filters: any) {
  const doc = new jsPDF()

  // Add WHO header
  doc.setFontSize(18)
  doc.setTextColor(0, 86, 179)
  doc.text("WHO Signal Intelligence Report", 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(106, 122, 148)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
  doc.text(`Total Events: ${events.length}`, 14, 34)

  // Add summary statistics
  const grade3 = events.filter((e) => e.grade === "Grade 3").length
  const grade2 = events.filter((e) => e.grade === "Grade 2").length
  const grade1 = events.filter((e) => e.grade === "Grade 1").length

  doc.setFontSize(12)
  doc.setTextColor(44, 62, 80)
  doc.text("Executive Summary", 14, 45)

  doc.setFontSize(10)
  doc.text(`Grade 3 (Critical): ${grade3}`, 20, 52)
  doc.text(`Grade 2 (High): ${grade2}`, 20, 58)
  doc.text(`Grade 1 (Medium): ${grade1}`, 20, 64)

  // Add events table
  const tableData = events.map((e) => [
    e.country,
    e.disease,
    e.grade,
    e.eventType,
    e.cases.toLocaleString(),
    e.deaths.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 75,
    head: [["Country", "Disease", "Grade", "Event Type", "Cases", "Deaths"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 86, 179] },
  })

  doc.save(`WHO-Signals-${new Date().toISOString().split("T")[0]}.pdf`)
}

export function exportToExcel(events: any[]) {
  const ws = XLSX.utils.json_to_sheet(
    events.map((e) => ({
      Country: e.country,
      Disease: e.disease,
      Grade: e.grade,
      "Event Type": e.eventType,
      Status: e.status,
      Cases: e.cases,
      Deaths: e.deaths,
      Description: e.description,
      "Report Date": e.reportDate,
      Latitude: e.lat,
      Longitude: e.lon,
    })),
  )

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "WHO Signals")

  // Add summary sheet
  const summaryData = [
    ["Metric", "Value"],
    ["Total Events", events.length],
    ["Grade 3", events.filter((e) => e.grade === "Grade 3").length],
    ["Grade 2", events.filter((e) => e.grade === "Grade 2").length],
    ["Grade 1", events.filter((e) => e.grade === "Grade 1").length],
    ["Countries Affected", new Set(events.map((e) => e.country)).size],
  ]
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

  XLSX.writeFile(wb, `WHO-Signals-${new Date().toISOString().split("T")[0]}.xlsx`)
}
