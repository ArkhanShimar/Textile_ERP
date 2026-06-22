import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';
import { generateDONumber } from '../utils/helpers';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

export const getAllDeliveryOrders = async (req: Request, res: Response) => {
  try {
    const { status, storeId, purchaseOrderId } = req.query;

    const where: any = {};
    if (status) where.status = status as DeliveryStatus;
    if (storeId) where.storeId = storeId as string;
    if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId as string;

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

    res.json(deliveryOrders);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDeliveryOrderById = async (req: Request, res: Response) => {
  try {
    const deliveryOrder = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrder: {
          include: {
            customer: true,
            items: true
          }
        },
        store: true,
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

    if (!deliveryOrder) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }

    res.json(deliveryOrder);
  } catch (error) {
    console.error('Get delivery order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDeliveryOrder = async (req: Request, res: Response) => {
  try {
    const { purchaseOrderId, storeId, notes } = req.body;

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

    const doNumber = await generateDONumber();

    let subtotal = 0;
    const deliveryItems = purchaseOrder.items.map(item => {
      const totalPrice = Number(item.quantity) * Number(item.unitPrice);
      subtotal += totalPrice;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes
      };
    });

    const deliveryOrder = await prisma.deliveryOrder.create({
      data: {
        doNumber,
        purchaseOrderId,
        storeId,
        status: DeliveryStatus.PENDING,
        notes,
        createdBy: req.user?.userId,
        items: {
          create: deliveryItems
        }
      },
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
      }
    });

    await logActivity(req.user?.userId || null, 'CREATE', 'DeliveryOrder', deliveryOrder.id, `Created DO: ${doNumber}`, getClientIp(req), getUserAgent(req));

    res.status(201).json(deliveryOrder);
  } catch (error) {
    console.error('Create delivery order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDeliveryOrder = async (req: Request, res: Response) => {
  try {
    const { status, dispatchDate, deliveryDate, dispatchedBy, receivedBy, notes } = req.body;

    const deliveryOrder = await prisma.deliveryOrder.update({
      where: { id: req.params.id },
      data: {
        status,
        dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        dispatchedBy,
        receivedBy,
        notes
      },
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
      }
    });

    // Update purchase order status if delivery is completed
    if (status === DeliveryStatus.DELIVERED) {
      await prisma.purchaseOrder.update({
        where: { id: deliveryOrder.purchaseOrderId },
        data: {
          status: OrderStatus.COMPLETED
        }
      });
    }

    await logActivity(req.user?.userId || null, 'UPDATE', 'DeliveryOrder', deliveryOrder.id, `Updated DO: ${deliveryOrder.doNumber}`, getClientIp(req), getUserAgent(req));

    res.json(deliveryOrder);
  } catch (error) {
    console.error('Update delivery order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDeliveryOrder = async (req: Request, res: Response) => {
  try {
    await prisma.deliveryOrder.delete({
      where: { id: req.params.id }
    });

    await logActivity(req.user?.userId || null, 'DELETE', 'DeliveryOrder', req.params.id, `Deleted DO: ${req.params.id}`, getClientIp(req), getUserAgent(req));

    res.json({ message: 'Delivery order deleted successfully' });
  } catch (error) {
    console.error('Delete delivery order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
