import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllActivityLogs = async (req: Request, res: Response) => {
  try {
    const { userId, entity, action, limit = 50 } = req.query;

    const where: any = {};
    if (userId) where.userId = userId as string;
    if (entity) where.entity = entity as string;
    if (action) where.action = action as string;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(logs);
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivityLogById = async (req: Request, res: Response) => {
  try {
    const log = await prisma.activityLog.findUnique({
      where: { id: req.params.id },
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

    if (!log) {
      return res.status(404).json({ error: 'Activity log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
