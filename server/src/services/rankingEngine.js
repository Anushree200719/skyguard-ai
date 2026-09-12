/**
 * SkyGuard AI - AWS Station Reliability Ranking Engine
 * Evaluates all stations using actual TrustScoreEngine metrics, computes leaderboard rankings,
 * tracks legitimate historical rank changes (↑ Improved, ↓ Declined, → Stable), and groups top/attention stations.
 */
const store = require('../models/inMemoryStore');
const TrustScoreEngine = require('./trustScoreEngine');

class RankingEngine {
  constructor() {
    this.previousRanks = new Map(); // stationId -> { rank, trustScore, timestamp }
    this.cacheData = null;
    this.cacheTimestamp = 0;
    this.cacheTTL = 10 * 1000; // 10 seconds cache TTL
  }

  getStationRankings(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cacheData && (now - this.cacheTimestamp < this.cacheTTL)) {
      return this.cacheData;
    }

    const stations = store.getStations();
    const stationEvaluations = [];

    for (const st of stations) {
      const obs = store.getObservations(st.stationId, 30);
      const anomalies = store.getAnomalies({ station: st.stationId, limit: 15 });
      const trustDetails = TrustScoreEngine.calculate(st, obs, anomalies);

      stationEvaluations.push({
        stationId: st.stationId,
        name: st.name,
        location: st.location,
        latitude: st.latitude,
        longitude: st.longitude,
        elevation: st.elevation,
        trustScore: trustDetails.overallScore,
        status: trustDetails.status,
        statusLabel: trustDetails.statusLabel,
        statusColor: trustDetails.statusColor,
        trustDetails,
        lastSeen: st.lastSeen || new Date().toISOString()
      });
    }

    // Sort by trustScore descending; resolve ties by stationId
    stationEvaluations.sort((a, b) => {
      if (b.trustScore !== a.trustScore) {
        return b.trustScore - a.trustScore;
      }
      return a.stationId.localeCompare(b.stationId);
    });

    // Assign rank positions and calculate trend relative to previous snapshot
    const allRankings = stationEvaluations.map((st, index) => {
      const currentRank = index + 1;
      const prevData = this.previousRanks.get(st.stationId);

      let trend = 'STABLE';
      let trendLabel = '→ Stable';

      if (prevData) {
        if (currentRank < prevData.rank || st.trustScore > prevData.trustScore + 0.5) {
          trend = 'IMPROVED';
          trendLabel = '↑ Improved';
        } else if (currentRank > prevData.rank || st.trustScore < prevData.trustScore - 0.5) {
          trend = 'DECLINED';
          trendLabel = '↓ Declined';
        } else {
          trend = 'STABLE';
          trendLabel = '→ Stable';
        }
      }

      return {
        rank: currentRank,
        rankLabel: `#${currentRank}`,
        trend,
        trendLabel,
        ...st
      };
    });

    // Update historical rank snapshot for next evaluation cycle
    allRankings.forEach(item => {
      this.previousRanks.set(item.stationId, {
        rank: item.rank,
        trustScore: item.trustScore,
        timestamp: now
      });
    });

    // Extract Top 3 Reliable Stations (🥇 1st, 🥈 2nd, 🥉 3rd)
    const medals = ['🥇', '🥈', '🥉'];
    const topReliable = allRankings.slice(0, 3).map((item, idx) => ({
      ...item,
      medal: medals[idx] || '⭐'
    }));

    // Extract Needs Attention Stations (trust score < 75% or status CAUTION / UNRELIABLE / CRITICAL)
    const needsAttention = allRankings.filter(st => 
      st.trustScore < 75 || st.status === 'CAUTION' || st.status === 'UNRELIABLE' || st.status === 'CRITICAL'
    );

    const result = {
      totalStations: allRankings.length,
      topReliable,
      needsAttention,
      allRankings,
      calculatedAt: new Date().toISOString()
    };

    this.cacheData = result;
    this.cacheTimestamp = now;
    return result;
  }
}

const rankingEngine = new RankingEngine();
module.exports = rankingEngine;
