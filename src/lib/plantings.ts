// Types based on the real database schema and API contract
export type PlantingStatus =
  | 'PLANTED'     // Seeds planted, germinating
  | 'GROWING'     // Actively growing
  | 'HARVESTED'   // Completed harvest
  | 'COMPOSTED';  // Disposed of

export interface Planting {
  id: string;
  plantName?: string;
  datePlanted: string;
  expectedHarvest?: string;
  domeDate?: string;
  lightDate?: string;
  quantity?: number;
  yield?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userId: string;
  plantTypeId?: string;
  status: PlantingStatus;
  trayNumber?: string;

  // Relations
  harvests?: any[];
  _count?: {
    harvests: number;
  };
}

export interface PlantingFormData {
  plantTypeId?: string;
  plantName?: string;
  datePlanted: string;
  expectedHarvest?: string;
  domeDate?: string;
  lightDate?: string;
  quantity?: number;
  status?: PlantingStatus;
  trayNumber?: string;
  notes?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://micro-greens-backend.vercel.app';

export const plantingsAPI = {
  async getPlantings(params?: { page?: number; limit?: number; status?: PlantingStatus }): Promise<Planting[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const url = `${API_BASE}/api/plantings${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    console.log('Fetching plantings from:', url);

    const response = await fetch(url, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch plantings: ${response.status}`);
    }

    const data = await response.json();
    console.log('Plantings data received:', data);
    return data.data || data; // Handle both paginated and direct responses
  },

  async createPlanting(planting: PlantingFormData): Promise<Planting> {
    console.log('Creating planting:', planting);

    const response = await fetch(`${API_BASE}/api/plantings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(planting)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create planting');
    }

    return response.json();
  },

  async updatePlanting(id: string, updates: Partial<PlantingFormData>): Promise<Planting> {
    console.log('Updating planting:', id, updates);

    const response = await fetch(`${API_BASE}/api/plantings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update planting');
    }

    return response.json();
  },

  async deletePlanting(id: string): Promise<{ success: boolean }> {
    console.log('Deleting planting:', id);

    const response = await fetch(`${API_BASE}/api/plantings/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete planting');
    }

    return response.json();
  }
};