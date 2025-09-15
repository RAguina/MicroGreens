'use client';

import { useState } from 'react';
import PlantingCalendar from '@/components/calendario/PlantingCalendar';
import EditPlantingForm from '@/components/siembras/EditPlantingForm';
import CreatePlantingForm from '@/components/siembras/CreatePlantingForm';
import { Planting } from '@/lib/plantings';

interface PlantingEvent {
  id: string;
  planting: Planting;
  type: 'planted' | 'harvest' | 'dome' | 'light';
}

export default function CalendarioPage() {
  const [selectedPlanting, setSelectedPlanting] = useState<Planting | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSelectEvent = (event: PlantingEvent) => {
    setSelectedPlanting(event.planting);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setShowCreateForm(true);
  };

  const refreshCalendar = () => {
    // The calendar component will automatically refresh when the forms close
    // since it loads data on mount and the forms will trigger re-renders
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Calendario</h1>
          <p className="text-gray-600">Planifica y visualiza tus ciclos de cultivo</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nueva Siembra
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">💡 Cómo usar el calendario:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>Haz clic en un evento</strong> para ver y editar los detalles de la siembra</li>
          <li>• <strong>Haz clic en una fecha vacía</strong> para crear una nueva siembra en esa fecha</li>
          <li>• <strong>Cambia la vista</strong> usando los botones Mes, Semana, Día, Agenda</li>
          <li>• <strong>Los colores</strong> indican diferentes etapas del ciclo de cultivo</li>
        </ul>
      </div>

      {/* Calendar Component */}
      <PlantingCalendar
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
      />

      {/* Edit Planting Form Modal */}
      {selectedPlanting && (
        <EditPlantingForm
          planting={selectedPlanting}
          onSuccess={() => {
            setSelectedPlanting(null);
            refreshCalendar();
          }}
          onCancel={() => setSelectedPlanting(null)}
        />
      )}

      {/* Create Planting Form Modal */}
      {showCreateForm && (
        <CreatePlantingForm
          initialDate={selectedDate}
          onSuccess={() => {
            setShowCreateForm(false);
            setSelectedDate(null);
            refreshCalendar();
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}