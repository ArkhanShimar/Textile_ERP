import { Request, Response } from 'express';
import prisma from '../config/database';
import { OrderStatus, InvoiceStatus, DeliveryStatus } from '@prisma/client';

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    if (customerId) where.customerId = customerId as string;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        invoices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;

    res.json({
      orders,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const { storeId, lowStock } = req.query;

    const where: any = {};
    if (storeId) where.storeId = storeId as string;
    if (lowStock === 'true') {
      where.availableQuantity = { lte: prisma.inventory.fields.lowStockThreshold };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            store: true
          }
        },
        store: true
      },
      orderBy: { availableQuantity: 'asc' }
    });

    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.totalQuantity, 0);
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.availableQuantity, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);
    const lowStockCount = inventory.filter(inv => inv.availableQuantity <= inv.lowStockThreshold).length;

    res.json({
      inventory,
      summary: {
        totalProducts,
        totalQuantity,
        totalAvailable,
        totalReserved,
        lowStockCount
      }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderReport = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;

    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      orders,
      statusCounts
    });
  } catch (error) {
    console.error('Get order report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoiceReport = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;

    const where: any = {};
    if (status) where.status = status as InvoiceStatus;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

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
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const pendingAmount = totalAmount - totalPaid;

    res.json({
      invoices,
      summary: {
        totalAmount,
        totalPaid,
        pendingAmount
      }
    });
  } catch (error) {
    console.error('Get invoice report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDeliveryReport = async (req: Request, res: Response) => {
  try {
    const { status, storeId, startDate, endDate } = req.query;

    const where: any = {};
    if (status) where.status = status as DeliveryStatus;
    if (storeId) where.storeId = storeId as string;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const deliveryOrders = await prisma.deliveryOrder.findMany({
      where,
      include: {
        purchaseOrder: {
          include: {
            customer: true
          }
        },
        store: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const statusCounts = deliveryOrders.reduce((acc, do_) => {
      acc[do_.status] = (acc[do_.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      deliveryOrders,
      statusCounts
    });
  } catch (error) {
    console.error('Get delivery report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCancelledOrdersReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { status: OrderStatus.CANCELLED };
    if (startDate && endDate) {
      where.cancelledAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const cancelledOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true
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
      orderBy: { cancelledAt: 'desc' }
    });

    const totalCancelledValue = cancelledOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    res.json({
      cancelledOrders,
      summary: {
        totalCancelled: cancelledOrders.length,
        totalCancelledValue
      }
    });
  } catch (error) {
    console.error('Get cancelled orders report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
