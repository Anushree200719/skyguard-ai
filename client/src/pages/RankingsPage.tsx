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
      setError('Unable to fetch live rankings.');
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
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>NATIONAL RELIABILITY INDEX</span>
            <span>•</span>
            <span>STATION LEADERBOARD</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <Trophy className="w-5 h-5 text-blue-900 flex-shrink-0" />
            NATIONAL AWS DATA TRUST & RELIABILITY RANKINGS
          </h1>
          <p className="text-xs text-slate-600">Official ranking derived from WMO rule checks, satellite consensus & sensor health</p>
        </div>

        <button
          onClick={() => loadRankings(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold hover:bg-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH RANKINGS</span>
        </button>
      </div>

      {/* TOP RELIABLE STATIONS PODIUM */}
      <div className="gov-card p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-900" />
            <h2 className="font-bold text-xs text-blue-950 uppercase tracking-wider">
              TOP RELIABLE STATIONS LEADERBOARD
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(!rankingsData || !rankingsData.topReliable || rankingsData.topReliable.length === 0) ? (
            <div className="col-span-3 text-center text-slate-500 text-xs py-4">
              Evaluating station trust metrics...
            </div>
          ) : (
            rankingsData.topReliable.map((st) => (
              <div
                key={st.stationId}
                onClick={() => handleStationClick(st.stationId)}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded hover:border-blue-900 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-950">{st.rankLabel}</span>
                  <span className="gov-badge-green text-[10px] font-bold px-2 py-0.5 rounded border uppercase">
                    {st.statusLabel}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                  <span className="text-[11px] text-slate-600 block">{st.stationId} • {st.location}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Trust Score:</span>
                    <span className="font-bold text-blue-950">{st.trustScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-900 rounded-full" style={{ width: `${st.trustScore}%` }}></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="gov-card p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold uppercase">
          <Filter className="w-4 h-4 text-blue-900" /> FILTER LEADERBOARD:
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none"
          >
            <option value="">ALL STATUS CATEGORIES</option>
            <option value="HIGHLY_TRUSTED">HIGHLY TRUSTED 🟢</option>
            <option value="TRUSTED">TRUSTED 🟢</option>
            <option value="CAUTION">CAUTION 🟡</option>
            <option value="UNRELIABLE">UNRELIABLE 🟠</option>
            <option value="CRITICAL">CRITICAL 🔴</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800 font-bold hover:bg-slate-200"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-900" />
            <span>SORT: {sortOrder === 'desc' ? 'HIGHEST FIRST ↓' : 'LOWEST FIRST ↑'}</span>
          </button>
        </div>
      </div>

      {/* ALL STATIONS TABLE */}
      <div className="gov-card overflow-hidden font-mono">
        <div className="responsive-table-wrapper overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="gov-table-header">
                <th className="p-2.5">RANK</th>
                <th className="p-2.5">STATION ID</th>
                <th className="p-2.5">STATION NAME & LOCATION</th>
                <th className="p-2.5">TRUST SCORE</th>
                <th className="p-2.5">STATUS CATEGORY</th>
                <th className="p-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedList.map((st) => (
                <tr
                  key={st.stationId}
                  onClick={() => handleStationClick(st.stationId)}
                  className="gov-table-row cursor-pointer"
                >
                  <td className="p-2.5 font-bold text-blue-950">{st.rankLabel}</td>
                  <td className="p-2.5 font-bold text-blue-900">{st.stationId}</td>
                  <td className="p-2.5">
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[10px] text-slate-500">{st.location}</div>
                  </td>
                  <td className="p-2.5 font-bold text-slate-900">{st.trustScore}%</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      st.status === 'HIGHLY_TRUSTED' || st.status === 'TRUSTED' ? 'gov-badge-green' :
                      (st.status === 'CAUTION' ? 'gov-badge-amber' : 'gov-badge-red')
                    }`}>
                      {st.statusLabel}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <span className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded text-[10px] font-bold uppercase transition-colors">
                      INSPECT DOSSIER
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
