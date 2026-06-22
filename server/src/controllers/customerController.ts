import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity, getClientIp, getUserAgent } from '../utils/logger';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { purchaseOrders: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrders: {
          include: {
            items: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, city, state, pincode, gstin } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        gstin
      }
    });

    await logActivity(req.user?.userId || null, 'CREATE', 'Customer', customer.id, `Created customer: ${name}`, getClientIp(req), getUserAgent(req));

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, city, state, pincode, gstin, isActive } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        gstin,
        isActive
      }
    });

    await logActivity(req.user?.userId || null, 'UPDATE', 'Customer', customer.id, `Updated customer: ${name}`, getClientIp(req), getUserAgent(req));

    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    await logActivity(req.user?.userId || null, 'DELETE', 'Customer', req.params.id, `Deactivated customer: ${req.params.id}`, getClientIp(req), getUserAgent(req));

    res.json({ message: 'Customer deactivated successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
