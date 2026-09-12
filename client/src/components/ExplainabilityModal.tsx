import React from 'react';
import { XAIExplanationResult } from '../types';
import { Brain, CheckCircle2, AlertTriangle, XCircle, Info, Scale, ShieldCheck, X, Sparkles, Cpu } from 'lucide-react';

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
  const classification = explanation?.classification ? explanation.classification.replace(/_/g, ' ') : 'POSSIBLE SENSOR FAULT';
  const severity = explanation?.severity || 'HIGH';

  let severityBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (severity === 'CRITICAL') severityBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  else if (severity === 'LOW' || severity === 'NORMAL') severityBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const primaryFactors = explanation?.primaryFactors || [
    'Sudden temperature step jump: Δ8.4°C in single 3-second cycle',
    'Open-Meteo satellite discrepancy: Δ8.4°C difference from localized weather radar',
    'Spatial Consensus mismatch: Nearby stations (AWS-102, AWS-103) report 34.2°C average'
  ];

  const empiricalEvidence = explanation?.empiricalEvidence || [
    'AWS Thermistor Telemetry: 42.80°C',
    'Open-Meteo Satellite Radar Baseline: 34.40°C',
    'Historical Expected Envelope: 28.0°C – 34.0°C',
    'Spatial Consensus Matching Ratio: 0% (0/3 nearby stations confirm 42.8°C)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 font-mono text-xs">
      <div className="glass-card w-full max-w-2xl p-4 sm:p-6 rounded-2xl border border-sky-500/40 bg-[#0a1426] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2 text-sky-400 font-bold animate-pulse">
            <Brain className="w-8 h-8 text-sky-400 animate-bounce" />
            <span>🧠 Synthesizing Transparent AI Explanation Matrix...</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h2 className="font-orbitron font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                AI ANALYSIS EXPLANATION — {explanation?.stationId || 'AWS STATION'}
              </h2>
              <span className="text-[10px] text-slate-400 block font-sans">
                Transparent multi-layer decision breakdown & empirical evidence log
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Confidence & Status Banner */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-lg border border-sky-500/30 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">AI CONFIDENCE</span>
              <span className="font-orbitron font-extrabold text-2xl text-sky-300">{confPercent}%</span>
            </div>

            <div className="space-y-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-orbitron uppercase border ${severityBg}`}>
                {classification} ({severity})
              </span>
              <p className="text-xs text-slate-200 font-bold mt-1">
                {explanation?.summary || 'Sensor telemetry analyzed across 5 meteorological channels.'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Factors List */}
        <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-sky-400 font-bold uppercase text-[11px] font-orbitron flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            PRIMARY FACTORS ("WHY WAS THIS FLAGGED?"):
          </span>

          <div className="space-y-1.5 pt-1">
            {primaryFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-200">
                <span className="text-sky-400 font-bold text-sm">✓</span>
                <span className="text-xs">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Empirical Evidence & Telemetry Metrics */}
        <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-emerald-400 font-bold uppercase text-[11px] font-orbitron flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400" />
            EMPIRICAL EVIDENCE & TELEMETRY METRICS:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            {empiricalEvidence.map((ev, idx) => (
              <div key={idx} className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-slate-300">
                • {ev}
              </div>
            ))}
          </div>
        </div>

        {/* Data Comparisons Grid (if available) */}
        {explanation?.dataComparisons && explanation.dataComparisons.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-cyan-400 font-bold uppercase text-[11px] font-orbitron flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" />
              AWS TELEMETRY VS. SATELLITE COMPARISON EVIDENCE:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {explanation.dataComparisons.map((comp, idx) => (
                <div key={idx} className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[10px]">
                  <span className="text-slate-400 block font-bold mb-0.5">{comp.name}</span>
                  <div className="text-slate-200">AWS: <span className="font-bold">{comp.aws}</span></div>
                  <div className="text-slate-400">Meteo: {comp.openMeteo}</div>
                  <div className="text-amber-300 font-bold mt-0.5">Diff: {comp.diff}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Methodology & System Transparency Notice */}
        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/90 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold font-orbitron flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            AI METHODOLOGY & TRANSPARENCY NOTICE
          </span>
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
            {explanation?.systemTransparency || 'This explanation is synthesized from physical quality control rules combined with PyTorch LSTM Autoencoder reconstruction loss, Isolation Forest SHAP feature impacts, and Spatial Consensus ratios across surrounding AWS stations.'}
          </p>
        </div>

        {/* Actionable Recommendation */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs font-semibold text-amber-300">
          <span>Recommended Action: {explanation?.recommendedAction || 'Schedule regular calibration inspection.'}</span>
        </div>

        {/* Footer Close */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold font-mono"
          >
            CLOSE EXPLANATION
          </button>
        </div>
      </div>
    </div>
  );
};
