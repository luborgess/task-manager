"use client"

import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, AlertCircle, Clock, FileText, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTasksStore } from '@/lib/tasks-store';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TaskReport from './TaskReport';
import { format, formatDistanceToNow, parseISO, startOfWeek, addWeeks, getWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/lib/auth-store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { ChangePassword } from './ChangePassword';
import { TaskMetrics } from './TaskMetrics';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Task {
  id: number;
  title: string;
  assignedTo: string | string[];
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  deadline?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly';
  requiresPair?: boolean;
  wasLate?: boolean;
}

interface TaskCheckerProps {
  currentUser: string;
}

const TaskChecker: React.FC<TaskCheckerProps> = ({ currentUser }) => {
  const { tasks, updateTasks, toggleTask, getDailyTaskResident, isTaskOverdue, getTaskDeadline, residents } = useTasksStore();
  const { canResetStorage } = useAuthStore();
  const [showReport, setShowReport] = useState(false);

  // Calcular a semana atual
  const startDate = new Date('2024-01-01');
  const currentDate = new Date();
  const weekNumber = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  const yearWeek = getWeek(currentDate, { weekStartsOn: 1 });

  // Atualizar tarefas quando a semana muda
  useEffect(() => {
    const checkWeekChange = () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const nextWeekStart = addWeeks(weekStart, 1);
      
      // Se estamos no início de uma nova semana
      if (now >= nextWeekStart) {
        const updatedTasks = tasks.map(task => {
          if (task.recurrence === 'weekly') {
            // Só atualiza se a tarefa foi concluída
            if (task.completed) {
              const newWeekNumber = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
              let newAssignedTo;
              
              if (task.requiresPair) {
                const pairs = taskOrders[task.title] || [];
                newAssignedTo = pairs[newWeekNumber % pairs.length];
              } else {
                const order = taskOrders[task.title] || residents;
                newAssignedTo = order[newWeekNumber % order.length];
              }

              return { 
                ...task, 
                assignedTo: newAssignedTo,
                completed: false,
                createdAt: now.toISOString(),
                completedAt: undefined
              };
            }
            // Se não foi concluída, mantém a tarefa como está
            return task;
          }
          return task;
        });
        updateTasks(updatedTasks);
      }
    };

    const interval = setInterval(checkWeekChange, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, [tasks, updateTasks]);

  // Atualizar tarefas diárias à meia-noite
  useEffect(() => {
    const checkDayChange = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        const updatedTasks = tasks.map(task => {
          if (task.recurrence === 'daily') {
            // Só cria nova tarefa diária se a anterior foi concluída
            if (task.completed) {
              return {
                ...task,
                assignedTo: getDailyTaskResident(),
                completed: false,
                createdAt: now.toISOString(),
                completedAt: undefined
              };
            }
            // Se não foi concluída, mantém a tarefa como está
            return task;
          } else if (task.recurrence === 'monthly' && now.getDate() === 1) {
            // Atualiza tarefas mensais no primeiro dia do mês
            const currentIndex = residents.indexOf(task.assignedTo);
            const nextIndex = (currentIndex + 1) % residents.length;
            return { ...task, assignedTo: residents[nextIndex], completed: false };
          }
          return task;
        });
        updateTasks(updatedTasks);
      }
    };

    const interval = setInterval(checkDayChange, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, [tasks, updateTasks, getDailyTaskResident, residents]);

  // Calcular progresso
  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  // Função para verificar se o usuário atual pode completar a tarefa
  const canCompleteTask = (assignedTo: string | string[]) => {
    const normalizedCurrentUser = currentUser.toLowerCase();
    if (Array.isArray(assignedTo)) {
      return assignedTo.some(user => user.toLowerCase() === normalizedCurrentUser);
    }
    return assignedTo.toLowerCase() === normalizedCurrentUser;
  };

  // Toggle status da tarefa
  const handleToggleTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!canCompleteTask(task.assignedTo)) {
      alert('Você só pode completar tarefas atribuídas a você!');
      return;
    }

    toggleTask(taskId);
  };

  const handleReset = () => {
    if (!canResetStorage()) {
      alert('Você não tem permissão para resetar o sistema.');
      return;
    }
    if (confirm('Tem certeza que deseja resetar todas as tarefas? Essa ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasksList = tasks.filter(task => task.completed);

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Configuração inicial do documento
    doc.setFont("helvetica");
    doc.setFontSize(20);
    doc.text("Relatório de Tarefas", 20, 20);
    
    // Organizar tarefas por mês
    const tasksByMonth: { [key: string]: any[] } = {};
    completedTasksList.forEach(task => {
      const date = new Date(task.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!tasksByMonth[monthKey]) {
        tasksByMonth[monthKey] = {
          monthName,
          tasks: []
        };
      }
      
      tasksByMonth[monthKey].tasks.push({
        task: task.title,
        user: Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : task.assignedTo,
        date: date.toLocaleDateString('pt-BR')
      });
    });
    
    // Ordenar meses
    const sortedMonths = Object.keys(tasksByMonth).sort().reverse();
    
    let yOffset = 30;
    
    // Gerar tabelas para cada mês
    sortedMonths.forEach(monthKey => {
      const monthData = tasksByMonth[monthKey];
      
      // Adicionar nova página se necessário
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }
      
      // Título do mês
      yOffset += 10;
      doc.setFontSize(16);
      doc.text(monthData.monthName, 20, yOffset);
      yOffset += 10;
      
      // Gerar tabela do mês
      autoTable(doc, {
        startY: yOffset,
        head: [['Tarefa', 'Responsável', 'Data']],
        body: monthData.tasks.map(t => [t.task, t.user, t.date]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 10 }
      });
      
      yOffset = (doc as any).lastAutoTable.finalY + 20;
    });
    
    // Salvar o PDF
    doc.save('relatorio-tarefas.pdf');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold tracking-tight">Tarefas</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={generateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Gerar Relatório PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full inline-flex h-10 items-center justify-start rounded-lg bg-zinc-100/50 dark:bg-zinc-800/50 p-1 mb-4 overflow-x-auto">
            <TabsTrigger 
              value="active"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50"
            >
              Ativas
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50"
            >
              Concluídas
            </TabsTrigger>
            <TabsTrigger 
              value="metrics"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50"
            >
              Métricas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-4 mt-4">
              {activeTasks.map((task) => {
                const isOverdue = isTaskOverdue(task);
                const deadline = task.deadline ? new Date(task.deadline) : new Date();
                const isValidDate = !isNaN(deadline.getTime());
                const assignedToUser = canCompleteTask(task.assignedTo);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isOverdue ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        disabled={!assignedToUser}
                        className={`flex-shrink-0 ${!assignedToUser ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {task.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : isOverdue ? (
                          <AlertCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500">
                          {Array.isArray(task.assignedTo)
                            ? `Responsáveis: ${task.assignedTo.join(' e ')}`
                            : `Responsável: ${task.assignedTo}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isValidDate ? (
                            <>
                              Prazo: {format(deadline, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {isOverdue && (
                                <span className="text-red-500 ml-2">
                                  (Atrasado há {formatDistanceToNow(deadline, { locale: ptBR })})
                                </span>
                              )}
                            </>
                          ) : (
                            <span>Prazo não definido</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4 mt-4">
              {completedTasksList.map((task) => {
                const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
                const isValidCompletedDate = !isNaN(completedDate.getTime());
                const assignedToUser = canCompleteTask(task.assignedTo);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 ${
                      task.wasLate ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        disabled={!assignedToUser}
                        className={`flex-shrink-0 ${!assignedToUser ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 transition-transform'}`}
                        title={assignedToUser ? "Desmarcar tarefa" : "Você só pode desmarcar suas próprias tarefas"}
                      >
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </button>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500">
                          {Array.isArray(task.assignedTo)
                            ? `Concluído por: ${task.assignedTo.join(' e ')}`
                            : `Concluído por: ${task.assignedTo}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isValidCompletedDate ? (
                            <>
                              Concluído em: {format(completedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {task.wasLate && (
                                <span className="text-yellow-600 ml-2">(Concluído com atraso)</span>
                              )}
                            </>
                          ) : (
                            <span>Data de conclusão não disponível</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="mt-4">
              <TaskMetrics tasks={tasks} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskChecker;
