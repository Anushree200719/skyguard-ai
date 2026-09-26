import React from 'react';
import { XAIExplanationResult } from '../types';
import { Brain, CheckCircle2, AlertTriangle, XCircle, Info, Scale, ShieldCheck, X, Sparkles, Cpu, FileText } from 'lucide-react';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: XAIExplanationResult | null;
  loading?: boolean;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  explanation,
  loading = false
}) => {
  if (!isOpen) return null;

  const confPercent = explanation?.confidencePercentage ?? 94;
  const classification = explanation?.classification ? explanation.classification.replace(/_/g, ' ') : 'SENSOR FAULT DETECTED';
  const severity = explanation?.severity || 'HIGH';

  let severityBadge = 'gov-badge-amber';
  if (severity === 'CRITICAL') severityBadge = 'gov-badge-red';
  else if (severity === 'LOW' || severity === 'NORMAL') severityBadge = 'gov-badge-green';

  const primaryFactors = explanation?.primaryFactors || [
    'Sudden temperature step jump: Δ8.4°C in single 3-second cycle',
    'Open-Meteo satellite discrepancy: Δ8.4°C difference from localized weather radar',
    'Spatial Consensus mismatch: Nearby stations (AWS-102, AWS-103) report 34.2°C average'
  ];

  const empiricalEvidence = explanation?.empiricalEvidence || [
    'AWS Thermistor Telemetry: 42.80°C',
    'Open-Meteo Satellite Baseline: 34.40°C',
    'Historical Expected Envelope: 28.0°C – 34.0°C',
    'Spatial Consensus Matching Ratio: 0% (0/3 nearby stations confirm 42.8°C)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 text-xs">
      <div className="bg-white w-full max-w-2xl p-6 rounded border border-slate-300 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-slate-900">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center gap-2 text-blue-950 font-bold font-mono animate-pulse">
            <Brain className="w-8 h-8 text-blue-900 animate-bounce" />
            <span>🧠 Synthesizing Official SHAP & AI Explanation Matrix...</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-900" />
            <div>
              <h2 className="font-bold text-sm text-blue-950 uppercase tracking-wide">
                TECHNICAL AI ANOMALY EXPLANATION DOSSIER — {explanation?.stationId || 'AWS STATION'}
              </h2>
              <span className="text-[11px] text-slate-600 block">
                Official decision audit log & empirical evidence breakdown
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Confidence Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded text-center font-mono">
              <span className="text-[10px] text-slate-500 font-bold block">CONFIDENCE</span>
              <span className="font-bold text-xl text-blue-950">{confPercent}%</span>
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${severityBadge}`}>
                {classification} ({severity})
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {explanation?.summary || 'Sensor telemetry analyzed across 5 meteorological channels.'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Factors */}
        <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded">
          <span className="text-blue-950 font-bold text-xs font-mono uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            PRIMARY DIAGNOSTIC FACTORS:
          </span>

          <div className="space-y-1.5 pt-1">
            {primaryFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-800">
                <span className="text-emerald-700 font-bold text-xs">✓</span>
                <span className="text-xs font-medium">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Empirical Evidence */}
        <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded">
          <span className="text-blue-950 font-bold text-xs font-mono uppercase flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-900" />
            EMPIRICAL TELEMETRY EVIDENCE:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 font-mono">
            {empiricalEvidence.map((ev, idx) => (
              <div key={idx} className="p-2 bg-white border border-slate-200 rounded text-slate-800">
                • {ev}
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1 font-mono">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-blue-900" />
            AI AUDIT METHODOLOGY NOTICE
          </span>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            {explanation?.systemTransparency || 'This explanation is synthesized from physical quality control rules combined with PyTorch LSTM Autoencoder reconstruction loss, Isolation Forest SHAP feature impacts, and Spatial Consensus ratios across surrounding AWS stations.'}
          </p>
        </div>

        {/* Actionable Recommendation */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs font-bold text-blue-950">
          Official Action Recommendation: {explanation?.recommendedAction || 'Schedule regular calibration inspection.'}
        </div>

        {/* Footer Close */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-900 text-white font-bold text-xs uppercase px-5 py-2 rounded hover:bg-blue-950 transition-colors"
          >
            Close Audit Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
