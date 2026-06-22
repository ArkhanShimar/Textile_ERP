import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';
import { TransactionType } from '@prisma/client';

export const getAllInventory = async (req: Request, res: Response) => {
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
      orderBy: { productId: 'asc' }
    });

    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          include: {
            category: true,
            store: true
          }
        },
        store: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adjustInventory = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, type, notes } = req.body;

    const inventory = await prisma.inventory.findUnique({
      where: { productId }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    let newAvailable = inventory.availableQuantity;
    let newReserved = inventory.reservedQuantity;
    let newTotal = inventory.totalQuantity;

    switch (type) {
      case 'STOCK_IN':
        newAvailable += quantity;
        newTotal += quantity;
        break;
      case 'STOCK_OUT':
        if (newAvailable < quantity) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        newAvailable -= quantity;
        newTotal -= quantity;
        break;
      case 'RESERVED':
        if (newAvailable < quantity) {
          return res.status(400).json({ error: 'Insufficient available stock' });
        }
        newAvailable -= quantity;
        newReserved += quantity;
        break;
      case 'RELEASED':
        if (newReserved < quantity) {
          return res.status(400).json({ error: 'Insufficient reserved stock' });
        }
        newReserved -= quantity;
        newAvailable += quantity;
        break;
      default:
        return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        availableQuantity: newAvailable,
        reservedQuantity: newReserved,
        totalQuantity: newTotal
      },
      include: {
        product: true,
        store: true
      }
    });

    // Create transaction record
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        productId,
        quantity,
        type: type as TransactionType,
        notes,
        createdBy: req.user?.userId
      }
    });

    await logActivity(req.user?.userId || null, 'INVENTORY_ADJUST', 'Inventory', inventory.id, `Adjusted inventory: ${type} ${quantity}`, getClientIp(req), getUserAgent(req));

    res.json(updatedInventory);
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryTransactions = async (req: Request, res: Response) => {
  try {
    const { productId, inventoryId, type } = req.query;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (inventoryId) where.inventoryId = inventoryId as string;
    if (type) where.type = type as TransactionType;

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        },
        inventory: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
