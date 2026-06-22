import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';
import { generatePONumber } from '../utils/helpers';
import { OrderStatus } from '@prisma/client';

export const getAllPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { status, customerId, search } = req.query;

    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (customerId) where.customerId = customerId as string;
    if (search) {
      where.OR = [
        { poNumber: { contains: search as string, mode: 'insensitive' } },
        { customer: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        customer: true,
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
        },
        invoices: true,
        deliveryOrders: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(purchaseOrders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
                store: true,
                inventory: true
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
        },
        updater: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        invoices: true,
        deliveryOrders: {
          include: {
            store: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, items, notes, deliveryAddress } = req.body;

    const poNumber = await generatePONumber();

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes
      };
    });

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        customerId,
        status: OrderStatus.PENDING,
        subtotal,
        tax: 0,
        discount: 0,
        totalAmount: subtotal,
        notes,
        deliveryAddress,
        createdBy: req.user?.userId,
        items: {
          create: orderItems
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'CREATE', 'PurchaseOrder', purchaseOrder.id, `Created PO: ${poNumber}`, getClientIp(req), getUserAgent(req));

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approvePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { estimatedAmount } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.PENDING) {
      return res.status(400).json({ error: 'Order can only be approved from pending status' });
    }

    // Reserve inventory for each item
    for (const item of purchaseOrder.items) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId }
      });

      if (!inventory || inventory.availableQuantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product ${item.productId}`,
          productId: item.productId,
          required: item.quantity,
          available: inventory?.availableQuantity || 0
        });
      }

      await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          availableQuantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity }
        }
      });

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          productId: item.productId,
          quantity: item.quantity,
          type: 'RESERVED',
          reference: purchaseOrder.poNumber,
          notes: 'Reserved for approved order',
          createdBy: req.user?.userId
        }
      });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: OrderStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: req.user?.userId,
        estimatedAmount: estimatedAmount || purchaseOrder.totalAmount,
        updatedBy: req.user?.userId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'APPROVE', 'PurchaseOrder', purchaseOrder.id, `Approved PO: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

    res.json(updatedOrder);
  } catch (error) {
    console.error('Approve purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const estimatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { estimatedAmount } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.PENDING) {
      return res.status(400).json({ error: 'Order can only be estimated from pending status' });
    }

    // Reserve inventory for each item
    for (const item of purchaseOrder.items) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId }
      });

      if (!inventory || inventory.availableQuantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product ${item.productId}`,
          productId: item.productId,
          required: item.quantity,
          available: inventory?.availableQuantity || 0
        });
      }

      await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          availableQuantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity }
        }
      });

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          productId: item.productId,
          quantity: item.quantity,
          type: 'RESERVED',
          reference: purchaseOrder.poNumber,
          notes: 'Reserved for estimated order',
          createdBy: req.user?.userId
        }
      });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: OrderStatus.ESTIMATED,
        estimatedAt: new Date(),
        estimatedBy: req.user?.userId,
        estimatedAmount,
        updatedBy: req.user?.userId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'ESTIMATE', 'PurchaseOrder', purchaseOrder.id, `Estimated PO: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

    res.json(updatedOrder);
  } catch (error) {
    console.error('Estimate purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.ESTIMATED) {
      return res.status(400).json({ error: 'Order can only be confirmed from estimated status' });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
        updatedBy: req.user?.userId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'CONFIRM', 'PurchaseOrder', purchaseOrder.id, `Confirmed PO: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

    res.json(updatedOrder);
  } catch (error) {
    console.error('Confirm purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsPacked = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.APPROVED && purchaseOrder.status !== OrderStatus.ESTIMATED) {
      return res.status(400).json({ error: 'Order can only be marked as packed from approved or estimated status' });
    }

    // Move reserved stock to actual stock out (since parcel is packed and sent to office)
    for (const item of purchaseOrder.items) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId }
      });

      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            reservedQuantity: { decrement: item.quantity },
            totalQuantity: { decrement: item.quantity }
          }
        });

        await prisma.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            productId: item.productId,
            quantity: item.quantity,
            type: 'STOCK_OUT',
            reference: purchaseOrder.poNumber,
            notes: 'Packed and sent to office',
            createdBy: req.user?.userId
          }
        });
      }
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: OrderStatus.PACKED,
        packedAt: new Date(),
        packedBy: req.user?.userId,
        updatedBy: req.user?.userId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'PACK', 'PurchaseOrder', purchaseOrder.id, `Marked PO as packed: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

    res.json(updatedOrder);
  } catch (error) {
    console.error('Mark as packed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const recordCustomerResponse = async (req: Request, res: Response) => {
  try {
    const { response } = req.body; // 'ACCEPTED' or 'REJECTED'

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.ESTIMATED) {
      return res.status(400).json({ error: 'Customer response can only be recorded for estimated orders' });
    }

    if (response === 'REJECTED') {
      // Release reserved inventory
      for (const item of purchaseOrder.items) {
        const inventory = await prisma.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (inventory) {
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              availableQuantity: { increment: item.quantity },
              reservedQuantity: { decrement: item.quantity }
            }
          });

          await prisma.inventoryTransaction.create({
            data: {
              inventoryId: inventory.id,
              productId: item.productId,
              quantity: item.quantity,
              type: 'RELEASED',
              reference: purchaseOrder.poNumber,
              notes: 'Released due to customer rejection',
              createdBy: req.user?.userId
            }
          });
        }
      }

      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id: req.params.id },
        data: {
          status: OrderStatus.CANCELLED,
          customerResponse: 'REJECTED',
          cancelledAt: new Date(),
          cancelledBy: req.user?.userId,
          updatedBy: req.user?.userId
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await logActivity(req.user?.userId || null, 'CUSTOMER_RESPONSE', 'PurchaseOrder', purchaseOrder.id, `Customer rejected estimation: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

      res.json(updatedOrder);
    } else if (response === 'ACCEPTED') {
      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id: req.params.id },
        data: {
          customerResponse: 'ACCEPTED',
          updatedBy: req.user?.userId
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await logActivity(req.user?.userId || null, 'CUSTOMER_RESPONSE', 'PurchaseOrder', purchaseOrder.id, `Customer accepted estimation: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

      res.json(updatedOrder);
    } else {
      return res.status(400).json({ error: 'Invalid response. Must be ACCEPTED or REJECTED' });
    }
  } catch (error) {
    console.error('Record customer response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateEstimationPDF = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
                store: true
              }
            }
          }
        }
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== OrderStatus.ESTIMATED) {
      return res.status(400).json({ error: 'Estimation PDF can only be generated for estimated orders' });
    }

    // Generate PDF content (simplified - you may want to use a PDF library like pdfkit or puppeteer)
    const estimationContent = `
ESTIMATION
==========
PO Number: ${purchaseOrder.poNumber}
Date: ${new Date().toLocaleDateString()}
Customer: ${purchaseOrder.customer.name}

Items:
${purchaseOrder.items.map(item => 
  `- ${item.product.name} (${item.product.code})
    Quantity: ${item.quantity}
    Unit Price: ₹${Number(item.unitPrice).toFixed(2)}
    Total: ₹${Number(item.totalPrice).toFixed(2)}`
).join('\n')}

Subtotal: ₹${Number(purchaseOrder.subtotal).toFixed(2)}
Estimated Amount: ₹${Number(purchaseOrder.estimatedAmount || purchaseOrder.totalAmount).toFixed(2)}

Notes: ${purchaseOrder.notes || 'N/A'}
    `;

    // Return as text file for now (can be enhanced to PDF)
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="estimation-${purchaseOrder.poNumber}.txt"`);
    res.send(estimationContent);
  } catch (error) {
    console.error('Generate estimation PDF error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (purchaseOrder.status === OrderStatus.COMPLETED || purchaseOrder.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled order' });
    }

    // Release reserved inventory if order was estimated or approved
    if (purchaseOrder.status === OrderStatus.ESTIMATED || purchaseOrder.status === OrderStatus.APPROVED) {
      for (const item of purchaseOrder.items) {
        const inventory = await prisma.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (inventory) {
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              availableQuantity: { increment: item.quantity },
              reservedQuantity: { decrement: item.quantity }
            }
          });

          await prisma.inventoryTransaction.create({
            data: {
              inventoryId: inventory.id,
              productId: item.productId,
              quantity: item.quantity,
              type: 'RELEASED',
              reference: purchaseOrder.poNumber,
              notes: 'Released due to order cancellation',
              createdBy: req.user?.userId
            }
          });
        }
      }
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: req.user?.userId,
        updatedBy: req.user?.userId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'CANCEL', 'PurchaseOrder', purchaseOrder.id, `Cancelled PO: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { notes, deliveryAddress } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        notes,
        deliveryAddress,
        updatedBy: req.user?.userId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await logActivity(req.user?.userId || null, 'UPDATE', 'PurchaseOrder', purchaseOrder.id, `Updated PO: ${purchaseOrder.poNumber}`, getClientIp(req), getUserAgent(req));

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
