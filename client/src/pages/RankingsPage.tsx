import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStationRankings } from '../services/api';
import { StationRankingsResult, StationRankingItem } from '../types';
import { Trophy, TrendingUp, TrendingDown, Minus, ShieldAlert, RadioTower, Filter, ArrowUpDown, RefreshCw, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const RankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [rankingsData, setRankingsData] = useState<StationRankingsResult | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRankings = async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStationRankings(refresh);
      if (data) {
        setRankingsData(data);
      }
    } catch (e: any) {
      console.warn('Station rankings fetch note:', e);
      setError('Unable to fetch live rankings. Falling back to telemetry store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

  const handleStationClick = (stationId: string) => {
    navigate(`/stations/${stationId}`);
  };

  // Client-side sorting and filtering
  const allList = rankingsData?.allRankings || [];
  const filteredList = allList.filter(item => {
    if (statusFilter && item.status !== statusFilter) return false;
    return true;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.trustScore - a.trustScore;
    } else {
      return a.trustScore - b.trustScore;
    }
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
            AWS STATION RELIABILITY RANKING COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time leaderboard derived strictly from actual Trust Scores, Open-Meteo agreement, & sensor health</p>
        </div>

        <button
          onClick={() => loadRankings(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono transition-all min-h-[40px] touch-manipulation active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH RANKINGS</span>
        </button>
      </div>

      {/* TOP RELIABLE STATIONS PODIUM (🥇 🥈 🥉) */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-[#0c1626]/90 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-orbitron font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wider">
              TOP RELIABLE STATIONS LEADERBOARD
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            HIGHEST TRUST SCORE NODES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(!rankingsData || !rankingsData.topReliable || rankingsData.topReliable.length === 0) ? (
            <div className="col-span-3 text-center text-slate-400 text-xs py-4">
              Evaluating station trust metrics...
            </div>
          ) : (
            rankingsData.topReliable.map((st) => (
              <div
                key={st.stationId}
                onClick={() => handleStationClick(st.stationId)}
                className="glass-card p-4 rounded-xl border border-amber-500/40 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/30 transition-all cursor-pointer space-y-2.5 group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{st.medal || '🥇'}</span>
                    <span className="font-orbitron font-bold text-sm text-amber-300">{st.rankLabel}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    st.trend === 'IMPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    (st.trend === 'DECLINED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300')
                  }`}>
                    {st.trendLabel}
                  </span>
                </div>

                <div>
                  <h3 className="font-orbitron font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                    {st.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block font-bold">{st.stationId} • {st.location}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Trust Score:</span>
                    <span className="font-orbitron font-bold text-amber-400 text-sm">{st.trustScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" style={{ width: `${st.trustScore}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="font-bold text-emerald-400">{st.statusLabel}</span>
                  <span className="text-sky-400 font-bold group-hover:underline flex items-center gap-0.5">
                    VIEW DETAILS <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NEEDS ATTENTION SECTION (If any stations have trust < 75% or status CAUTION/UNRELIABLE/CRITICAL) */}
      {rankingsData && rankingsData.needsAttention && rankingsData.needsAttention.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 space-y-3 font-mono">
          <div className="flex items-center gap-2 border-b border-rose-500/30 pb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            <h2 className="font-orbitron font-bold text-xs text-rose-200 uppercase tracking-wider">
              NEEDS ATTENTION — STATIONS WITH DEGRADED TRUST / FAULTS ({rankingsData.needsAttention.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rankingsData.needsAttention.map((st) => (
              <div
                key={st.stationId}
                onClick={() => handleStationClick(st.stationId)}
                className="p-3 bg-slate-900/80 border border-rose-500/40 rounded-xl hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98]"
              >
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400 font-bold">🔴 {st.rankLabel}</span>
                    <span className="font-bold text-slate-100 text-xs truncate">{st.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{st.stationId} • {st.location}</span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-orbitron font-bold text-rose-400 text-base block">{st.trustScore}%</span>
                  <span className="text-[9px] font-bold text-rose-300 uppercase">{st.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SORT & FILTER CONTROL BAR */}
      <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase font-orbitron">
          <Filter className="w-4 h-4 text-sky-400 flex-shrink-0" /> FILTER & SORT LEADERBOARD
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 min-h-[38px] w-full sm:w-auto">
            <span className="text-slate-400">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-mono focus:outline-none w-full sm:w-44 cursor-pointer font-bold"
            >
              <option value="" className="bg-slate-900 text-slate-100">ALL STATUS CATEGORIES</option>
              <option value="HIGHLY_TRUSTED" className="bg-slate-900 text-slate-100">HIGHLY TRUSTED 🟢</option>
              <option value="TRUSTED" className="bg-slate-900 text-slate-100">TRUSTED 🟢</option>
              <option value="CAUTION" className="bg-slate-900 text-slate-100">CAUTION 🟡</option>
              <option value="UNRELIABLE" className="bg-slate-900 text-slate-100">UNRELIABLE 🟠</option>
              <option value="CRITICAL" className="bg-slate-900 text-slate-100">CRITICAL 🔴</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-all min-h-[38px] w-full sm:w-auto active:scale-[0.98]"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <span>SORT BY TRUST: {sortOrder === 'desc' ? 'HIGHEST FIRST ↓' : 'LOWEST FIRST ↑'}</span>
          </button>
        </div>
      </div>

      {/* COMPLETE ALL-STATION RANKING LEADERBOARD MATRIX */}
      <div className="glass-card rounded-xl border border-sky-500/20 overflow-hidden font-mono">
        <div className="responsive-table-wrapper overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[750px]">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-orbitron text-[11px]">
                <th className="p-3">RANK</th>
                <th className="p-3">TREND</th>
                <th className="p-3">STATION ID</th>
                <th className="p-3">STATION NAME & LOCATION</th>
                <th className="p-3">TRUST SCORE</th>
                <th className="p-3">STATUS CATEGORY</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-mono">
                    No weather stations match selected status filter.
                  </td>
                </tr>
              ) : (
                sortedList.map((st) => (
                  <tr
                    key={st.stationId}
                    onClick={() => handleStationClick(st.stationId)}
                    className="hover:bg-slate-800/50 transition-all cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="p-3 font-orbitron font-bold text-sm text-slate-100">
                      <span className={`px-2 py-0.5 rounded ${
                        st.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        (st.rank === 2 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                        (st.rank === 3 ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30' : 'text-slate-300'))
                      }`}>
                        {st.rankLabel}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        st.trend === 'IMPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        (st.trend === 'DECLINED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300')
                      }`}>
                        {st.trendLabel}
                      </span>
                    </td>

                    {/* Station ID */}
                    <td className="p-3 font-bold text-sky-400">{st.stationId}</td>

                    {/* Name & Location */}
                    <td className="p-3">
                      <div className="font-bold text-slate-200 group-hover:text-sky-300 transition-colors">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.location}</div>
                    </td>

                    {/* Trust Score */}
                    <td className="p-3 min-w-[140px]">
                      <div className="flex items-center justify-between text-xs font-bold font-orbitron mb-1">
                        <span className="text-slate-200">{st.trustScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            st.trustScore >= 90 ? 'bg-emerald-400' :
                            (st.trustScore >= 75 ? 'bg-green-500' :
                            (st.trustScore >= 50 ? 'bg-yellow-400' : 'bg-rose-500'))
                          }`}
                          style={{ width: `${st.trustScore}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Status Category */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.status === 'HIGHLY_TRUSTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        (st.status === 'TRUSTED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        (st.status === 'CAUTION' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        (st.status === 'UNRELIABLE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')))
                      }`}>
                        {st.statusLabel}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        SELECT STATION <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
