// ShoppingSchedule.jsx
import React, { useState } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ShoppingSchedule = ({ currentUser }) => {
  const [shoppingSchedule] = useState([
    { id: 1, user: 'lucas', date: '2024-01-01', completed: true },
    { id: 2, user: 'luiz', date: '2024-01-08', completed: true },
    { id: 3, user: 'kelvin', date: '2024-01-15', completed: false },
    { id: 4, user: 'bruno', date: '2024-01-22', completed: false },
    { id: 5, user: 'robson', date: '2024-01-29', completed: false },
    { id: 6, user: 'fulano', date: '2024-02-05', completed: false },
    { id: 7, user: 'natan', date: '2024-02-12', completed: false },
    { id: 8, user: 'gabriel', date: '2024-02-19', completed: false }
  ]);

  const [showShoppingSchedule, setShowShoppingSchedule] = useState(true);

  // Format date to a more readable format
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  // Get current week's shopper
  const getCurrentShopper = () => {
    const today = new Date();
    return shoppingSchedule.find(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= today;
    });
  };

  const currentShopper = getCurrentShopper();

  return (
    <Card className="bg-white bg-opacity-40 backdrop-blur-lg border border-white border-opacity-30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <CardTitle>Escala de Compras</CardTitle>
        </div>
        <button
          onClick={() => setShowShoppingSchedule(!showShoppingSchedule)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          {showShoppingSchedule ? <ChevronUp /> : <ChevronDown />}
        </button>
      </CardHeader>
      {showShoppingSchedule && (
        <CardContent>
          {/* Current Shopper Alert */}
          {currentShopper && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Responsável desta semana: </span>
                  <span className="text-blue-600">@{currentShopper.user}</span>
                </div>
                <Badge variant={currentUser === currentShopper.user ? "default" : "secondary"}>
                  {formatDate(currentShopper.date)}
                </Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Schedule Timeline */}
          <div className="relative mt-4">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {shoppingSchedule.map((schedule) => {
                const isCurrentUser = schedule.user === currentUser;
                const isPast = new Date(schedule.date) < new Date();
                
                return (
                  <div 
                    key={schedule.id}
                    className={`relative pl-10 ${isPast ? 'opacity-60' : ''}`}
                  >
                    {/* Timeline dot */}
                    <div 
                      className={`absolute left-0 w-8 h-8 rounded-full border-4 flex items-center justify-center
                        ${schedule.completed 
                          ? 'bg-green-100 border-green-500' 
                          : isCurrentUser 
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-300'
                        }`}
                    >
                      <ShoppingCart className={`w-4 h-4 ${
                        schedule.completed 
                          ? 'text-green-500' 
                          : isCurrentUser 
                            ? 'text-blue-500'
                            : 'text-gray-400'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className={`
                      p-4 rounded-lg border
                      ${isCurrentUser 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200'}
                    `}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isCurrentUser ? 'text-blue-600' : ''}`}>
                          @{schedule.user}
                        </span>
                        <Badge variant={isCurrentUser ? "default" : "secondary"}>
                          {formatDate(schedule.date)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ShoppingSchedule;