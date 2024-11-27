import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LaundryWeeklyViewProps {
  currentUser: string;
}

interface Reservation {
  id: number;
  date: string;
  slot: 'morning' | 'evening';
  user: string;
}

// Dados iniciais com datas fixas
const initialReservations: Reservation[] = [
  { id: 1, date: '2024-01-24', slot: 'morning', user: 'john.doe' },
  { id: 2, date: '2024-01-25', slot: 'evening', user: 'jane.smith' },
  { id: 3, date: '2024-01-26', slot: 'morning', user: 'bob.ops' }
];

const LaundryWeeklyView: React.FC<LaundryWeeklyViewProps> = ({ currentUser }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getSlotReservation = (date: Date, slot: 'morning' | 'evening') => {
    const formattedDate = formatDate(date);
    return reservations.find(r => r.date === formattedDate && r.slot === slot);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const renderSlot = (date: string, slot: 'morning' | 'evening') => {
    const reservation = reservations.find(r => r.date === date && r.slot === slot);
    const isUserSlot = reservation?.user === currentUser;

    return (
      <div className={`p-2 rounded ${
        reservation 
          ? isUserSlot 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
          : 'bg-green-50 text-green-800'
      }`}>
        {reservation ? (
          <div className="text-sm">
            {reservation.user}
            {isUserSlot && (
              <span className="ml-2 text-xs">(você)</span>
            )}
          </div>
        ) : (
          <div className="text-sm">Disponível</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigateWeek('prev')}
          className="bg-white/50 dark:bg-gray-800/50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <Button
          variant="outline"
          onClick={() => navigateWeek('next')}
          className="bg-white/50 dark:bg-gray-800/50"
        >
          Next Week
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-4">
        {getWeekDays(currentWeek).map((date, index) => {
          const formattedDate = formatDate(date);
          const past = isPastDate(date);

          return (
            <Card
              key={formattedDate}
              className={cn(
                "bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20",
                isToday(date) && "ring-2 ring-blue-500 ring-opacity-50"
              )}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  <span className="block text-xs text-gray-500 mt-1">
                    {date.getDate()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {/* Morning Slot */}
                  <div className="flex items-center space-x-1">
                    <Sun className="h-3 w-3" />
                    <span>05:00 - 12:00</span>
                  </div>
                  {renderSlot(formattedDate, 'morning')}

                  {/* Evening Slot */}
                  <div className="flex items-center space-x-1">
                    <Moon className="h-3 w-3" />
                    <span>15:00 - 23:00</span>
                  </div>
                  {renderSlot(formattedDate, 'evening')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LaundryWeeklyView;