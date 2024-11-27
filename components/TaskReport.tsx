import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import { Task } from '@/lib/tasks-store';

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  taskGroup: {
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#2c5282',
  },
  taskInfo: {
    fontSize: 12,
    marginBottom: 3,
    color: '#4a5568',
  },
  date: {
    fontSize: 10,
    color: '#718096',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#718096',
    fontSize: 10,
  },
});

interface TaskReportProps {
  tasks: Task[];
}

const TaskReport: React.FC<TaskReportProps> = ({ tasks }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Relatório de Tarefas de Limpeza</Text>
      
      <View style={styles.section}>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskGroup}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskInfo}>
              Responsável: {task.assignedTo}
            </Text>
            <Text style={styles.taskInfo}>
              Status: {task.completed ? 'Concluída' : 'Pendente'}
            </Text>
            <Text style={styles.taskInfo}>
              Tipo: {task.recurrence === 'daily' ? 'Diária' : 'Semanal'}
            </Text>
            <Text style={styles.date}>
              Criada em: {format(parseISO(task.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
            {task.completedAt && (
              <Text style={styles.date}>
                Concluída em: {format(parseISO(task.completedAt), 'dd/MM/yyyy HH:mm')}
              </Text>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}
      </Text>
    </Page>
  </Document>
);

export default TaskReport;
