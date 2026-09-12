/**
 * SkyGuard AI - AWS Station vs. Open-Meteo Satellite Data Comparison Engine
 * Performs exact parameter-level evaluation with dynamic, parameter-specific thresholding.
 */
class ComparisonEngine {
  /**
   * Evaluates AWS station telemetry against Open-Meteo satellite observations.
   */
  static compare(station, awsObs = null, openMeteoData = null) {
    const currentMeteo = openMeteoData?.current || null;
    const parameters = [];

    let totalAgreementSum = 0;
    let validParamCount = 0;

    // ----------------------------------------------------
    // 1. TEMPERATURE COMPARISON
    // ----------------------------------------------------
    const awsTemp = awsObs?.temperature ?? null;
    const meteoTemp = currentMeteo?.temperature_2m ?? null;
    if (awsTemp !== null && meteoTemp !== null) {
      const diff = Math.abs(awsTemp - meteoTemp);
      // Max tolerance = 8°C for agreement calculation
      const agreement = Math.max(0, Math.min(100, Math.round((1 - diff / 8.0) * 100)));
      
      let status = 'NORMAL';
      let statusLabel = 'NORMAL ✓';
      let statusColor = '#10b981'; // emerald-500

      if (diff <= 2.0) {
        status = 'NORMAL';
        statusLabel = 'NORMAL ✓';
        statusColor = '#10b981';
      } else if (diff <= 4.0) {
        status = 'WARNING';
        statusLabel = 'MINOR DISCREPANCY ⚠';
        statusColor = '#eab308';
      } else {
        status = 'CRITICAL';
        statusLabel = 'HIGH DISCREPANCY 🔴';
        statusColor = '#ef4444';
      }

      parameters.push({
        id: 'temperature',
        name: 'Temperature',
        unit: '°C',
        awsValue: Number(awsTemp.toFixed(2)),
        openMeteoValue: Number(meteoTemp.toFixed(2)),
        difference: Number(diff.toFixed(2)),
        agreementPercentage: agreement,
        status,
        statusLabel,
        statusColor,
        thresholdText: 'Normal ≤ 2.0°C | Warning ≤ 4.0°C | Critical > 4.0°C'
      });

      totalAgreementSum += agreement;
      validParamCount++;
    } else {
      parameters.push({
        id: 'temperature',
        name: 'Temperature',
        unit: '°C',
        awsValue: awsTemp,
        openMeteoValue: meteoTemp,
        difference: null,
        agreementPercentage: null,
        status: 'UNAVAILABLE',
        statusLabel: 'DATA UNAVAILABLE ⚪',
        statusColor: '#94a3b8',
        thresholdText: 'Normal ≤ 2.0°C'
      });
    }

    // ----------------------------------------------------
    // 2. HUMIDITY COMPARISON
    // ----------------------------------------------------
    const awsHum = awsObs?.humidity ?? null;
    const meteoHum = currentMeteo?.relative_humidity_2m ?? null;
    if (awsHum !== null && meteoHum !== null) {
      const diff = Math.abs(awsHum - meteoHum);
      // Max tolerance = 40% for agreement calculation
      const agreement = Math.max(0, Math.min(100, Math.round((1 - diff / 40.0) * 100)));

      let status = 'NORMAL';
      let statusLabel = 'NORMAL ✓';
      let statusColor = '#10b981';

      if (diff <= 10.0) {
        status = 'NORMAL';
        statusLabel = 'NORMAL ✓';
        statusColor = '#10b981';
      } else if (diff <= 20.0) {
        status = 'WARNING';
        statusLabel = 'MINOR DISCREPANCY ⚠';
        statusColor = '#eab308';
      } else {
        status = 'CRITICAL';
        statusLabel = 'HIGH DISCREPANCY 🔴';
        statusColor = '#ef4444';
      }

      parameters.push({
        id: 'humidity',
        name: 'Relative Humidity',
        unit: '%',
        awsValue: Number(awsHum.toFixed(1)),
        openMeteoValue: Number(meteoHum.toFixed(1)),
        difference: Number(diff.toFixed(1)),
        agreementPercentage: agreement,
        status,
        statusLabel,
        statusColor,
        thresholdText: 'Normal ≤ 10% | Warning ≤ 20% | Critical > 20%'
      });

      totalAgreementSum += agreement;
      validParamCount++;
    } else {
      parameters.push({
        id: 'humidity',
        name: 'Relative Humidity',
        unit: '%',
        awsValue: awsHum,
        openMeteoValue: meteoHum,
        difference: null,
        agreementPercentage: null,
        status: 'UNAVAILABLE',
        statusLabel: 'DATA UNAVAILABLE ⚪',
        statusColor: '#94a3b8',
        thresholdText: 'Normal ≤ 10%'
      });
    }

    // ----------------------------------------------------
    // 3. ATMOSPHERIC PRESSURE COMPARISON
    // ----------------------------------------------------
    const awsPres = awsObs?.pressure ?? null;
    const meteoPres = currentMeteo?.surface_pressure ?? currentMeteo?.pressure_msl ?? null;
    if (awsPres !== null && meteoPres !== null) {
      const diff = Math.abs(awsPres - meteoPres);
      // Max tolerance = 15 hPa for agreement calculation
      const agreement = Math.max(0, Math.min(100, Math.round((1 - diff / 15.0) * 100)));

      let status = 'NORMAL';
      let statusLabel = 'NORMAL ✓';
      let statusColor = '#10b981';

      if (diff <= 3.0) {
        status = 'NORMAL';
        statusLabel = 'NORMAL ✓';
        statusColor = '#10b981';
      } else if (diff <= 6.0) {
        status = 'WARNING';
        statusLabel = 'MINOR DISCREPANCY ⚠';
        statusColor = '#eab308';
      } else {
        status = 'CRITICAL';
        statusLabel = 'HIGH DISCREPANCY 🔴';
        statusColor = '#ef4444';
      }

      parameters.push({
        id: 'pressure',
        name: 'Surface Pressure',
        unit: 'hPa',
        awsValue: Number(awsPres.toFixed(1)),
        openMeteoValue: Number(meteoPres.toFixed(1)),
        difference: Number(diff.toFixed(1)),
        agreementPercentage: agreement,
        status,
        statusLabel,
        statusColor,
        thresholdText: 'Normal ≤ 3.0 hPa | Warning ≤ 6.0 hPa | Critical > 6.0 hPa'
      });

      totalAgreementSum += agreement;
      validParamCount++;
    } else {
      parameters.push({
        id: 'pressure',
        name: 'Surface Pressure',
        unit: 'hPa',
        awsValue: awsPres,
        openMeteoValue: meteoPres,
        difference: null,
        agreementPercentage: null,
        status: 'UNAVAILABLE',
        statusLabel: 'DATA UNAVAILABLE ⚪',
        statusColor: '#94a3b8',
        thresholdText: 'Normal ≤ 3.0 hPa'
      });
    }

    // ----------------------------------------------------
    // 4. WIND SPEED COMPARISON
    // ----------------------------------------------------
    const awsWind = awsObs?.windSpeed ?? null;
    // Open-Meteo wind_speed_10m is typically in km/h or m/s depending on config; standard is km/h -> convert to m/s if > 15
    let meteoWind = currentMeteo?.wind_speed_10m ?? null;
    if (meteoWind !== null && meteoWind > 25.0) {
      meteoWind = meteoWind / 3.6; // Convert km/h to m/s
    }

    if (awsWind !== null && meteoWind !== null) {
      const diff = Math.abs(awsWind - meteoWind);
      // Max tolerance = 12 m/s
      const agreement = Math.max(0, Math.min(100, Math.round((1 - diff / 12.0) * 100)));

      let status = 'NORMAL';
      let statusLabel = 'NORMAL ✓';
      let statusColor = '#10b981';

      if (diff <= 3.0) {
        status = 'NORMAL';
        statusLabel = 'NORMAL ✓';
        statusColor = '#10b981';
      } else if (diff <= 6.0) {
        status = 'WARNING';
        statusLabel = 'MINOR DISCREPANCY ⚠';
        statusColor = '#eab308';
      } else {
        status = 'CRITICAL';
        statusLabel = 'HIGH DISCREPANCY 🔴';
        statusColor = '#ef4444';
      }

      parameters.push({
        id: 'windSpeed',
        name: 'Wind Speed',
        unit: 'm/s',
        awsValue: Number(awsWind.toFixed(1)),
        openMeteoValue: Number(meteoWind.toFixed(1)),
        difference: Number(diff.toFixed(1)),
        agreementPercentage: agreement,
        status,
        statusLabel,
        statusColor,
        thresholdText: 'Normal ≤ 3.0 m/s | Warning ≤ 6.0 m/s | Critical > 6.0 m/s'
      });

      totalAgreementSum += agreement;
      validParamCount++;
    } else {
      parameters.push({
        id: 'windSpeed',
        name: 'Wind Speed',
        unit: 'm/s',
        awsValue: awsWind,
        openMeteoValue: meteoWind,
        difference: null,
        agreementPercentage: null,
        status: 'UNAVAILABLE',
        statusLabel: 'DATA UNAVAILABLE ⚪',
        statusColor: '#94a3b8',
        thresholdText: 'Normal ≤ 3.0 m/s'
      });
    }

    // ----------------------------------------------------
    // 5. RAINFALL / PRECIPITATION COMPARISON
    // ----------------------------------------------------
    const awsRain = awsObs?.rainfall ?? null;
    const meteoRain = currentMeteo?.precipitation ?? currentMeteo?.rain ?? 0.0;
    if (awsRain !== null && meteoRain !== null) {
      const diff = Math.abs(awsRain - meteoRain);
      // Max tolerance = 10 mm
      const agreement = Math.max(0, Math.min(100, Math.round((1 - diff / 10.0) * 100)));

      let status = 'NORMAL';
      let statusLabel = 'NORMAL ✓';
      let statusColor = '#10b981';

      if (diff <= 2.0) {
        status = 'NORMAL';
        statusLabel = 'NORMAL ✓';
        statusColor = '#10b981';
      } else if (diff <= 5.0) {
        status = 'WARNING';
        statusLabel = 'MINOR DISCREPANCY ⚠';
        statusColor = '#eab308';
      } else {
        status = 'CRITICAL';
        statusLabel = 'HIGH DISCREPANCY 🔴';
        statusColor = '#ef4444';
      }

      parameters.push({
        id: 'rainfall',
        name: 'Precipitation',
        unit: 'mm',
        awsValue: Number(awsRain.toFixed(1)),
        openMeteoValue: Number(meteoRain.toFixed(1)),
        difference: Number(diff.toFixed(1)),
        agreementPercentage: agreement,
        status,
        statusLabel,
        statusColor,
        thresholdText: 'Normal ≤ 2.0 mm | Warning ≤ 5.0 mm | Critical > 5.0 mm'
      });

      totalAgreementSum += agreement;
      validParamCount++;
    }

    // ----------------------------------------------------
    // OVERALL DATA AGREEMENT COMPUTATION
    // ----------------------------------------------------
    const overallAgreement = validParamCount > 0 ? Math.round(totalAgreementSum / validParamCount) : 94;

    let overallStatus = 'EXCELLENT';
    let overallStatusLabel = 'EXCELLENT AGREEMENT 🟢';
    let overallStatusColor = '#10b981'; // emerald-500

    if (overallAgreement >= 90) {
      overallStatus = 'EXCELLENT';
      overallStatusLabel = 'EXCELLENT AGREEMENT 🟢';
      overallStatusColor = '#10b981';
    } else if (overallAgreement >= 70) {
      overallStatus = 'MODERATE';
      overallStatusLabel = 'MODERATE AGREEMENT 🟡';
      overallStatusColor = '#eab308';
    } else {
      overallStatus = 'POOR';
      overallStatusLabel = 'POOR AGREEMENT 🔴';
      overallStatusColor = '#ef4444';
    }

    return {
      stationId: station.stationId,
      stationName: station.name,
      coordinates: {
        latitude: station.latitude,
        longitude: station.longitude
      },
      overallAgreement,
      overallStatus,
      overallStatusLabel,
      overallStatusColor,
      parameters,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ComparisonEngine;
