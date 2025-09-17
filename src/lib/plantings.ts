import { csrfAPI } from './csrf';

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

  // New optional fields
  substrate?: string;
  irrigationMl?: number;
  soakingHours?: number;

  // Relations
  harvests?: unknown[];
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

  // New optional fields
  substrate?: string;
  irrigationMl?: number;
  soakingHours?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://micro-greens-backend.vercel.app';

export const plantingsAPI = {
  async getPlantings(params?: { page?: number; limit?: number; status?: PlantingStatus }): Promise<Planting[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const url = `${API_BASE}/api/plantings${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    // GET request doesn't need CSRF token
    const response = await fetch(url, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch plantings: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data; // Handle both paginated and direct responses
  },

  async createPlanting(planting: PlantingFormData): Promise<Planting> {
    const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/plantings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planting)
    });

    if (!response.ok) {
      const errorText = await response.text();

      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to create planting');
      } catch {
        throw new Error(`Failed to create planting: ${response.status}`);
      }
    }

    return response.json();
  },

  async updatePlanting(id: string, updates: Partial<PlantingFormData>): Promise<Planting> {
    console.log('Attempting to update planting:', id, updates);
    const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/plantings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    console.log('Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();

      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to update planting');
      } catch {
        throw new Error(`Failed to update planting: ${response.status}`);
      }
    }

    return response.json();
  },

  async deletePlanting(id: string): Promise<{ success: boolean }> {
    console.log('Attempting to delete planting:', id);
    const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/plantings/${id}`, {
      method: 'DELETE'
    });
    console.log('Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();

      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to delete planting');
      } catch {
        throw new Error(`Failed to delete planting: ${response.status}`);
      }
    }

    return response.json();
  }
};