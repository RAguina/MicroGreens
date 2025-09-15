import { Planting } from './plantings';

export interface AnalyticsMetrics {
  totalPlantings: number;
  plantingsByStatus: {
    PLANTED: number;
    GROWING: number;
    HARVESTED: number;
    COMPOSTED: number;
  };
  averageDaysToHarvest: number;
  mostPopularPlants: Array<{
    plantName: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    plantings: number;
    harvests: number;
  }>;
  harvestEfficiency: {
    totalPlanted: number;
    totalHarvested: number;
    efficiency: number; // percentage
  };
  recentActivity: Array<{
    id: string;
    plantName: string;
    action: 'planted' | 'harvested' | 'composted';
    date: string;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://micro-greens-backend.vercel.app';

export const analyticsAPI = {
  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      // For now, we'll calculate metrics from the plantings data
      // Later this can be moved to a dedicated backend endpoint
      const response = await fetch(`${API_BASE}/api/plantings`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plantings data: ${response.status}`);
      }

      const plantingsData = await response.json();
      const plantings = plantingsData.data || plantingsData;

      return this.calculateMetrics(plantings);
    } catch (error) {
      throw error;
    }
  },

  calculateMetrics(plantings: Planting[]): AnalyticsMetrics {
    const now = new Date();

    // Status counts
    const plantingsByStatus = {
      PLANTED: plantings.filter(p => p.status === 'PLANTED').length,
      GROWING: plantings.filter(p => p.status === 'GROWING').length,
      HARVESTED: plantings.filter(p => p.status === 'HARVESTED').length,
      COMPOSTED: plantings.filter(p => p.status === 'COMPOSTED').length,
    };

    // Average days to harvest (for harvested plantings)
    const harvestedPlantings = plantings.filter(p => p.status === 'HARVESTED');
    const avgDays = harvestedPlantings.length > 0
      ? Math.round(
          harvestedPlantings.reduce((sum, p) => {
            const planted = new Date(p.datePlanted);
            const harvested = new Date(p.updatedAt); // Approximate harvest date
            return sum + Math.abs(harvested.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / harvestedPlantings.length
        )
      : 0;

    // Most popular plants
    const plantCounts: { [key: string]: number } = {};
    plantings.forEach(p => {
      const name = p.plantName || 'Sin nombre';
      plantCounts[name] = (plantCounts[name] || 0) + 1;
    });

    const mostPopular = Object.entries(plantCounts)
      .map(([name, count]) => ({
        plantName: name,
        count,
        percentage: Math.round((count / plantings.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const plantingsInMonth = plantings.filter(p => {
        const plantedDate = new Date(p.datePlanted);
        return plantedDate >= monthStart && plantedDate <= monthEnd;
      }).length;

      const harvestsInMonth = plantings.filter(p => {
        if (p.status !== 'HARVESTED') return false;
        const updatedDate = new Date(p.updatedAt);
        return updatedDate >= monthStart && updatedDate <= monthEnd;
      }).length;

      monthlyTrends.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        plantings: plantingsInMonth,
        harvests: harvestsInMonth
      });
    }

    // Harvest efficiency
    const totalPlanted = plantingsByStatus.PLANTED + plantingsByStatus.GROWING + plantingsByStatus.HARVESTED;
    const totalHarvested = plantingsByStatus.HARVESTED;
    const efficiency = totalPlanted > 0 ? Math.round((totalHarvested / totalPlanted) * 100) : 0;

    // Recent activity (last 10 activities)
    const recentActivity = plantings
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        plantName: p.plantName || 'Sin nombre',
        action: p.status === 'HARVESTED' ? 'harvested' as const : 'planted' as const,
        date: p.updatedAt
      }));

    return {
      totalPlantings: plantings.length,
      plantingsByStatus,
      averageDaysToHarvest: avgDays,
      mostPopularPlants: mostPopular,
      monthlyTrends,
      harvestEfficiency: {
        totalPlanted,
        totalHarvested,
        efficiency
      },
      recentActivity
    };
  }
};