import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isAfter, startOfDay, addDays, startOfWeek, addWeeks, format, startOfMonth, addMonths, differenceInMonths } from 'date-fns'

export interface Task {
  id: number
  title: TaskTitle
  assignedTo: string | string[]
  completed: boolean
  createdAt: string
  completedAt?: string
  deadline: string        // Data limite para conclusão
  recurrence: 'daily' | 'weekly' | 'monthly'
  area: string
  order: number
  requiresPair?: boolean
  wasLate?: boolean      // Indica se a tarefa foi concluída com atraso
}

// Tipo para as chaves de taskOrders
export type TaskTitle = 
  | 'Limpeza do banheiro esquerdo'
  | 'Limpeza do banheiro direito'
  | 'Limpeza da sala e cozinha'
  | 'Retirar o Lixo'
  | 'Limpeza da Geladeira'
  | 'Ida ao mercado';

interface TasksStore {
  tasks: Task[]
  updateTasks: (tasks: Task[]) => void
  toggleTask: (taskId: number) => void
  isTaskOverdue: (task: Task) => boolean
  getTaskDeadline: (task: Task) => Date
  getDailyTaskResident: () => string
  residents: string[]
  taskOrders: Record<TaskTitle, readonly (string | string[])[]>
}

// Lista de moradores para rotação na ordem correta
const residents = [
  'Lucas',
  'Luiz',
  'Kelvin',
  'Bruno',
  'Robson',
  'Fulano',
  'Natan',
  'Gabriel'
];

// Definição das ordens específicas para cada tarefa
const taskOrders: Record<TaskTitle, readonly (string | string[])[]> = {
  'Limpeza do banheiro esquerdo': ['Bruno', 'Robson', 'Kelvin', 'Lucas'],
  'Limpeza do banheiro direito': ['Gabriel', 'Natan','Luiz'],
  'Limpeza da sala e cozinha': [
    ['Lucas', 'Luiz'], 
    ['Gabriel', 'Natan'], 
    ['kelvin', 'Robson'], 
    ['Bruno', 'Fulano'],
  ],
  'Retirar o Lixo': ['Natan', 'Luiz', 'Bruno','Gabriel', 'Lucas', 'Kelvin', 'Robson'],
  'Limpeza da Geladeira': ['Luiz', 'Bruno', 'Fulano', 'Gabriel', 'Lucas', 'Kelvin', 'Robson', 'Natan'],
  'Ida ao mercado': [
    ['Robson', 'kelvin'],
    ['Lucas', 'Luiz'],
    ['Natan', 'Bruno'],
    ['Gabriel', 'Fulano']
  ]
};

// Função para calcular o próximo prazo baseado na recorrência
const calculateNextDeadline = (baseDate: Date, recurrence: 'daily' | 'weekly' | 'monthly'): Date => {
  const date = new Date(baseDate);
  switch (recurrence) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addDays(date, 7);
    case 'monthly':
      return addMonths(date, 1);
    default:
      return date;
  }
};

// Tarefas fixas com suas recorrências
const fixedTasks: { 
  id: number; 
  title: TaskTitle; 
  recurrence: 'daily' | 'weekly' | 'monthly'; 
  area: string; 
  order: number;
  requiresPair?: boolean;
}[] = [
  { 
    id: 1, 
    title: 'Limpeza do banheiro esquerdo' as TaskTitle,
    recurrence: 'weekly' as const,
    area: 'Banheiro',
    order: 1
  },
  { 
    id: 2, 
    title: 'Limpeza do banheiro direito' as TaskTitle,
    recurrence: 'weekly' as const,
    area: 'Banheiro',
    order: 2
  },
  { 
    id: 3, 
    title: 'Limpeza da sala e cozinha' as TaskTitle,
    recurrence: 'weekly' as const,
    area: 'Sala/Cozinha',
    order: 3,
    requiresPair: true
  },
  { 
    id: 4, 
    title: 'Retirar o Lixo' as TaskTitle,
    recurrence: 'daily' as const,
    area: 'Geral',
    order: 4
  },
  {
    id: 5,
    title: 'Limpeza da Geladeira' as TaskTitle,
    recurrence: 'monthly' as const,
    area: 'Cozinha',
    order: 5
  },
  {
    id: 6,
    title: 'Ida ao mercado' as TaskTitle,
    recurrence: 'weekly' as const,
    area: 'Geral',
    order: 6,
    requiresPair: true
  }
];

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: fixedTasks.map(task => {
        const now = new Date();
        const deadline = calculateNextDeadline(now, task.recurrence);
        
        let assignedTo;
        if (task.requiresPair) {
          // Para tarefas que requerem dupla
          const pairs = task.title in taskOrders ? taskOrders[task.title as TaskTitle] : [];
          const weekNumber = Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
          assignedTo = pairs[weekNumber % pairs.length];
        } else if (task.recurrence === 'daily') {
          // Para tarefas diárias
          const order = task.title in taskOrders ? taskOrders[task.title as TaskTitle] : residents;
          const dayNumber = Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (24 * 60 * 60 * 1000));
          assignedTo = order[dayNumber % order.length];
        } else if (task.recurrence === 'weekly') {
          // Para tarefas semanais
          const order = task.title in taskOrders ? taskOrders[task.title as TaskTitle] : residents;
          const weekNumber = Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
          assignedTo = order[weekNumber % order.length];
        } else {
          // Para tarefas mensais
          const order = taskOrders[task.title as TaskTitle] || residents;
          const monthNumber = differenceInMonths(now, new Date('2024-01-01'));
          assignedTo = order[monthNumber % order.length];
        }

        return {
          ...task,
          assignedTo,
          completed: false,
          createdAt: now.toISOString(),
          deadline: deadline.toISOString(),
          wasLate: false
        };
      }),

      updateTasks: (tasks) => {
        set({ tasks });
      },

      toggleTask: (taskId: number) => {
        const { tasks } = get();
        const now = new Date();
        
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            const isCompleting = !task.completed;
            if (isCompleting) {
              // Quando completar a tarefa
              const currentDeadline = new Date(task.deadline);
              const wasLate = now > currentDeadline;
              
              // Se foi completada com atraso, próximo prazo é calculado a partir da conclusão
              const baseDate = wasLate ? now : currentDeadline;
              const nextDeadline = calculateNextDeadline(baseDate, task.recurrence);

              // Determina próximo responsável
              let nextAssignedTo;
              if (task.requiresPair) {
                const pairs = taskOrders[task.title] || [];
                const currentIndex = pairs.findIndex(pair => 
                  Array.isArray(task.assignedTo) && 
                  pair[0].toLowerCase() === task.assignedTo[0].toLowerCase() && 
                  pair[1].toLowerCase() === task.assignedTo[1].toLowerCase()
                );
                nextAssignedTo = pairs[(currentIndex + 1) % pairs.length];
              } else {
                const order = taskOrders[task.title] || residents;
                const currentIndex = order.findIndex(
                  resident => {
                    if (Array.isArray(resident)) {
                      return resident[0].toLowerCase() === (
                        Array.isArray(task.assignedTo) 
                          ? task.assignedTo[0].toLowerCase() 
                          : task.assignedTo.toLowerCase()
                      );
                    } else {
                      return resident.toLowerCase() === (
                        Array.isArray(task.assignedTo) 
                          ? task.assignedTo[0].toLowerCase() 
                          : task.assignedTo.toLowerCase()
                      );
                    }
                  }
                );
                nextAssignedTo = order[(currentIndex + 1) % order.length];
              }

              // Cria próxima tarefa
              const nextTask: Task = {
                ...task,
                assignedTo: nextAssignedTo,
                completed: false,
                createdAt: now.toISOString(),
                deadline: nextDeadline.toISOString(),
                completedAt: undefined,
                wasLate: false
              };

              // Atualiza tarefa atual
              return {
                ...task,
                completed: true,
                completedAt: now.toISOString(),
                wasLate
              };
            }
            
            // Se está desmarcando a tarefa
            return {
              ...task,
              completed: false,
              completedAt: undefined,
              wasLate: undefined
            };
          }
          return task;
        });

        set({ tasks: updatedTasks });
      },

      isTaskOverdue: (task: Task) => {
        if (task.completed || !task.deadline) return false;
        const deadline = new Date(task.deadline);
        return !isNaN(deadline.getTime()) && new Date() > deadline;
      },

      getTaskDeadline: (task: Task) => {
        if (!task.deadline) return new Date();
        const deadline = new Date(task.deadline);
        return isNaN(deadline.getTime()) ? new Date() : deadline;
      },

      getDailyTaskResident: () => {
        const now = new Date();
        const daysSinceStart = Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (24 * 60 * 60 * 1000));
        return residents[daysSinceStart % residents.length];
      },

      residents,
      taskOrders
    }),
    {
      name: 'tasks-storage'
    }
  )
)
