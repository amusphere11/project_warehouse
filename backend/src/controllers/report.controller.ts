import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import prisma from '../config/database';
import { formatNumber } from '../utils/helpers';

export const getDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const date = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        transactionDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        material: true,
        product: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    const summary = {
      date: date.toISOString().split('T')[0],
      totalInbound: transactions.filter((t) => t.type === 'INBOUND').length,
      totalOutbound: transactions.filter((t) => t.type === 'OUTBOUND').length,
      totalTransactions: transactions.length,
      transactions,
    };

    res.json({
      status: 'success',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const exportToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, type } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate as string);
      if (endDate) where.transactionDate.lte = new Date(endDate as string);
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        material: true,
        product: true,
        user: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Transactions');

    // Add headers
    worksheet.columns = [
      { header: 'Transaction No', key: 'transactionNo', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Item Type', key: 'itemType', width: 12 },
      { header: 'Barcode', key: 'barcode', width: 15 },
      { header: 'Item Name', key: 'itemName', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Initial Weight', key: 'initialWeight', width: 15 },
      { header: 'Current Weight', key: 'currentWeight', width: 15 },
      { header: 'Shrinkage', key: 'shrinkage', width: 12 },
      { header: 'Reference No', key: 'referenceNo', width: 20 },
      { header: 'User', key: 'user', width: 20 },
    ];

    // Add data
    transactions.forEach((transaction) => {
      worksheet.addRow({
        transactionNo: transaction.transactionNo,
        date: transaction.transactionDate.toISOString().split('T')[0],
        type: transaction.type,
        itemType: transaction.itemType,
        barcode: transaction.barcode,
        itemName: transaction.material?.name || transaction.product?.name || '-',
        quantity: transaction.quantity,
        unit: transaction.unit,
        initialWeight: transaction.initialWeight || '-',
        currentWeight: transaction.currentWeight || '-',
        shrinkage: transaction.shrinkage || 0,
        referenceNo: transaction.referenceNo || '-',
        user: transaction.user?.name || '-',
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventory_report_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const exportToPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate as string);
      if (endDate) where.transactionDate.lte = new Date(endDate as string);
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        material: true,
        product: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
      take: 100, // Limit for PDF
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventory_report_${Date.now()}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Inventory Report', { align: 'center' });
    doc.moveDown();

    // Date range
    doc.fontSize(12).text(
      `Period: ${startDate || 'All'} - ${endDate || 'All'}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Summary
    const inbound = transactions.filter((t) => t.type === 'INBOUND').length;
    const outbound = transactions.filter((t) => t.type === 'OUTBOUND').length;

    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(11).text(`Total Transactions: ${transactions.length}`);
    doc.text(`Total Inbound: ${inbound}`);
    doc.text(`Total Outbound: ${outbound}`);
    doc.moveDown(2);

    // Transactions table
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown();

    transactions.forEach((transaction, index) => {
      if (index > 0 && index % 10 === 0) {
        doc.addPage();
      }

      doc.fontSize(10);
      doc.text(`${transaction.transactionNo} | ${transaction.type}`, {
        continued: true,
      });
      doc.text(` | ${transaction.barcode}`);
      doc.fontSize(9);
      doc.text(
        `  ${transaction.material?.name || transaction.product?.name || '-'}`
      );
      doc.text(`  Qty: ${transaction.quantity} ${transaction.unit}`);
      if (transaction.shrinkage) {
        doc.text(`  Shrinkage: ${formatNumber(transaction.shrinkage)} kg`);
      }
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
