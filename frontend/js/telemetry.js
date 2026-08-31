class TelemetryManager {
    constructor() {
        this.listeners = [];
        this.initMockStream();
    }

    initMockStream() {
        setInterval(() => {
            const data = {
                timestamp: new Date().toLocaleTimeString(),
                targets: [
                    { id: 'TRK-901', azimuth: (45 + Math.random() * 2).toFixed(1), range_km: 4.2, alt_m: 240, threat: 'YELLOW' },
                    { id: 'TRK-408', azimuth: (198 + Math.random() * 3).toFixed(1), range_km: (9.8 - Math.random() * 0.1).toFixed(1), alt_m: 610, threat: 'RED' }
                ]
            };
            this.notify(data);
        }, 1000);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(data) {
        this.listeners.forEach(cb => cb(data));
    }
}
