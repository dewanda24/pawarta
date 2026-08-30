'use client';

import {
  FileEdit,
  SearchCheck,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface LetterWorkflowStepperProps {
  status: string;
  statusDetail?: string | null;
  nomorSurat?: string | null;
  pembuatNama?: string | null;
  penandatanganNama?: string | null;
}

type StepState = 'completed' | 'current' | 'upcoming' | 'rejected';

export function LetterWorkflowStepper({
  status,
  statusDetail,
  nomorSurat,
  pembuatNama,
  penandatanganNama,
}: LetterWorkflowStepperProps) {
  const normalizedStatus = (status || 'DRAFT').toUpperCase();
  const isRevision = normalizedStatus === 'REVISI';

  // Tentukan step aktif (0-indexed: 0 = Draft, 1 = Review, 2 = Approval/TTE, 3 = Terbit)
  let currentStepIndex = 0;
  if (['DIAJUKAN', 'DIPERIKSA'].includes(normalizedStatus)) {
    currentStepIndex = 1;
  } else if (['APPROVED', 'SIGNED'].includes(normalizedStatus)) {
    currentStepIndex = 2;
  } else if (['PUBLISHED', 'ARCHIVED'].includes(normalizedStatus)) {
    currentStepIndex = 3;
  }

  const steps = [
    {
      id: 'draft',
      label: 'Konsep / Draft',
      desc: pembuatNama ? `Oleh ${pembuatNama}` : 'Penyusunan naskah',
      icon: FileEdit,
    },
    {
      id: 'review',
      label: 'Verifikasi & Review',
      desc: 'Pemeriksaan redaksi dinas',
      icon: SearchCheck,
    },
    {
      id: 'approval',
      label: 'Persetujuan & TTE',
      desc: penandatanganNama ? `Oleh ${penandatanganNama}` : 'Validasi Kepala Sekolah',
      icon: PenTool,
    },
    {
      id: 'published',
      label: 'Terbit & Distribusi',
      desc: nomorSurat ? `No: ${nomorSurat}` : 'Penomoran naskah resmi',
      icon: CheckCircle2,
    },
  ];

  const getStepState = (index: number): StepState => {
    if (isRevision && index === 1) return 'rejected';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
              Alur Perjalanan Naskah Dinas
            </h3>
            <p className="text-[11px] text-gray-500">
              Pantau status persetujuan, penandatanganan, dan penerbitan naskah secara real-time.
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs ${
              normalizedStatus === 'PUBLISHED' || normalizedStatus === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : normalizedStatus === 'REVISI'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : normalizedStatus === 'DIAJUKAN' || normalizedStatus === 'DIPERIKSA'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            Status: {normalizedStatus}
          </span>
        </div>
      </div>

      {/* Revision Alert if any */}
      {isRevision && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Naskah Memerlukan Revisi</p>
            <p className="text-amber-800 text-[11px] mt-0.5">
              {statusDetail || 'Perbaiki redaksi atau format naskah sesuai catatan atasan sebelum diajukan kembali.'}
            </p>
          </div>
        </div>
      )}

      {/* Visual Stepper Steps Bar */}
      <div className="relative pt-2 pb-1">
        {/* Step Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${(Math.min(currentStepIndex, 3) / 3) * 100}%`,
            }}
          />
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative z-10">
          {steps.map((step, idx) => {
            const state = getStepState(idx);
            const StepIcon = step.icon;

            let badgeStyles = 'bg-gray-100 text-gray-400 border-gray-200';
            let cardStyles = 'border-gray-200/80 bg-gray-50/50';

            if (state === 'completed') {
              badgeStyles = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
              cardStyles = 'border-emerald-200 bg-emerald-50/30';
            } else if (state === 'current') {
              badgeStyles = 'bg-blue-600 text-white border-blue-600 shadow-md ring-4 ring-blue-100';
              cardStyles = 'border-blue-300 bg-blue-50/40 shadow-xs';
            } else if (state === 'rejected') {
              badgeStyles = 'bg-amber-600 text-white border-amber-600 ring-4 ring-amber-100';
              cardStyles = 'border-amber-300 bg-amber-50/50';
            }

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${cardStyles}`}
              >
                {/* Step Circle Icon */}
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform ${badgeStyles}`}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : state === 'rejected' ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">0{idx + 1}</span>
                    <p
                      className={`text-xs font-bold truncate ${
                        state === 'current'
                          ? 'text-blue-700'
                          : state === 'completed'
                          ? 'text-emerald-900'
                          : 'text-gray-700'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
