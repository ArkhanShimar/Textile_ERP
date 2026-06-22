import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, storeId, search } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;
    if (storeId) where.storeId = storeId as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        store: true,
        inventory: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        store: true,
        inventory: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { code, name, categoryId, storeId, size, color, unitPrice, description } = req.body;

    const product = await prisma.product.create({
      data: {
        code,
        name,
        categoryId,
        storeId,
        size,
        color,
        unitPrice,
        description
      },
      include: {
        category: true,
        store: true
      }
    });

    // Create inventory record
    await prisma.inventory.create({
      data: {
        productId: product.id,
        storeId,
        availableQuantity: 0,
        reservedQuantity: 0,
        totalQuantity: 0
      }
    });

    await logActivity(req.user?.userId || null, 'CREATE', 'Product', product.id, `Created product: ${code}`, getClientIp(req), getUserAgent(req));

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, storeId, size, color, unitPrice, description, isActive } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        categoryId,
        storeId,
        size,
        color,
        unitPrice,
        description,
        isActive
      },
      include: {
        category: true,
        store: true
      }
    });

    await logActivity(req.user?.userId || null, 'UPDATE', 'Product', product.id, `Updated product: ${product.code}`, getClientIp(req), getUserAgent(req));

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    await logActivity(req.user?.userId || null, 'DELETE', 'Product', req.params.id, `Deactivated product: ${req.params.id}`, getClientIp(req), getUserAgent(req));

    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
