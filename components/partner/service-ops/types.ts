import React from 'react';

export interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'clinical' | 'maintenance' | 'client' | 'emergency';
  badge?: string;
  onClick: () => void;
}

export interface ClientCheckInFormState {
  clientName: string;
  chamberId: string;
  targetPressure: number;
  sessionDuration: number;
  oxygenProtocol: string;
  notes: string;
  vitals: {
    bloodPressureSys: number;
    bloodPressureDia: number;
    heartRate: number;
    spO2: number;
    bloodGlucose?: number;
    earEqualizationOk: boolean;
  };
}

export interface MaintenanceLogEntry {
  id: string;
  timestamp: string;
  technician: string;
  chamberId: string;
  type: 'filter_swap' | 'seal_inspection' | 'compressor_service' | 'safety_valve_test' | 'o2_sensor_cal';
  status: 'passed' | 'warning' | 'failed';
  notes: string;
  nextDueDate: string;
}

export interface ServiceOperationsTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
