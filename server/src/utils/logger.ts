import prisma from '../config/database';

export const logActivity = async (
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null = null,
  details: string | null = null,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const getClientIp = (req: any): string => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
};

export const getUserAgent = (req: any): string => {
  return req.get('user-agent') || 'unknown';
};
