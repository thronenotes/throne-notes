"use client";

import { jsPDF } from "jspdf";

export function exportToPDF(title: string, content: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  // Header — Throne Black + Gold
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("THRONE NOTES", 105, 18, { align: "center" });
  doc.setTextColor(138, 138, 154);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Kingdom Operating System", 105, 25, { align: "center" });
  
  // Title
  doc.setTextColor(245, 240, 230);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 50);
  
  // Gold line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);
  
  // Content
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const cleanContent = content
    .replace(/<p>/g, "").replace(/<\/p>/g, "\n\n")
    .replace(/<strong>/g, "").replace(/<\/strong>/g, "")
    .replace(/<em>/g, "").replace(/<\/em>/g, "")
    .replace(/<blockquote>/g, '"').replace(/<\/blockquote>/g, '"\n\n')
    .replace(/<br\/>/g, "\n").replace(/<[^>]*>/g, "");
  
  const lines = doc.splitTextToSize(cleanContent, 170);
  doc.text(lines, 20, 65);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
    doc.text("Throne Notes — Kingdom Operating System", 105, 290, { align: "center" });
  }
  
  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export function exportToMarkdown(title: string, content: string) {
  const cleanContent = content
    .replace(/<p>/g, "").replace(/<\/p>/g, "\n\n")
    .replace(/<strong>/g, "**").replace(/<\/strong>/g, "**")
    .replace(/<em>/g, "*").replace(/<\/em>/g, "*")
    .replace(/<blockquote>/g, "> ").replace(/<\/blockquote>/g, "\n\n")
    .replace(/<br\/>/g, "\n").replace(/<[^>]*>/g, "");
  
  const markdown = `# ${title}\n\n---\n\n${cleanContent}\n\n---\n\n*Exported from Throne Notes — Kingdom Operating System*\n`;
  
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}