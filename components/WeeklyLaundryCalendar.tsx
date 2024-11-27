/**
 * Componente de calendário para agendamento de lavanderia
 * 
 * Regras de Uso:
 * 1. Cada usuário tem direito a 2 reservas por semana
 * 2. Máximo de 1 reserva no mesmo período (manhã ou tarde) por semana
 * 3. Reservas podem ser feitas com até 14 dias de antecedência
 * 4. Períodos disponíveis:
 *    - Manhã: 8h às 14h
 *    - Tarde/Noite: 14h às 22h
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { useLaundryStore, LaundryReservation } from '@/lib/laundry-store';

interface WeeklyLaundryCalendarProps {
  currentUser: string;
}

const SLOTS = {
  morning: {
    label: 'Manhã',
    time: '05:00 - 12:00',
    icon: '🌅'
  },
  evening: {
    label: 'Tarde/Noite',
    time: '15:00 - 23:00',
    icon: '🌙'
  }
} as const;

const WeeklyLaundryCalendar: React.FC<WeeklyLaundryCalendarProps> = ({ currentUser }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'evening' | null>(null);
  
  const { reservations, addReservation, removeReservation } = useLaundryStore();

  // Constantes de configuração
  const MAX_WEEKLY_RESERVATIONS = 2; // Limite de reservas por semana
  const MAX_SAME_PERIOD = 1; // Limite de reservas no mesmo período
  const ADVANCE_DAYS_LIMIT = 14; // Limite de dias para reservas futuras

  /**
   * Obtém todas as reservas da semana atual
   * @returns Array de reservas da semana
   */
  const getCurrentWeekReservations = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return reservations.filter(r => {
      const reservationDate = new Date(r.date);
      return reservationDate >= startOfWeek && reservationDate <= endOfWeek;
    });
  };

  /**
   * Verifica se uma data está no passado ou muito no futuro
   * @param date Data a ser verificada
   * @returns true se a data for inválida para reserva
   */
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + ADVANCE_DAYS_LIMIT);
    
    return date < today || date > futureLimit;
  };

  /**
   * Verifica se o usuário já tem uma reserva no mesmo período da semana
   * @param date Data da reserva
   * @param slot Período (manhã ou tarde/noite)
   * @returns true se o usuário já atingiu o limite de reservas no período
   */
  const hasReservationInPeriod = (date: Date, slot: 'morning' | 'evening') => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const periodReservations = reservations.filter(r => 
      r.userId === currentUser && 
      r.slot === slot && 
      new Date(r.date) >= weekStart && 
      new Date(r.date) <= weekEnd
    );

    return periodReservations.length >= MAX_SAME_PERIOD;
  };

  const weeklyReservations = getCurrentWeekReservations();
  const userWeeklyReservations = weeklyReservations.filter(r => r.userId === currentUser);
  const remainingReservations = MAX_WEEKLY_RESERVATIONS - userWeeklyReservations.length;

  /**
   * Processa uma nova reserva
   * @param date Data selecionada
   * @param slot Período selecionado
   */
  const handleReservation = (date: Date, slot: 'morning' | 'evening') => {
    const formattedDate = formatDate(date);
    if (isSlotAvailable(formattedDate, slot)) {
      if (userWeeklyReservations.length < MAX_WEEKLY_RESERVATIONS) {
        if (!hasReservationInPeriod(date, slot)) {
          addReservation({
            userId: currentUser,
            date: formattedDate,
            slot
          });
          setShowReservationDialog(false);
        } else {
          alert('Você já tem uma reserva neste período da semana (manhã ou tarde). Por favor, escolha outro período para distribuir melhor os horários.');
        }
      } else {
        alert('Você já atingiu o limite de 2 reservas semanais.');
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSlotReservation = (date: string, slot: 'morning' | 'evening') => {
    return reservations.find(r => r.date === date && r.slot === slot);
  };

  const isSlotAvailable = (date: string, slot: 'morning' | 'evening') => {
    return !reservations.some(r => r.date === date && r.slot === slot);
  };

  const cancelReservation = (date: string, slot: 'morning' | 'evening') => {
    removeReservation(date, slot);
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getUserReservation = (date: string) => {
    return reservations.filter(r => r.userId === currentUser && r.date === date);
  };

  const renderSlot = (date: string, slot: 'morning' | 'evening') => {
    const reservation = getSlotReservation(date, slot);
    const isAvailable = !reservation;
    const isUserReservation = reservation?.userId === currentUser;
    const isPastDate = (new Date(date)) < new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div
        className={cn(
          "p-3 rounded-lg transition-all",
          isAvailable ? "bg-white/50" : "bg-gray-50/50",
          "border border-gray-100/50 backdrop-blur-sm hover:bg-opacity-90"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{SLOTS[slot].icon}</span>
            <div>
              <div className="font-medium text-sm text-gray-900">{SLOTS[slot].label}</div>
              <div className="text-xs text-gray-500">{SLOTS[slot].time}</div>
            </div>
          </div>
        </div>

        {!isAvailable ? (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              {reservation.userId}
            </span>
            {isUserReservation && !isPastDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelReservation(date, slot)}
                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cancelar
              </Button>
            )}
          </div>
        ) : !isPastDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReservation(new Date(date), slot)}
            className="w-full mt-2 h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 justify-center"
          >
            Reservar
          </Button>
        )}
      </div>
    );
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Calendário de Lavanderia</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Reservas disponíveis:</span>
                <span className={cn(
                  "font-bold",
                  remainingReservations > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {remainingReservations}/{MAX_WEEKLY_RESERVATIONS}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-gray-500 text-xs">
              <span>• Máximo de {MAX_WEEKLY_RESERVATIONS} reservas por semana</span>
              <span>• Máximo de {MAX_SAME_PERIOD} reserva por período (manhã/tarde)</span>
              <span>• Reservas disponíveis até {ADVANCE_DAYS_LIMIT} dias no futuro</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getWeekDays(selectedDate).map((day, index) => (
            <div
              key={day.toISOString()}
              className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {day.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {day.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                {getUserReservation(formatDate(day)).length > 0 && (
                  <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    Sua Reserva
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SLOTS).map(([key, slot]) => {
                  return (
                    <div key={key}>
                      {renderSlot(formatDate(day), key as 'morning' | 'evening')}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyLaundryCalendar;
