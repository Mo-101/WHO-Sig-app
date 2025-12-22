import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export async function exportToPDF(events: any[], filters: any, dateRange?: { start: string; end: string }) {
  const doc = new jsPDF()

  // WHO Header with branding
  doc.setFontSize(20)
  doc.setTextColor(0, 86, 179)
  doc.text("WHO AFRO Signal Intelligence Report", 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(106, 122, 148)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
  doc.text(`Report Period: ${dateRange?.start || "All time"} - ${dateRange?.end || "Current"}`, 14, 34)
  doc.text(`Total Events: ${events.length}`, 14, 40)

  // Executive Summary
  const grade3 = events.filter((e) => e.grade === "Grade 3").length
  const grade2 = events.filter((e) => e.grade === "Grade 2").length
  const grade1 = events.filter((e) => e.grade === "Grade 1").length
  const totalCases = events.reduce((sum, e) => sum + (e.cases || 0), 0)
  const totalDeaths = events.reduce((sum, e) => sum + (e.deaths || 0), 0)
  const cfr = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : "0"
  const countriesAffected = new Set(events.map((e) => e.country)).size

  doc.setFontSize(14)
  doc.setTextColor(44, 62, 80)
  doc.text("Executive Summary", 14, 52)

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(
    `This report covers ${events.length} disease outbreak events across ${countriesAffected} African countries.`,
    14,
    60,
  )
  doc.text(
    `The overall case fatality rate is ${cfr}% with ${totalCases.toLocaleString()} cases and ${totalDeaths.toLocaleString()} deaths reported.`,
    14,
    66,
  )
  doc.text(`Critical Grade 3 events require immediate attention: ${grade3} active alerts.`, 14, 72)

  // Key Metrics
  doc.setFontSize(12)
  doc.setTextColor(44, 62, 80)
  doc.text("Key Metrics", 14, 85)

  doc.setFontSize(10)
  const metricsY = 93
  doc.setTextColor(255, 51, 85)
  doc.text(`● Grade 3 (Critical): ${grade3}`, 20, metricsY)
  doc.setTextColor(255, 153, 51)
  doc.text(`● Grade 2 (High): ${grade2}`, 20, metricsY + 6)
  doc.setTextColor(255, 204, 0)
  doc.text(`● Grade 1 (Medium): ${grade1}`, 20, metricsY + 12)
  doc.setTextColor(60, 60, 60)
  doc.text(`● Total Cases: ${totalCases.toLocaleString()}`, 20, metricsY + 18)
  doc.text(`● Total Deaths: ${totalDeaths.toLocaleString()}`, 20, metricsY + 24)
  doc.text(`● Countries Affected: ${countriesAffected}`, 20, metricsY + 30)

  // Events Table
  const tableData = events
    .slice(0, 50)
    .map((e) => [
      e.country,
      e.disease,
      e.grade,
      e.eventType,
      e.status,
      (e.cases || 0).toLocaleString(),
      (e.deaths || 0).toLocaleString(),
      new Date(e.reportDate).toLocaleDateString(),
    ])

  autoTable(doc, {
    startY: 135,
    head: [["Country", "Disease", "Grade", "Type", "Status", "Cases", "Deaths", "Date"]],
    body: tableData,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 86, 179], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      2: { fontStyle: "bold" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
  })

  // Recommendations
  const finalY = (doc as any).lastAutoTable.finalY || 200
  if (finalY < 250) {
    doc.setFontSize(12)
    doc.setTextColor(44, 62, 80)
    doc.text("Recommendations", 14, finalY + 15)

    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const recommendations = [
      "1. Prioritize response to Grade 3 critical outbreaks with immediate resource allocation",
      "2. Enhance cross-border surveillance for diseases showing multi-country spread",
      "3. Strengthen laboratory capacity in affected regions for rapid diagnosis",
      "4. Coordinate with regional health authorities for unified response strategies",
    ]
    recommendations.forEach((rec, idx) => {
      doc.text(rec, 20, finalY + 23 + idx * 6, { maxWidth: 170 })
    })
  }

  doc.save(`WHO-AFRO-Report-${new Date().toISOString().split("T")[0]}.pdf`)
}

export function exportToExcel(events: any[], filters?: any) {
  const wb = XLSX.utils.book_new()

  // Main events sheet
  const eventsData = events.map((e) => ({
    Country: e.country,
    Disease: e.disease,
    Grade: e.grade,
    "Event Type": e.eventType,
    Status: e.status,
    Cases: e.cases || 0,
    Deaths: e.deaths || 0,
    "Case Fatality Rate (%)": e.cases > 0 ? ((e.deaths / e.cases) * 100).toFixed(2) : "0",
    Description: e.description,
    "Report Date": e.reportDate,
    Year: e.year,
    Latitude: e.lat,
    Longitude: e.lon,
  }))

  const eventsWs = XLSX.utils.json_to_sheet(eventsData)
  eventsWs["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 50 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, eventsWs, "Events")

  // Summary Statistics sheet
  const grade3Count = events.filter((e) => e.grade === "Grade 3").length
  const grade2Count = events.filter((e) => e.grade === "Grade 2").length
  const grade1Count = events.filter((e) => e.grade === "Grade 1").length
  const totalCases = events.reduce((sum, e) => sum + (e.cases || 0), 0)
  const totalDeaths = events.reduce((sum, e) => sum + (e.deaths || 0), 0)
  const countriesAffected = new Set(events.map((e) => e.country)).size
  const diseasesTracked = new Set(events.map((e) => e.disease)).size

  const summaryData = [
    ["WHO AFRO Signal Intelligence Summary"],
    [""],
    ["Metric", "Value"],
    ["Total Events", events.length],
    ["Grade 3 (Critical)", grade3Count],
    ["Grade 2 (High)", grade2Count],
    ["Grade 1 (Medium)", grade1Count],
    ["Total Cases", totalCases],
    ["Total Deaths", totalDeaths],
    ["Overall Case Fatality Rate (%)", totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : "0"],
    ["Countries Affected", countriesAffected],
    ["Diseases Tracked", diseasesTracked],
    [""],
    ["Applied Filters"],
    filters?.selectedGrades?.length > 0 ? ["Grades", filters.selectedGrades.join(", ")] : ["Grades", "All"],
    filters?.selectedCountries?.length > 0 ? ["Countries", filters.selectedCountries.join(", ")] : ["Countries", "All"],
    filters?.selectedDiseases?.length > 0 ? ["Diseases", filters.selectedDiseases.join(", ")] : ["Diseases", "All"],
    ["Year", filters?.selectedYear || "All"],
  ]

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  summaryWs["!cols"] = [{ wch: 30 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

  // Disease Analysis sheet
  const diseaseMap = new Map<string, { cases: number; deaths: number; events: number }>()
  events.forEach((event) => {
    const existing = diseaseMap.get(event.disease) || { cases: 0, deaths: 0, events: 0 }
    diseaseMap.set(event.disease, {
      cases: existing.cases + (event.cases || 0),
      deaths: existing.deaths + (event.deaths || 0),
      events: existing.events + 1,
    })
  })

  const diseaseAnalysis = Array.from(diseaseMap.entries())
    .map(([disease, data]) => ({
      Disease: disease,
      "Total Events": data.events,
      "Total Cases": data.cases,
      "Total Deaths": data.deaths,
      "CFR (%)": data.cases > 0 ? ((data.deaths / data.cases) * 100).toFixed(2) : "0",
    }))
    .sort((a, b) => b["Total Cases"] - a["Total Cases"])

  const diseaseWs = XLSX.utils.json_to_sheet(diseaseAnalysis)
  diseaseWs["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, diseaseWs, "Disease Analysis")

  // Country Analysis sheet
  const countryMap = new Map<string, { cases: number; deaths: number; events: number }>()
  events.forEach((event) => {
    const existing = countryMap.get(event.country) || { cases: 0, deaths: 0, events: 0 }
    countryMap.set(event.country, {
      cases: existing.cases + (event.cases || 0),
      deaths: existing.deaths + (event.deaths || 0),
      events: existing.events + 1,
    })
  })

  const countryAnalysis = Array.from(countryMap.entries())
    .map(([country, data]) => ({
      Country: country,
      "Total Events": data.events,
      "Total Cases": data.cases,
      "Total Deaths": data.deaths,
    }))
    .sort((a, b) => b["Total Events"] - a["Total Events"])

  const countryWs = XLSX.utils.json_to_sheet(countryAnalysis)
  countryWs["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, countryWs, "Country Analysis")

  XLSX.writeFile(wb, `WHO-AFRO-Data-${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportToCSV(events: any[]) {
  const csvData = events.map((e) => ({
    Country: e.country,
    Disease: e.disease,
    Grade: e.grade,
    EventType: e.eventType,
    Status: e.status,
    Cases: e.cases || 0,
    Deaths: e.deaths || 0,
    ReportDate: e.reportDate,
    Latitude: e.lat,
    Longitude: e.lon,
    Description: e.description.replace(/,/g, ";"),
  }))

  const ws = XLSX.utils.json_to_sheet(csvData)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `WHO-AFRO-Export-${new Date().toISOString().split("T")[0]}.csv`
  link.click()
}
