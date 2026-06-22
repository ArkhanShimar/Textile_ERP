import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';
import { generateInvoiceNumber } from '../utils/helpers';
import { InvoiceStatus, OrderStatus } from '@prisma/client';

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const { status, purchaseOrderId } = req.query;

    const where: any = {};
    if (status) where.status = status as InvoiceStatus;
    if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId as string;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        purchaseOrder: {
          include: {
            customer: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrder: {
          include: {
            customer: true,
            items: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
                store: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { purchaseOrderId, tax, discount, dueDate, notes } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: true }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.APPROVED && purchaseOrder.status !== OrderStatus.CONFIRMED) {
      return res.status(400).json({ error: 'Purchase order must be approved or confirmed' });
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { purchaseOrderId }
    });

    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice already exists for this purchase order' });
    }

    const invoiceNumber = await generateInvoiceNumber();

    let subtotal = purchaseOrder.subtotal;
    let totalAmount = subtotal + (tax || 0) - (discount || 0);

    let invoiceItems = purchaseOrder.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes
    }));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        purchaseOrderId,
        status: InvoiceStatus.DRAFT,
        subtotal,
        tax: tax || 0,
        discount: discount || 0,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        createdBy: req.user?.userId,
        items: {
          create: invoiceItems
        }
      },
      include: {
        purchaseOrder: {
          include: {
            customer: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'CREATE', 'Invoice', invoice.id, `Created invoice: ${invoiceNumber}`, getClientIp(req), getUserAgent(req));

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { status, tax, discount, dueDate, paidAmount, notes } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    let subtotal = invoice.subtotal;
    let totalAmount = subtotal + (tax || invoice.tax) - (discount || invoice.discount);

    const updatedInvoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status: status || invoice.status,
        tax: tax !== undefined ? tax : invoice.tax,
        discount: discount !== undefined ? discount : invoice.discount,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
        paidAmount: paidAmount !== undefined ? paidAmount : invoice.paidAmount,
        paidDate: (paidAmount && paidAmount >= totalAmount) ? new Date() : invoice.paidDate,
        notes
      },
      include: {
        purchaseOrder: {
          include: {
            customer: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'UPDATE', 'Invoice', invoice.id, `Updated invoice: ${invoice.invoiceNumber}`, getClientIp(req), getUserAgent(req));

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({
      where: { id: req.params.id }
    });

    await logActivity(req.user?.userId || null, 'DELETE', 'Invoice', req.params.id, `Deleted invoice: ${req.params.id}`, getClientIp(req), getUserAgent(req));

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
