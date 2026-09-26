$ErrorActionPreference = "Stop"

$dirs = @(
"backend",
"backend/app",
"backend/app/core",
"backend/app/database",
"backend/app/models",
"backend/app/schemas",
"backend/app/api",
"backend/app/services",
"backend/app/ml",
"backend/app/simulator",
"backend/app/utils",
"backend/tests",
"backend/scripts",
"frontend",
"frontend/src",
"frontend/src/api",
"frontend/src/types",
"frontend/src/hooks",
"frontend/src/components",
"frontend/src/components/layout",
"frontend/src/components/dashboard",
"frontend/src/components/stations",
"frontend/src/components/charts",
"frontend/src/components/anomaly",
"frontend/src/components/health",
"frontend/src/components/simulator",
"frontend/src/components/common",
"frontend/src/pages",
"frontend/src/utils",
"ml_models",
"ml_models/isolation_forest",
"ml_models/lstm_autoencoder",
"data",
"data/raw",
"data/processed",
"data/demo",
"docs",
"alembic",
"alembic/versions"
)

$files = @(
"README.md",
".gitignore",
".env.example",
"docker-compose.yml",
"Makefile",

"backend/requirements.txt",
"backend/Dockerfile",
"backend/alembic.ini",
"backend/app/__init__.py",
"backend/app/main.py",

"backend/app/core/__init__.py",
"backend/app/core/config.py",
"backend/app/core/logging.py",
"backend/app/core/security.py",
"backend/app/core/constants.py",

"backend/app/database/__init__.py",
"backend/app/database/database.py",
"backend/app/database/base.py",

"backend/app/models/__init__.py",
"backend/app/models/station.py",
"backend/app/models/observation.py",
"backend/app/models/anomaly.py",
"backend/app/models/alert.py",
"backend/app/models/health.py",
"backend/app/models/maintenance.py",
"backend/app/models/simulation.py",

"backend/app/schemas/__init__.py",
"backend/app/schemas/station.py",
"backend/app/schemas/observation.py",
"backend/app/schemas/anomaly.py",
"backend/app/schemas/alert.py",
"backend/app/schemas/health.py",
"backend/app/schemas/simulation.py",

"backend/app/api/__init__.py",
"backend/app/api/stations.py",
"backend/app/api/observations.py",
"backend/app/api/anomalies.py",
"backend/app/api/alerts.py",
"backend/app/api/health.py",
"backend/app/api/analytics.py",
"backend/app/api/simulation.py",
"backend/app/api/websocket.py",

"backend/app/services/__init__.py",
"backend/app/services/preprocessing.py",
"backend/app/services/quality_control.py",
"backend/app/services/rule_engine.py",
"backend/app/services/anomaly_engine.py",
"backend/app/services/multivariate_engine.py",
"backend/app/services/event_classifier.py",
"backend/app/services/root_cause.py",
"backend/app/services/health_score.py",
"backend/app/services/maintenance.py",
"backend/app/services/alert_service.py",
"backend/app/services/correction_service.py",
"backend/app/services/websocket_manager.py",

"backend/app/ml/__init__.py",
"backend/app/ml/feature_engineering.py",
"backend/app/ml/isolation_forest.py",
"backend/app/ml/lstm_autoencoder.py",
"backend/app/ml/anomaly_scoring.py",
"backend/app/ml/model_manager.py",
"backend/app/ml/model_registry.py",

"backend/app/simulator/__init__.py",
"backend/app/simulator/weather_generator.py",
"backend/app/simulator/station_generator.py",
"backend/app/simulator/fault_injector.py",
"backend/app/simulator/scenarios.py",
"backend/app/simulator/simulator_manager.py",

"backend/app/utils/__init__.py",
"backend/app/utils/time.py",
"backend/app/utils/math.py",
"backend/app/utils/validators.py",

"backend/tests/__init__.py",
"backend/tests/test_health_score.py",
"backend/tests/test_rule_engine.py",
"backend/tests/test_anomaly_engine.py",
"backend/tests/test_event_classifier.py",
"backend/tests/test_simulator.py",
"backend/tests/test_api.py",

"backend/scripts/seed_database.py",
"backend/scripts/train_models.py",
"backend/scripts/generate_demo_data.py",

"alembic/env.py",

"frontend/package.json",
"frontend/tsconfig.json",
"frontend/vite.config.ts",
"frontend/tailwind.config.js",
"frontend/postcss.config.js",
"frontend/Dockerfile",
"frontend/src/main.tsx",
"frontend/src/App.tsx",
"frontend/src/index.css",

"frontend/src/api/client.ts",
"frontend/src/api/stations.ts",
"frontend/src/api/observations.ts",
"frontend/src/api/anomalies.ts",
"frontend/src/api/alerts.ts",
"frontend/src/api/health.ts",
"frontend/src/api/simulation.ts",

"frontend/src/types/station.ts",
"frontend/src/types/observation.ts",
"frontend/src/types/anomaly.ts",
"frontend/src/types/alert.ts",
"frontend/src/types/health.ts",

"frontend/src/hooks/useWebSocket.ts",
"frontend/src/hooks/useStations.ts",
"frontend/src/hooks/useAnomalies.ts",
"frontend/src/hooks/useHealth.ts",

"frontend/src/components/layout/Sidebar.tsx",
"frontend/src/components/layout/Header.tsx",
"frontend/src/components/layout/PageContainer.tsx",

"frontend/src/components/dashboard/StatCard.tsx",
"frontend/src/components/dashboard/NetworkHealth.tsx",
"frontend/src/components/dashboard/StationMap.tsx",
"frontend/src/components/dashboard/RecentAlerts.tsx",
"frontend/src/components/dashboard/AnomalySummary.tsx",
"frontend/src/components/dashboard/SystemStatus.tsx",

"frontend/src/components/stations/StationTable.tsx",
"frontend/src/components/stations/StationCard.tsx",
"frontend/src/components/stations/StationStatusBadge.tsx",
"frontend/src/components/stations/StationFilters.tsx",

"frontend/src/components/charts/TimeSeriesChart.tsx",
"frontend/src/components/charts/AnomalyTimeline.tsx",
"frontend/src/components/charts/HealthHistoryChart.tsx",
"frontend/src/components/charts/ActualVsExpected.tsx",
"frontend/src/components/charts/SensorComparisonChart.tsx",

"frontend/src/components/anomaly/AnomalyCard.tsx",
"frontend/src/components/anomaly/AnomalyDetails.tsx",
"frontend/src/components/anomaly/ConfidenceBar.tsx",
"frontend/src/components/anomaly/RootCausePanel.tsx",

"frontend/src/components/health/HealthScore.tsx",
"frontend/src/components/health/HealthBreakdown.tsx",
"frontend/src/components/health/MaintenanceRecommendation.tsx",

"frontend/src/components/simulator/SimulatorPanel.tsx",
"frontend/src/components/simulator/FaultButtons.tsx",
"frontend/src/components/simulator/ScenarioSelector.tsx",
"frontend/src/components/simulator/SimulationStatus.tsx",

"frontend/src/components/common/Badge.tsx",
"frontend/src/components/common/Button.tsx",
"frontend/src/components/common/Modal.tsx",
"frontend/src/components/common/Loading.tsx",
"frontend/src/components/common/EmptyState.tsx",
"frontend/src/components/common/ErrorState.tsx",

"frontend/src/pages/Dashboard.tsx",
"frontend/src/pages/Stations.tsx",
"frontend/src/pages/StationDetails.tsx",
"frontend/src/pages/Anomalies.tsx",
"frontend/src/pages/Alerts.tsx",
"frontend/src/pages/Maintenance.tsx",
"frontend/src/pages/Analytics.tsx",
"frontend/src/pages/Simulator.tsx",

"frontend/src/utils/formatting.ts",
"frontend/src/utils/colors.ts",
"frontend/src/utils/constants.ts",

"docs/architecture.md",
"docs/api.md",
"docs/ml_pipeline.md",
"docs/demo_scenarios.md"
)

Write-Host "Creating SkyGuard AI folder structure..." -ForegroundColor Cyan

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

foreach ($file in $files) {
    $parent = Split-Path -Parent $file
    if ($parent) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
    }
}

@"
# Python
__pycache__/
*.py[cod]
*.pyo
.venv/
venv/
.env

# Node
node_modules/
dist/
.vite/

# IDE
.vscode/
.idea/

# ML
*.pt
*.pth
*.pkl
*.joblib

# Logs
*.log

# Database
postgres_data/

# Testing
.pytest_cache/
.coverage
htmlcov/

# Data
data/raw/*
data/processed/*
data/demo/*
"@ | Set-Content ".gitignore"

@"
# SkyGuard AI

AWS Data Trust & Intelligent Sensor Health Platform.
"@ | Set-Content "README.md"

Write-Host ""
Write-Host "SkyGuard AI structure created successfully." -ForegroundColor Green
Write-Host "Total directories: $($dirs.Count)" -ForegroundColor Green
Write-Host "Total files: $($files.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Ready for Phase 1 implementation." -ForegroundColor Yellow