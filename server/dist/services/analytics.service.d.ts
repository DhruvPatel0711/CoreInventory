import { HealthResult } from '../utils/healthScore';
export interface DashboardData {
    totalProducts: number;
    totalStockQuantity: number;
    lowStockProducts: Array<{
        _id: string;
        name: string;
        sku: string;
        totalQuantity: number;
        reorderLevel: number;
    }>;
    recentMovements: any[];
    movementCounts: {
        receipts: number;
        deliveries: number;
        transfers: number;
        adjustments: number;
    };
}
export declare const getDashboardData: () => Promise<DashboardData>;
export declare const getHealthScore: () => Promise<HealthResult>;
export declare const getMovementTrends: (days?: number) => Promise<{
    days: number;
    trends: any[];
    categoryBreakdown: any[];
}>;
//# sourceMappingURL=analytics.service.d.ts.map