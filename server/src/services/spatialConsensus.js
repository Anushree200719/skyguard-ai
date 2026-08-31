/**
 * Spatial Consensus Engine
 * Evaluates whether abnormal data on station A is confirmed by nearby stations B, C, D...
 */
class SpatialConsensusEngine {
  static haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static evaluateSpatialConsensus(targetStation, targetObs, allStations, latestObsMap) {
    if (!targetStation || !targetObs) return { isGenuineEvent: false, matchingRatio: 0 };

    // Find stations within 150 km
    const nearby = allStations.filter(s => {
      if (s.stationId === targetStation.stationId) return false;
      const dist = this.haversineKm(targetStation.latitude, targetStation.longitude, s.latitude, s.longitude);
      return dist <= 150;
    });

    if (nearby.length === 0) {
      return { isGenuineEvent: false, matchingRatio: 0, nearbyCount: 0 };
    }

    const targetTemp = targetObs.temperature;
    let matchingNeighbors = 0;
    const neighborTemps = [];

    nearby.forEach(ns => {
      const obs = latestObsMap[ns.stationId];
      if (obs && obs.temperature !== undefined) {
        neighborTemps.push(obs.temperature);
        if (Math.abs(obs.temperature - targetTemp) <= 3.5) {
          matchingNeighbors++;
        }
      }
    });

    const ratio = neighborTemps.length > 0 ? matchingNeighbors / neighborTemps.length : 0;
    const isGenuineEvent = ratio >= 0.5 && targetTemp > 40.0;

    return {
      isGenuineEvent,
      matchingRatio: ratio,
      nearbyCount: nearby.length,
      neighborTemps
    };
  }
}

module.exports = SpatialConsensusEngine;
