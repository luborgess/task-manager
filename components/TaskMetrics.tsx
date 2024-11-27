import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskMetricsProps {
  tasks: Array<{
    id: number;
    title: string;
    assignedTo: string | string[];
    completed: boolean;
    createdAt: string;
    completedAt?: string;
    deadline?: string;
    wasLate?: boolean;
  }>;
}

interface UserMetrics {
  username: string | string[];
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime?: number;
  onTimeTasks: number;
  lateTasks: number;
  currentStreak: number;
}

export const TaskMetrics: React.FC<TaskMetricsProps> = ({ tasks }) => {
  const formatUsername = (username: string | string[]) => {
    if (Array.isArray(username)) return username.join(' e ');
    if (typeof username === 'string' && username.includes(',')) return username.split(',').join(' e ');
    return username;
  };

  const calculateUserMetrics = (): UserMetrics[] => {
    const userMap = new Map<string | string[], UserMetrics>();

    // Inicializar métricas para cada usuário
    tasks.forEach(task => {
      if (!userMap.has(task.assignedTo)) {
        userMap.set(task.assignedTo, {
          username: task.assignedTo,
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          averageCompletionTime: 0,
          onTimeTasks: 0,
          lateTasks: 0,
          currentStreak: 0
        });
      }

      const userMetrics = userMap.get(task.assignedTo)!;
      userMetrics.totalTasks++;

      if (task.completed) {
        userMetrics.completedTasks++;
        
        // Calcular tempo de conclusão
        if (task.completedAt) {
          const completionTime = differenceInDays(
            new Date(task.completedAt),
            new Date(task.createdAt)
          );
          userMetrics.averageCompletionTime = userMetrics.averageCompletionTime || 0;
          userMetrics.averageCompletionTime = (userMetrics.averageCompletionTime + completionTime) / userMetrics.completedTasks;
          
          // Verificar se a tarefa foi concluída no prazo
          if (task.deadline) {
            if (new Date(task.completedAt) <= new Date(task.deadline)) {
              userMetrics.onTimeTasks++;
            } else {
              userMetrics.lateTasks++;
            }
          }
        }
      }

      userMetrics.completionRate = (userMetrics.completedTasks / userMetrics.totalTasks) * 100;
    });

    // Calcular streak atual
    Array.from(userMap.entries()).forEach(([username, metrics]) => {
      const userTasks = tasks
        .filter(t => t.assignedTo === username && t.completed)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

      let streak = 0;
      let lastDate = new Date();

      for (const task of userTasks) {
        const taskDate = new Date(task.completedAt!);
        const dayDiff = differenceInDays(lastDate, taskDate);

        if (dayDiff <= 1) {
          streak++;
          lastDate = taskDate;
        } else {
          break;
        }
      }

      metrics.currentStreak = streak;
    });

    return Array.from(userMap.values()).sort((a, b) => b.completionRate - a.completionRate);
  };

  const userMetrics = calculateUserMetrics();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const overallCompletionRate = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total de Tarefas</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Concluídas</p>
            <p className="text-2xl font-bold">{completedTasks}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Participantes</p>
            <p className="text-2xl font-bold">{userMetrics.length}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Taxa Geral</p>
            <p className="text-2xl font-bold">{Math.round(overallCompletionRate)}%</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {userMetrics.map((metrics) => (
          <Card key={JSON.stringify(metrics.username)} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold capitalize">{formatUsername(metrics.username)}</h3>
                <p className="text-sm text-gray-500">
                  Sequência atual: {metrics.currentStreak} {metrics.currentStreak === 1 ? 'dia' : 'dias'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {metrics.completedTasks}/{metrics.totalTasks} tarefas
                </span>
                <p className="text-sm text-gray-500">
                  No prazo: {metrics.onTimeTasks} | Atrasadas: {metrics.lateTasks}
                </p>
              </div>
            </div>
            
            <Progress 
              value={metrics.completionRate} 
              className="h-2"
            />
            
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{Math.round(metrics.completionRate)}% concluído</span>
              {metrics.averageCompletionTime !== undefined && (
                <span>
                  Média: {Math.round(metrics.averageCompletionTime)} {Math.round(metrics.averageCompletionTime) === 1 ? 'dia' : 'dias'}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
