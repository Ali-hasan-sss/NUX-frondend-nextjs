"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PDFGeneratorProps {
  invoice: any;
  restaurant: any;
  appLogo?: string;
  className?: string;
}

export function PDFGenerator({
  invoice,
  restaurant,
  appLogo,
  className = "",
}: PDFGeneratorProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!pdfRef.current) {
      alert("PDF content not ready. Please try again.");
      return;
    }

    setIsGenerating(true);
    try {
      // Make element temporarily visible for capture
      const element = pdfRef.current;
      element.style.visibility = "visible";
      element.style.position = "fixed";
      element.style.left = "0";
      element.style.top = "0";
      element.style.zIndex = "-1000";

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        width: 800,
        height: element.scrollHeight,
      });

      // Hide element again
      element.style.visibility = "hidden";
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.style.zIndex = "auto";

      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error(
          "Canvas has no content - check if elements are properly rendered"
        );
      }

      // Create PDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Scale to fit width with margins
      const margin = 10;
      const availableWidth = pdfWidth - margin * 2;
      const availableHeight = pdfHeight - margin * 2;

      const imgAspectRatio = canvas.height / canvas.width;
      let finalWidth = availableWidth;
      let finalHeight = finalWidth * imgAspectRatio;

      // If height exceeds available space, scale down
      if (finalHeight > availableHeight) {
        finalHeight = availableHeight;
        finalWidth = finalHeight / imgAspectRatio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = margin;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      // Generate filename
      const filename = `invoice-${
        invoice.stripeInvoiceId || invoice.id.slice(0, 8)
      }-${new Date().toISOString().split("T")[0]}.pdf`;

      // Download PDF
      pdf.save(filename);

      console.log("PDF generated successfully:", filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Error generating PDF: ${errorMessage}. Please try again or contact support.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={className}>
      {/* PDF content for generation - positioned off-screen but visible */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "0",
          width: "800px",
          visibility: "hidden",
        }}
      >
        <InvoicePDF
          ref={pdfRef}
          invoice={invoice}
          restaurant={restaurant}
          appLogo={appLogo}
        />
      </div>

      {/* Download Button */}
      <Button onClick={generatePDF} disabled={isGenerating} className="w-full">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice as PDF
          </>
        )}
      </Button>
    </div>
  );
}
