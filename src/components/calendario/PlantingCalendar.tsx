'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { plantingsAPI, Planting } from '@/lib/plantings';

// Configure moment in Spanish
moment.locale('es');
const localizer = momentLocalizer(moment);

interface PlantingEvent extends Event {
  id: string;
  planting: Planting;
  type: 'planted' | 'harvest' | 'dome' | 'light';
}

interface PlantingCalendarProps {
  onSelectEvent?: (event: PlantingEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function PlantingCalendar({ onSelectEvent, onSelectSlot }: PlantingCalendarProps) {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlantings();
  }, []);

  const loadPlantings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plantingsAPI.getPlantings();
      setPlantings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando siembras');
    } finally {
      setLoading(false);
    }
  };

  const events: PlantingEvent[] = useMemo(() => {
    const eventList: PlantingEvent[] = [];

    plantings.forEach((planting) => {
      // Planted event
      eventList.push({
        id: `${planting.id}-planted`,
        title: `🌱 ${planting.plantName || 'Sin nombre'}`,
        start: new Date(planting.datePlanted),
        end: new Date(planting.datePlanted),
        planting,
        type: 'planted',
        resource: { status: planting.status, type: 'planted' }
      });

      // Expected harvest event
      if (planting.expectedHarvest) {
        eventList.push({
          id: `${planting.id}-harvest`,
          title: `🌾 ${planting.plantName || 'Sin nombre'} (Cosecha)`,
          start: new Date(planting.expectedHarvest),
          end: new Date(planting.expectedHarvest),
          planting,
          type: 'harvest',
          resource: { status: planting.status, type: 'harvest' }
        });
      }

      // Dome date event
      if (planting.domeDate) {
        eventList.push({
          id: `${planting.id}-dome`,
          title: `🏠 ${planting.plantName || 'Sin nombre'} (Cúpula)`,
          start: new Date(planting.domeDate),
          end: new Date(planting.domeDate),
          planting,
          type: 'dome',
          resource: { status: planting.status, type: 'dome' }
        });
      }

      // Light date event
      if (planting.lightDate) {
        eventList.push({
          id: `${planting.id}-light`,
          title: `💡 ${planting.plantName || 'Sin nombre'} (Luz)`,
          start: new Date(planting.lightDate),
          end: new Date(planting.lightDate),
          planting,
          type: 'light',
          resource: { status: planting.status, type: 'light' }
        });
      }
    });

    return eventList;
  }, [plantings]);

  const eventStyleGetter = (event: PlantingEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    switch (event.type) {
      case 'planted':
        backgroundColor = '#10b981'; // green
        borderColor = '#059669';
        break;
      case 'harvest':
        backgroundColor = '#f59e0b'; // yellow
        borderColor = '#d97706';
        break;
      case 'dome':
        backgroundColor = '#8b5cf6'; // purple
        borderColor = '#7c3aed';
        break;
      case 'light':
        backgroundColor = '#06b6d4'; // cyan
        borderColor = '#0891b2';
        break;
    }

    // Adjust opacity based on planting status
    if (event.planting.status === 'HARVESTED') {
      backgroundColor = '#9ca3af'; // gray
      borderColor = '#6b7280';
    } else if (event.planting.status === 'COMPOSTED') {
      backgroundColor = '#374151'; // dark gray
      borderColor = '#1f2937';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+ Ver ${total} más`
  };

  const formats = {
    dayFormat: 'dddd, DD MMMM YYYY',
    dayHeaderFormat: 'dddd, DD MMMM YYYY',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`;
    },
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`;
    },
    agendaDateFormat: 'dddd, DD MMMM',
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Cargando calendario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error:</div>
        <div className="text-red-600">{error}</div>
        <button
          onClick={loadPlantings}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendario de Siembras</h3>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>🌱 Siembra</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>🌾 Cosecha</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>🏠 Cúpula</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span>💡 Luz</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Finalizado</span>
          </div>
        </div>
      </div>

      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={messages}
          formats={formats}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          popup
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          step={60}
          showMultiDayTimes
          culture="es"
        />
      </div>
    </div>
  );
}