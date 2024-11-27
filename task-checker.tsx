import React, { useState } from 'react';
import { CheckCircle, Circle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ShoppingSchedule from './shopping-schedule';
import WeeklyLaundryCalendar from './laundry-weekly-view';
import { Task, TaskTitle } from '@/lib/tasks-store';

interface TaskCheckerProps {
  currentUser: string;
}

const TaskChecker: React.FC<TaskCheckerProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Limpeza do banheiro esquerdo',
      assignedTo: 'lucas',
      completed: false,
      createdAt: '2024-01-01',
      deadline: '2024-01-08',
      recurrence: 'weekly',
      area: 'Banheiro',
      order: 1,
    },
    {
      id: 2,
      title: 'Limpeza do banheiro direito',
      assignedTo: 'luiz',
      completed: false,
      createdAt: '2024-01-01',
      deadline: '2024-01-08',
      recurrence: 'weekly',
      area: 'Banheiro',
      order: 2,
    },
    {
      id: 3,
      title: 'Limpeza da sala e cozinha',
      assignedTo: ['kelvin', 'robson'],
      completed: true,
      createdAt: '2024-01-03',
      deadline: '2024-01-10',
      recurrence: 'weekly',
      area: 'Sala/Cozinha',
      order: 3,
      requiresPair: true
    },
    {
      id: 4,
      title: 'Retirar o Lixo',
      assignedTo: 'bruno',
      completed: false,
      createdAt: '2024-01-04',
      deadline: '2024-01-05',
      recurrence: 'daily',
      area: 'Geral',
      order: 4,
    },
    {
      id: 5,
      title: 'Limpeza da Geladeira',
      assignedTo: 'robson',
      completed: false,
      createdAt: '2024-01-05',
      deadline: '2024-02-05',
      recurrence: 'monthly',
      area: 'Cozinha',
      order: 5,
    }
  ]);

  const [showStats, setShowStats] = useState(true);

  const handleTaskToggle = (taskId: number): void => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.assignedTo === currentUser) {
          return { ...task, completed: !task.completed };
        }
      }
      return task;
    }));
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: Task) => task.completed).length;
  const completionRate = (completedTasks / totalTasks) * 100;

  interface UserStat {
    assigned: number;
    completed: number;
    user: string;
    completionRate?: number;
  }

  // Get unique users and their stats
  const userStats = tasks.reduce<Record<string, UserStat>>((acc, task: Task) => {
    const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
    if (!acc[assignedTo]) {
      acc[assignedTo] = {
        assigned: 0,
        completed: 0,
        user: assignedTo
      };
    }
    acc[assignedTo].assigned += 1;
    if (task.completed) {
      acc[assignedTo].completed += 1;
    }
    return acc;
  }, {});

  // Convert to array and calculate completion rate
  const userStatsArray = Object.values(userStats).map((stat: UserStat) => ({
    ...stat,
    completionRate: (stat.completed / stat.assigned) * 100
  }));

  // Sort tasks to show assigned tasks first
  const sortedTasks = [...tasks].sort((a: Task, b: Task) => {
    if (a.assignedTo === currentUser && b.assignedTo !== currentUser) return -1;
    if (a.assignedTo !== currentUser && b.assignedTo === currentUser) return 1;
    return 0;
  });

  const userTasks = tasks.filter((task: Task) => {
    if (Array.isArray(task.assignedTo)) {
      return task.assignedTo.includes(currentUser);
    }
    return task.assignedTo === currentUser;
  });

  return (
    <div className="w-full space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white bg-opacity-40 backdrop-blur-lg border border-white border-opacity-30">
          <CardHeader>
            <CardTitle className="text-lg">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white bg-opacity-40 backdrop-blur-lg border border-white border-opacity-30">
          <CardHeader>
            <CardTitle className="text-lg">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white bg-opacity-40 backdrop-blur-lg border border-white border-opacity-30">
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Shopping Schedule */}
      <ShoppingSchedule currentUser={currentUser} />

      {/* Laundry Schedule */}
      <WeeklyLaundryCalendar currentUser={currentUser} />

      {/* User Heatmap */}
      <Card className="bg-white bg-opacity-40 backdrop-blur-lg border border-white border-opacity-30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Activity Heatmap</CardTitle>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            {showStats ? <ChevronUp /> : <ChevronDown />}
          </button>
        </CardHeader>
        {showStats && (
          <CardContent>
            <div className="space-y-4">
              {userStatsArray.map((stat) => (
                <div key={stat.user} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">@{stat.user}</span>
                    <span className="text-sm text-gray-600">
                      {stat.completed}/{stat.assigned} tasks
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const intensity = (stat.completionRate / 100) * 10;
                      const isActive = i < intensity;
                      return (
                        <div
                          key={i}
                          className={`h-8 rounded ${
                            isActive
                              ? `bg-blue-${Math.min(100 + (i * 100), 900)}`
                              : 'bg-gray-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Task List */}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Tasks</h2>
        
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-xl bg-white backdrop-blur-sm border border-white border-opacity-20 transition-all duration-300 hover:bg-opacity-50
                ${task.assignedTo === currentUser ? 'bg-opacity-40' : 'bg-opacity-20'}`}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  disabled={task.assignedTo !== currentUser}
                  className={`focus:outline-none transition-transform duration-200 
                    ${task.assignedTo === currentUser ? 'hover:scale-110' : 'cursor-not-allowed opacity-50'}`}
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <div>
                  <span className={`text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </span>
                  <div className="text-xs text-gray-500">Created: {task.createdAt}</div>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${task.assignedTo === currentUser ? 'text-blue-500' : 'text-gray-500'}`}>
                  @{task.assignedTo}
                </span>
                {task.assignedTo !== currentUser && (
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {tasks.filter(task => task.assignedTo === currentUser).length === 0 && (
          <Alert className="mt-6 bg-opacity-50 backdrop-blur-sm">
            <AlertDescription>
              You don't have any tasks assigned to you yet.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default TaskChecker;