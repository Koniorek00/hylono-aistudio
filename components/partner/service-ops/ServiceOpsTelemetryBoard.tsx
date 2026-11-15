'use client';

import React, { useState } from 'react';
import {
  Activity,
  Gauge,
  Wind,
  Thermometer,
  Droplets,
  AlertOctagon,
  CheckCircle,
  ShieldAlert,
  Bell,
  Check,
} from 'lucide-react';
import { TelemetryAlert, OperationMetric } from './opsData';

export interface ServiceOpsTelemetryBoardProps {
  metrics?: OperationMetric[];
  alerts?: TelemetryAlert[];
  chamberPressureAta?: number;
  oxygenPurityPercent?: number;
  cabinTemperatureCelsius?: number;
  relativeHumidityPercent?: number;
  co2Ppm?: number;
  activeSessionDurationMinutes?: number;
  isSessionActive?: boolean;
  onAcknowledgeAlert?: (alertId: string) => void;
  onTriggerSafetyPurgeTest?: () => void;
  className?: string;
}

const DEFAULT_METRICS: OperationMetric[] = [
  { id: 'press', label: 'Vessel Pressure', value: '1.50 ATA', trend: 'neutral', status: 'optimal' },
  { id: 'o2', label: 'O2 Purity (Gas Cell)', value: '99.7%', trend: 'up', status: 'optimal' },
  { id: 'temp', label: 'Cabin Ambient', value: '21.8 °C', trend: 'neutral', status: 'optimal' },
  { id: 'co2', label: 'Scrubber CO2 Level', value: '380 ppm', trend: 'down', status: 'optimal' },
];

const DEFAULT_ALERTS: TelemetryAlert[] = [
  {
    id: 'alt-01',
    timestamp: '17:42:10',
    deviceId: 'ch-01',
    deviceName: 'Hylono HBOT Alpha (Mono-Place 2.0 ATA)',
    severity: 'warning',
    message: 'Intake HEPA filter delta-P exceeds 120 Pa during compression ramp',
    metric: 'Delta-P Intake',
    currentValue: 125,
    threshold: 110,
    acknowledged: false,
  },
  {
    id: 'alt-02',
    timestamp: '16:15:00',
    deviceId: 'ch-03',
    deviceName: 'Hylono H2 Molecular Station',
    severity: 'info',
    message: 'Deionized water resistivity optimal (18.2 MΩ·cm at 25°C)',
    metric: 'Resistivity',
    currentValue: 18.2,
    threshold: 15.0,
    acknowledged: true,
  },
];

export const ServiceOpsTelemetryBoard: React.FC<ServiceOpsTelemetryBoardProps> = ({
  metrics = DEFAULT_METRICS,
  alerts = DEFAULT_ALERTS,
  chamberPressureAta = 1.5,
  oxygenPurityPercent = 99.7,
  cabinTemperatureCelsius = 21.8,
  relativeHumidityPercent = 48,
  co2Ppm = 380,
  activeSessionDurationMinutes = 45,
  isSessionActive = true,
  onAcknowledgeAlert,
  onTriggerSafetyPurgeTest,
  className = '',
}) => {
  const [localAlerts, setLocalAlerts] = useState<TelemetryAlert[]>(alerts);
  const [testTriggered, setTestTriggered] = useState(false);

  const handleAcknowledge = (id: string) => {
    setLocalAlerts((prev) =>
      prev.map((alt) => (alt.id === id ? { ...alt, acknowledged: true } : alt))
    );
    onAcknowledgeAlert?.(id);
  };

  const handlePurgeTest = () => {
    setTestTriggered(true);
    onTriggerSafetyPurgeTest?.();
    setTimeout(() => setTestTriggered(false), 4000);
  };

  const activeAlerts = localAlerts.filter((a) => !a.acknowledged);

  return (
    <section
      aria-label="Clinical telemetry & pressure vessel monitoring"
      className={`rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 text-[#0f172a] shadow-xs ${className}`}
    >
      {/* Title & Live Status Indicator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e2e8f0] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[9999px] border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Live Chamber Sensor Bus · CANopen / Modbus TCP
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
            Real-Time Clinical Telemetry & Safety Telemetry
          </h2>
          <p className="mt-1 text-sm text-[#475569]">
            Continuous multi-gas monitoring, pneumatic pressure transducer readings, and automated safety triggers.
          </p>
        </div>

        {/* Emergency Safety Purge Valve Test Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Trigger emergency depressurization safety check"
            onClick={handlePurgeTest}
            className={`inline-flex items-center gap-2 rounded-[12px] border px-4 py-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 ${
              testTriggered
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            {testTriggered ? 'Safety Vent Test Verified ✓' : 'Test Safety Purge Valve'}
          </button>
        </div>
      </div>

      {/* Main Telemetry Gauges Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pressure Gauge */}
        <div className="rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Vessel Pressure
            </span>
            <Gauge className="h-5 w-5 text-cyan-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#0f172a]">
            {chamberPressureAta.toFixed(2)}{' '}
            <span className="text-sm font-semibold text-[#64748b]">ATA</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
            <span>Target: 2.00 ATA</span>
            <span className="text-emerald-700 font-semibold">Pressurized</span>
          </div>
        </div>

        {/* Oxygen Purity */}
        <div className="rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Medical O2 Purity
            </span>
            <Wind className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#0f172a]">
            {oxygenPurityPercent.toFixed(1)}
            <span className="text-sm font-semibold text-[#64748b]">%</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
            <span>Spec: ≥ 99.5%</span>
            <span className="text-emerald-700 font-semibold">Pharmacopeia Grade</span>
          </div>
        </div>

        {/* Temperature & Humidity */}
        <div className="rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Cabin Climate
            </span>
            <Thermometer className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#0f172a]">
            {cabinTemperatureCelsius.toFixed(1)}
            <span className="text-sm font-semibold text-[#64748b]">°C</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-cyan-600" />
              {relativeHumidityPercent}% RH
            </span>
            <span className="text-slate-600">Patient Comfort</span>
          </div>
        </div>

        {/* Active Session Timer */}
        <div className="rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Session Protocol
            </span>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#0f172a]">
            {activeSessionDurationMinutes}
            <span className="text-sm font-semibold text-[#64748b]"> min</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
            <span>Isocapnic Plateau</span>
            <span className={isSessionActive ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {isSessionActive ? 'Active Cycle' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Alerts Panel */}
      <div className="mt-6 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-5">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-700" />
            <h3 className="text-sm font-bold text-[#0f172a]">
              Active Diagnostic Warnings & Sensor Telemetry Alerts
            </h3>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
              {activeAlerts.length} Active
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {localAlerts.length === 0 ? (
            <p className="text-xs text-[#64748b] py-2">No active alerts recorded.</p>
          ) : (
            localAlerts.map((alert) => (
              <div
                key={alert.id}
                role="status"
                aria-label={`Alert: ${alert.message}`}
                className={`flex flex-col gap-2 rounded-[12px] border p-3.5 sm:flex-row sm:items-center sm:justify-between transition ${
                  alert.acknowledged
                    ? 'border-[#e2e8f0] bg-[#ffffff] opacity-75'
                    : alert.severity === 'critical'
                      ? 'border-rose-300 bg-rose-50'
                      : alert.severity === 'warning'
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.severity === 'critical' ? (
                    <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  ) : alert.severity === 'warning' ? (
                    <AlertOctagon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#0f172a]">
                        {alert.deviceName}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {alert.timestamp}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        [{alert.metric}: {alert.currentValue} / max {alert.threshold}]
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#334155] leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  {alert.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      <Check className="h-3 w-3" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Acknowledge alert ${alert.id}`}
                      onClick={() => handleAcknowledge(alert.id)}
                      className="inline-flex items-center gap-1 rounded-[8px] border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-600"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceOpsTelemetryBoard;
