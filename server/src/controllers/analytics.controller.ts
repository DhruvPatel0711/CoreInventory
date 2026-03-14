import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as analyticsService from '../services/analytics.service';

// ─── GET /api/analytics/dashboard ────────────────────────────
export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getDashboardData();

  res.json({
    success: true,
    data,
  });
});

// ─── GET /api/analytics/health ───────────────────────────────
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getHealthScore();

  res.json({
    success: true,
    data,
  });
});

// ─── GET /api/analytics/movements?days=30 ────────────────────
export const getMovementTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const data = await analyticsService.getMovementTrends(days);

  res.json({
    success: true,
    data,
  });
});
