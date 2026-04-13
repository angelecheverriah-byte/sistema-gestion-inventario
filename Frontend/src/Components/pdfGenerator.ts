import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SaleDetail {
  producto: string;
  precio_unitario: number | string;
  cantidad: number;
  total_usd: number | string;
  total_bs: number | string;
  hora: string;
}

export const exportDailySalesPDF = (
  detalleDia: SaleDetail[],
  fecha: string,
) => {
  if (!detalleDia || detalleDia.length === 0) return;

  const doc = new jsPDF();

  // Encabezado profesional
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("REPORTE DIARIO DE VENTAS", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha del reporte: ${fecha}`, 14, 28);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 33);

  // Línea divisoria
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 38, 196, 38);

  const tableRows = detalleDia.map((item) => [
    item.producto.toUpperCase(),
    `${item.cantidad}`,
    `$${Number(item.precio_unitario).toFixed(2)}`,
    `$${Number(item.total_usd).toFixed(2)}`,
    `${Number(item.total_bs).toLocaleString("es-VE")} BS`,
    item.hora,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Producto", "Cant.", "Precio U.", "Total USD", "Total BS", "Hora"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 64, 175], // Azul Cobalto
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold" },
      4: { halign: "right" },
      5: { halign: "center" },
    },
  });

  // Cuadro de Totales
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalUsd = detalleDia.reduce(
    (acc, c) => acc + (Number(c.total_usd) || 0),
    0,
  );
  const totalBs = detalleDia.reduce(
    (acc, c) => acc + (Number(c.total_bs) || 0),
    0,
  );

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(130, finalY, 66, 25, "F");

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Ventas BS:`, 135, finalY + 8);
  doc.text(`${totalBs.toLocaleString("es-VE")} BS`, 190, finalY + 8, {
    align: "right",
  });

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL USD:`, 135, finalY + 18);
  doc.text(`$${totalUsd.toFixed(2)}`, 190, finalY + 18, { align: "right" });

  doc.save(`Ventas_${fecha.replace(/\//g, "-")}.pdf`);
};
