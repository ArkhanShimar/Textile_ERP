import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';

export const getAllStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          include: {
            category: true,
            inventory: true
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, code, address, phone } = req.body;

    const store = await prisma.store.create({
      data: { name, code, address, phone }
    });

    await logActivity(req.user?.userId || null, 'CREATE', 'Store', store.id, `Created store: ${name}`, getClientIp(req), getUserAgent(req));

    res.status(201).json(store);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { name, code, address, phone, isActive } = req.body;

    const store = await prisma.store.update({
      where: { id: req.params.id },
      data: { name, code, address, phone, isActive }
    });

    await logActivity(req.user?.userId || null, 'UPDATE', 'Store', store.id, `Updated store: ${name}`, getClientIp(req), getUserAgent(req));

    res.json(store);
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    await prisma.store.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    await logActivity(req.user?.userId || null, 'DELETE', 'Store', req.params.id, `Deactivated store: ${req.params.id}`, getClientIp(req), getUserAgent(req));

    res.json({ message: 'Store deactivated successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
