export interface OperationMetric {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'optimal' | 'warning' | 'critical';
}

export interface MaintenanceScheduleItem {
  id: string;
  chamberId: string;
  chamberName: string;
  task: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technician?: string;
}

export interface TelemetryAlert {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  acknowledged: boolean;
}
