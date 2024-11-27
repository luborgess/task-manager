import React, { useState } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

interface ShoppingScheduleProps {
  currentUser: string;
}

const ShoppingSchedule: React.FC<ShoppingScheduleProps> = ({ currentUser }) => {
  const [shoppingSchedule] = useState([
    { id: 1, user: 'john.doe', date: '2024-01-01', completed: true },
    { id: 2, user: 'jane.smith', date: '2024-01-08', completed: true },
    { id: 3, user: 'alice.dev', date: '2024-01-15', completed: false },
    { id: 4, user: 'bob.ops', date: '2024-01-22', completed: false },
    { id: 5, user: 'john.doe', date: '2024-01-29', completed: false },
    { id: 6, user: 'jane.smith', date: '2024-02-05', completed: false },
    { id: 7, user: 'alice.dev', date: '2024-02-12', completed: false },
    { id: 8, user: 'bob.ops', date: '2024-02-19', completed: false }
  ]);

  return (
    <Card className="bg-white bg-opacity-40 backdrop-blur-lg border border-white border-opacity-30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Shopping Schedule</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shoppingSchedule.map((schedule) => (
            <div
              key={schedule.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                schedule.user === currentUser
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <div>
                <p className="font-medium">@{schedule.user}</p>
                <p className="text-sm text-gray-500">{schedule.date}</p>
              </div>
              {schedule.completed ? (
                <Button variant="ghost" className="text-green-500" disabled>
                  Completed
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={schedule.user !== currentUser}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShoppingSchedule;
