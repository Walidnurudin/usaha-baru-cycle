// backend/src/services/pdf.service.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderReportItem {
  id: string;
  customerName: string;
  customerWa: string;
  productName: string;
  totalAmount: number | string;
  status: string;
  createdAt: Date;
}

interface GenerateReportOptions {
  startDate?: string;
  endDate?: string;
  orders: OrderReportItem[];
}

export class PdfService {
  public static generateSalesReport(options: GenerateReportOptions): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const { startDate, endDate, orders } = options;

    // Calculate totals
    const totalTransactions = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const totalRevenue = orders
      .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED')
      .reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

    const formatRupiah = (amount: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDateIndo = (date: Date): string => {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    // Header Branding
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TOKO SEPEDA USAHA BARU CYCLE', 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text('Sistem Informasi E-Katalog Digital & Rekapitulasi Penjualan UMKM', 14, 20);
    doc.text('Jl. Raya Sepeda No. 88, Kontak/WA: +62 812-3456-7890', 14, 25);

    // Document Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('LAPORAN DATA PENJUALAN & PEMESANAN', 14, 42);

    // Period & Generation Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    const periodText = `Periode: ${startDate ? startDate : 'Awal'} s/d ${endDate ? endDate : 'Sekarang'}`;
    const generatedAtText = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    doc.text(periodText, 14, 48);
    doc.text(generatedAtText, 14, 53);

    // Summary Metric Boxes
    // Box 1: Total Transaksi
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 58, 55, 20, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL TRANSAKSI', 18, 64);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalTransactions} Pesanan`, 18, 73);

    // Box 2: Transaksi Selesai
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(77, 58, 55, 20, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PESANAN SELESAI', 81, 64);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // green-800
    doc.text(`${completedOrders.length} Pesanan`, 81, 73);

    // Box 3: Total Omset (Confirmed + Completed)
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(140, 58, 56, 20, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL OMSET (CONFIRMED/DONE)', 144, 64);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text(formatRupiah(totalRevenue), 144, 73);

    // Table Data
    const tableBody = orders.map((order, idx) => [
      (idx + 1).toString(),
      formatDateIndo(order.createdAt),
      order.customerName,
      order.customerWa,
      order.productName,
      order.status,
      formatRupiah(Number(order.totalAmount)),
    ]);

    autoTable(doc, {
      startY: 84,
      head: [
        [
          'No',
          'Tanggal',
          'Pelanggan',
          'No. WhatsApp',
          'Item Produk',
          'Status',
          'Total Nilai',
        ],
      ],
      body: tableBody,
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22 },
        2: { cellWidth: 32 },
        3: { cellWidth: 28 },
        4: { cellWidth: 42 },
        5: { cellWidth: 24, halign: 'center' },
        6: { cellWidth: 24, halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Signature Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    const signY = finalY + 15 > 260 ? 250 : finalY + 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Diverifikasi oleh:', 140, signY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Pemilik Toko Usaha Baru Cycle', 140, signY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('(Tanda Tangan & Cap Digital UMKM)', 140, signY + 23);

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }
}
