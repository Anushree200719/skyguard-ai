document.addEventListener('DOMContentLoaded', () => {
    const radar = new RadarVisualizer('radarCanvas');
    const telemetry = new TelemetryManager();

    // Clock updates
    setInterval(() => {
        const now = new Date();
        document.getElementById('utc-clock').textContent = now.toISOString().substr(11, 8) + ' UTC';
    }, 1000);

    // Toggle radar sweep
    const sweepBtn = document.getElementById('btn-sweep-toggle');
    sweepBtn.addEventListener('click', () => {
        radar.isSweeping = !radar.isSweeping;
        sweepBtn.textContent = radar.isSweeping ? 'PAUSE SWEEP' : 'RESUME SWEEP';
    });

    // Populate track list
    telemetry.subscribe((data) => {
        const listEl = document.getElementById('track-list');
        listEl.innerHTML = '';
        
        data.targets.forEach(t => {
            const card = document.createElement('div');
            card.className = 	rack-card threat-;
            card.innerHTML = 
                <div class="track-title">
                    <span></span>
                    <span class="text-"></span>
                </div>
                <div class="track-details">
                    <span>AZM: Â°</span>
                    <span>RNG:  km</span>
                    <span>ALT:  m</span>
                    <span>SPD: AUTO</span>
                </div>
            ;
            listEl.appendChild(card);
        });
    });
});
