import { Request, Response } from 'express';
import prisma from '../config/database';
import { OrderStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total orders count
    const totalOrders = await prisma.purchaseOrder.count();

    // Orders by status
    const pendingOrders = await prisma.purchaseOrder.count({ where: { status: OrderStatus.PENDING } });
    const approvedOrders = await prisma.purchaseOrder.count({ where: { status: OrderStatus.APPROVED } });
    const estimatedOrders = await prisma.purchaseOrder.count({ where: { status: OrderStatus.ESTIMATED } });
    const completedOrders = await prisma.purchaseOrder.count({ where: { status: OrderStatus.COMPLETED } });
    const cancelledOrders = await prisma.purchaseOrder.count({ where: { status: OrderStatus.CANCELLED } });

    // Inventory count
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const lowStockProducts = await prisma.inventory.count({
      where: {
        availableQuantity: { lte: prisma.inventory.fields.lowStockThreshold }
      }
    });

    // Monthly sales and revenue
    const monthlyOrders = await prisma.purchaseOrder.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: [OrderStatus.COMPLETED, OrderStatus.APPROVED, OrderStatus.CONFIRMED] }
      },
      include: { invoices: true }
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
      return sum + Number(order.totalAmount);
    }, 0);

    const lastMonthOrders = await prisma.purchaseOrder.findMany({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        },
        status: { in: [OrderStatus.COMPLETED, OrderStatus.APPROVED, OrderStatus.CONFIRMED] }
      }
    });

    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => {
      return sum + Number(order.totalAmount);
    }, 0);

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Recent activities
    const recentActivities = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    // Latest orders
    const latestOrders = await prisma.purchaseOrder.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true
      }
    });

    res.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders,
        estimated: estimatedOrders,
        completed: completedOrders,
        cancelled: cancelledOrders
      },
      inventory: {
        totalProducts,
        lowStockProducts
      },
      revenue: {
        monthly: monthlyRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowth
      },
      recentActivities,
      latestOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMonthlySalesData = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const monthlyData = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0);

      const orders = await prisma.purchaseOrder.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: { in: [OrderStatus.COMPLETED, OrderStatus.APPROVED, OrderStatus.CONFIRMED] }
        }
      });

      const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const orderCount = orders.length;

      monthlyData.push({
        month: month,
        monthName: new Date(currentYear, month - 1).toLocaleString('default', { month: 'short' }),
        revenue,
        orderCount
      });
    }

    res.json(monthlyData);
  } catch (error) {
    console.error('Get monthly sales data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        inventory: true,
        _count: {
          select: {
            purchaseOrderItems: true
          }
        }
      },
      orderBy: {
        purchaseOrderItems: {
          _count: 'desc'
        }
      },
      take: parseInt(limit as string)
    });

    res.json(products);
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { purchaseOrders: true }
        },
        purchaseOrders: {
          where: {
            status: { in: [OrderStatus.COMPLETED, OrderStatus.APPROVED, OrderStatus.CONFIRMED] }
          }
        }
      },
      orderBy: {
        purchaseOrders: {
          _count: 'desc'
        }
      },
      take: parseInt(limit as string)
    });

    const customersWithTotalSpent = customers.map(customer => ({
      ...customer,
      totalSpent: customer.purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    }));

    res.json(customersWithTotalSpent);
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
