export interface HealthMetrics {
    totalProducts: number;
    lowStockCount: number;
    deadStockCount: number;
    totalLocations: number;
    overCapacityCount: number;
}
export interface HealthResult {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    penalties: {
        lowStock: number;
        deadStock: number;
        overCapacity: number;
    };
    metrics: HealthMetrics;
}
export declare const calculateHealthScore: (metrics: HealthMetrics) => HealthResult;
//# sourceMappingURL=healthScore.d.ts.map