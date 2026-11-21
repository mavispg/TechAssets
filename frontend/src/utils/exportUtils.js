import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta un conjunto de datos tabulares a un archivo CSV estándar con codificación UTF-8.
 */
export function exportarCSV(nombreArchivo, encabezados, filas) {
  try {
    const filasFormateadas = filas.map((fila) =>
      fila
        .map((celda) => {
          const valor = celda === null || celda === undefined ? '' : String(celda);
          return `"${valor.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const encabezadosFormateados = encabezados.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
    const contenidoCSV = '\uFEFF' + [encabezadosFormateados, ...filasFormateadas].join('\r\n');

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nombreArchivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    alert('Ocurrió un error al generar el archivo CSV.');
  }
}

/**
 * Exporta un reporte formal en formato PDF con encabezado corporativo Innovatech,
 * tabla estilizada con colores de marca y fecha de generación.
 */
export function exportarPDF(tituloReporte, encabezados, filas, subtituloFiltros = '') {
  try {
    const doc = new jsPDF({
      orientation: encabezados.length > 5 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const ahora = new Date();
    const fechaHora = ahora.toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Encabezado Corporativo Innovatech
    doc.setFillColor(11, 19, 43); // #0B132B
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, 'F');

    // Título en la barra
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INNOVATECH SOLUTIONS S.A.C. - TECHASSET', 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(163, 230, 53); // #A3E635 (Lime)
    doc.text('Sistema de Gestión de Activos Tecnológicos y Préstamos', 14, 16);

    // Título del Reporte
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(tituloReporte, 14, 32);

    // Metadatos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha y hora de emisión: ${fechaHora}`, 14, 38);
    if (subtituloFiltros) {
      doc.text(`Criterios aplicados: ${subtituloFiltros}`, 14, 43);
    }

    // Tabla con autoTable
    autoTable(doc, {
      startY: subtituloFiltros ? 47 : 42,
      head: [encabezados],
      body: filas,
      theme: 'grid',
      headStyles: {
        fillColor: [11, 19, 43], // #0B132B
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
      },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Pie de página
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPaginas} • Documento confidencial de uso interno Innovatech Solutions S.A.C.`,
        14,
        doc.internal.pageSize.getHeight() - 8
      );
    }

    const slug = tituloReporte.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    doc.save(`${slug}_${ahora.toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    alert('Ocurrió un error al generar el archivo PDF.');
  }
}
