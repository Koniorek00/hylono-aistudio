'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Wrench } from 'lucide-react';
import { ClientCheckInFormState, MaintenanceLogEntry } from './types';

export type ModalMode = 'client_checkin' | 'maintenance_log';

export interface ServiceOpsFormModalProps {
  isOpen: boolean;
  mode: ModalMode;
  onClose: () => void;
  onSubmitCheckIn?: (data: ClientCheckInFormState) => void;
  onSubmitMaintenance?: (data: Omit<MaintenanceLogEntry, 'id' | 'timestamp'>) => void;
  availableChambers?: Array<{ id: string; name: string; maxPressureAta: number }>;
}

export const ServiceOpsFormModal: React.FC<ServiceOpsFormModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmitCheckIn,
  onSubmitMaintenance,
  availableChambers = [
    { id: 'ch-01', name: 'Hylono HBOT Alpha (Mono-Place 2.0 ATA)', maxPressureAta: 2.0 },
    { id: 'ch-02', name: 'Hylono HBOT Beta (Multi-Place 1.5 ATA)', maxPressureAta: 1.5 },
    { id: 'ch-03', name: 'Hylono H2 Molecular Hydrogen Station', maxPressureAta: 1.0 },
  ],
}) => {
  // ESC key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Client check-in state
  const [checkInState, setCheckInState] = useState<ClientCheckInFormState>({
    clientName: '',
    chamberId: availableChambers[0]?.id || '',
    targetPressure: 1.5,
    sessionDuration: 60,
    oxygenProtocol: '99.95% Medical Oxygen (Mask)',
    notes: '',
    vitals: {
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      heartRate: 72,
      spO2: 98,
      bloodGlucose: undefined,
      earEqualizationOk: true,
    },
  });

  // Maintenance state
  const [maintenanceState, setMaintenanceState] = useState<{
    technician: string;
    chamberId: string;
    type: MaintenanceLogEntry['type'];
    status: MaintenanceLogEntry['status'];
    notes: string;
    nextDueDate: string;
  }>({
    technician: '',
    chamberId: availableChambers[0]?.id || '',
    type: 'filter_swap',
    status: 'passed',
    notes: '',
    nextDueDate: '2026-11-30',
  });

  const [honeypot, setHoneypot] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Anti-spam rejection

    if (!checkInState.clientName.trim()) {
      setErrorMessage('Client name is required.');
      return;
    }

    if (
      checkInState.vitals.bloodPressureSys < 80 ||
      checkInState.vitals.bloodPressureSys > 200 ||
      checkInState.vitals.bloodPressureDia < 50 ||
      checkInState.vitals.bloodPressureDia > 120
    ) {
      setErrorMessage('Blood pressure vitals outside safe clinical threshold for hyperbaric exposure.');
      return;
    }

    if (checkInState.vitals.spO2 < 90) {
      setErrorMessage('SpO2 below 90% requires clinical clearance before chamber pressurization.');
      return;
    }

    if (!checkInState.vitals.earEqualizationOk) {
      setErrorMessage('Ear equalization clearance is mandatory before pressure session.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage('Client intake verified & session staged successfully.');
    onSubmitCheckIn?.(checkInState);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Anti-spam rejection

    if (!maintenanceState.technician.trim()) {
      setErrorMessage('Certified technician name is required.');
      return;
    }

    if (maintenanceState.notes.trim().length < 10) {
      setErrorMessage('Maintenance inspection details must be at least 10 characters.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage('Maintenance inspection logged to compliant audit register.');
    onSubmitMaintenance?.(maintenanceState);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 text-[#0f172a] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            {mode === 'client_checkin' ? (
              <Activity className="text-cyan-600" size={20} />
            ) : (
              <Wrench className="text-amber-600" size={20} />
            )}
            <h2 id="service-modal-title" className="text-lg font-bold text-[#0f172a] font-display">
              {mode === 'client_checkin' ? 'Clinical Client Check-In' : 'Preventative Maintenance Log'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] hover:bg-[#ffffff] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
          >
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
          >
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Honeypot field (hidden from legitimate users) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="companyWebsiteAddress">Website</label>
          <input
            id="companyWebsiteAddress"
            type="text"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Form Body */}
        {mode === 'client_checkin' ? (
          <form noValidate onSubmit={handleCheckInSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="client-name" className="block text-xs font-semibold text-[#334155]">
                Client Full Name *
              </label>
              <input
                id="client-name"
                type="text"
                required
                value={checkInState.clientName}
                onChange={(e) =>
                  setCheckInState((prev) => ({ ...prev, clientName: e.target.value }))
                }
                placeholder="e.g. Elena Rostova"
                className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="chamber-select" className="block text-xs font-semibold text-[#334155]">
                  Assigned Chamber *
                </label>
                <select
                  id="chamber-select"
                  value={checkInState.chamberId}
                  onChange={(e) =>
                    setCheckInState((prev) => ({ ...prev, chamberId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] focus:border-cyan-500 focus:outline-hidden"
                >
                  {availableChambers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="target-ata" className="block text-xs font-semibold text-[#334155]">
                  Target Pressure (ATA) *
                </label>
                <select
                  id="target-ata"
                  value={checkInState.targetPressure}
                  onChange={(e) =>
                    setCheckInState((prev) => ({
                      ...prev,
                      targetPressure: parseFloat(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value={1.3}>1.3 ATA (Mild Recovery)</option>
                  <option value={1.5}>1.5 ATA (Optimal Regeneration)</option>
                  <option value={1.75}>1.75 ATA (Deep Recovery)</option>
                  <option value={2.0}>2.0 ATA (Clinical Maximum)</option>
                </select>
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-600" />
                Pre-Session Clinical Vitals Verification
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="bp-sys" className="block text-[11px] font-medium text-[#64748b]">
                    BP Sys (mmHg)
                  </label>
                  <input
                    id="bp-sys"
                    type="number"
                    min={70}
                    max={220}
                    value={checkInState.vitals.bloodPressureSys}
                    onChange={(e) =>
                      setCheckInState((prev) => ({
                        ...prev,
                        vitals: {
                          ...prev.vitals,
                          bloodPressureSys: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded border border-[#cbd5e1] bg-[#ffffff] px-2 py-1 text-xs text-[#0f172a]"
                  />
                </div>

                <div>
                  <label htmlFor="bp-dia" className="block text-[11px] font-medium text-[#64748b]">
                    BP Dia (mmHg)
                  </label>
                  <input
                    id="bp-dia"
                    type="number"
                    min={40}
                    max={140}
                    value={checkInState.vitals.bloodPressureDia}
                    onChange={(e) =>
                      setCheckInState((prev) => ({
                        ...prev,
                        vitals: {
                          ...prev.vitals,
                          bloodPressureDia: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded border border-[#cbd5e1] bg-[#ffffff] px-2 py-1 text-xs text-[#0f172a]"
                  />
                </div>

                <div>
                  <label htmlFor="spo2" className="block text-[11px] font-medium text-[#64748b]">
                    SpO2 (%)
                  </label>
                  <input
                    id="spo2"
                    type="number"
                    min={80}
                    max={100}
                    value={checkInState.vitals.spO2}
                    onChange={(e) =>
                      setCheckInState((prev) => ({
                        ...prev,
                        vitals: {
                          ...prev.vitals,
                          spO2: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded border border-[#cbd5e1] bg-[#ffffff] px-2 py-1 text-xs text-[#0f172a]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="ear-ok"
                  type="checkbox"
                  checked={checkInState.vitals.earEqualizationOk}
                  onChange={(e) =>
                    setCheckInState((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, earEqualizationOk: e.target.checked },
                    }))
                  }
                  className="rounded border-[#cbd5e1] text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="ear-ok" className="text-xs text-[#334155]">
                  Client completed and verified Valsalva / ear equalization clearance.
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-cyan-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-800 transition-colors"
              >
                Confirm & Stage Session
              </button>
            </div>
          </form>
        ) : (
          <form noValidate onSubmit={handleMaintenanceSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="tech-name" className="block text-xs font-semibold text-[#334155]">
                Certified Technician Name *
              </label>
              <input
                id="tech-name"
                type="text"
                required
                value={maintenanceState.technician}
                onChange={(e) =>
                  setMaintenanceState((prev) => ({ ...prev, technician: e.target.value }))
                }
                placeholder="e.g. Marc Dubois (MDR Lead)"
                className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="maint-chamber" className="block text-xs font-semibold text-[#334155]">
                  Chamber Unit *
                </label>
                <select
                  id="maint-chamber"
                  value={maintenanceState.chamberId}
                  onChange={(e) =>
                    setMaintenanceState((prev) => ({ ...prev, chamberId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] focus:border-amber-500 focus:outline-hidden"
                >
                  {availableChambers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maint-type" className="block text-xs font-semibold text-[#334155]">
                  Inspection Scope *
                </label>
                <select
                  id="maint-type"
                  value={maintenanceState.type}
                  onChange={(e) =>
                    setMaintenanceState((prev) => ({
                      ...prev,
                      type: e.target.value as MaintenanceLogEntry['type'],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="filter_swap">Filter Replacement (HEPA / Intake)</option>
                  <option value="seal_inspection">Chamber Door Seal Integrity</option>
                  <option value="compressor_service">Oil-free Compressor Inspection</option>
                  <option value="safety_valve_test">Dual Mechanical Relief Valve Check</option>
                  <option value="o2_sensor_cal">O2 Sensor Galvanic Calibration</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="maint-notes" className="block text-xs font-semibold text-[#334155]">
                Inspection Notes & Serial Numbers *
              </label>
              <textarea
                id="maint-notes"
                rows={3}
                required
                value={maintenanceState.notes}
                onChange={(e) =>
                  setMaintenanceState((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Document component serial number, pressure decay test results, and compliance proof..."
                className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="maint-status" className="block text-xs font-semibold text-[#334155]">
                  Verification Outcome *
                </label>
                <select
                  id="maint-status"
                  value={maintenanceState.status}
                  onChange={(e) =>
                    setMaintenanceState((prev) => ({
                      ...prev,
                      status: e.target.value as MaintenanceLogEntry['status'],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="passed">Passed (Fully Certified)</option>
                  <option value="warning">Warning (Follow-up Required)</option>
                  <option value="failed">Failed (Unit Taken Offline)</option>
                </select>
              </div>

              <div>
                <label htmlFor="next-due" className="block text-xs font-semibold text-[#334155]">
                  Next Due Date *
                </label>
                <input
                  id="next-due"
                  type="date"
                  required
                  value={maintenanceState.nextDueDate}
                  onChange={(e) =>
                    setMaintenanceState((prev) => ({ ...prev, nextDueDate: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] focus:border-amber-500 focus:outline-hidden"
                >
                </input>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 transition-colors"
              >
                Record Inspection to Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
