// ─── Inventory Health Score ──────────────────────────────────
// Pure function: takes aggregated metrics, returns 0–100 score.
//
// Penalties:
//   lowStockPenalty     — % of products below reorder level
//   deadStockPenalty    — % of products with 0 movements in 30 days
//   overCapacityPenalty — % of locations where qty > capacity

export interface HealthMetrics {
  totalProducts: number;
  lowStockCount: number;      // products below their reorderLevel
  deadStockCount: number;     // products with 0 movements in last 30 days
  totalLocations: number;
  overCapacityCount: number;  // locations where quantity > capacity
}

export interface HealthResult {
  score: number;              // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  penalties: {
    lowStock: number;
    deadStock: number;
    overCapacity: number;
  };
  metrics: HealthMetrics;
}

export const calculateHealthScore = (metrics: HealthMetrics): HealthResult => {
  const {
    totalProducts,
    lowStockCount,
    deadStockCount,
    totalLocations,
    overCapacityCount,
  } = metrics;

  // Calculate penalty percentages (each weighted 0–33)
  const lowStockPenalty =
    totalProducts > 0
      ? Math.round((lowStockCount / totalProducts) * 33)
      : 0;

  const deadStockPenalty =
    totalProducts > 0
      ? Math.round((deadStockCount / totalProducts) * 33)
      : 0;

  const overCapacityPenalty =
    totalLocations > 0
      ? Math.round((overCapacityCount / totalLocations) * 34)
      : 0;

  const score = Math.max(
    0,
    100 - lowStockPenalty - deadStockPenalty - overCapacityPenalty
  );

  // Letter grade
  let grade: HealthResult['grade'];
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    penalties: {
      lowStock: lowStockPenalty,
      deadStock: deadStockPenalty,
      overCapacity: overCapacityPenalty,
    },
    metrics,
  };
};
