"use client";

import { jsPDF } from "jspdf";
import { useState } from "react";

export default function DownloadPdfButton({
  qrDataUrl,
}: {
  qrDataUrl: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const img = new Image();
      img.src = qrDataUrl;
      await img.decode();

      // Полотно з пропорцією A4 (210×297), ~150 dpi.
      const W = 1240;
      const H = 1754;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";

      // Заголовок
      ctx.fillStyle = "#111827";
      ctx.font = "bold 96px Arial, sans-serif";
      ctx.fillText("Lista zadań", W / 2, 300);

      // QR по центру
      const qrSize = 780;
      ctx.drawImage(img, (W - qrSize) / 2, 420, qrSize, qrSize);

      // Підпис знизу
      ctx.fillStyle = "#9ca3af";
      ctx.font = "34px Arial, sans-serif";
      ctx.fillText("zdrovy.com", W / 2, H - 90);

      const pageDataUrl = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ format: "a4", unit: "mm" });
      pdf.addImage(pageDataUrl, "PNG", 0, 0, 210, 297);
      pdf.save("lista-zadan-qr.pdf");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
    >
      {loading ? "..." : "Pobierz PDF"}
    </button>
  );
}
