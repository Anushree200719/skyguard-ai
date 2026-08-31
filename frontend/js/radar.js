class RadarVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = (this.width / 2) - 20;
        this.sweepAngle = 0;
        this.isSweeping = true;
        
        this.targets = [
            { id: 'TRK-901', distance: 0.4, angle: 45, threat: 'YELLOW' },
            { id: 'TRK-408', distance: 0.7, angle: 198, threat: 'RED' }
        ];

        this.init();
    }

    init() {
        this.animate();
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;

        // Concentric Range Rings
        [0.25, 0.5, 0.75, 1.0].forEach(r => {
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, this.radius * r, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(this.centerX - this.radius, this.centerY);
        ctx.lineTo(this.centerX + this.radius, this.centerY);
        ctx.moveTo(this.centerX, this.centerY - this.radius);
        ctx.lineTo(this.centerX, this.centerY + this.radius);
        ctx.stroke();
    }

    drawSweep() {
        if (!this.isSweeping) return;

        const ctx = this.ctx;
        const startAngle = this.sweepAngle;
        const endAngle = this.sweepAngle - 0.4;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.arc(this.centerX, this.centerY, this.radius, endAngle, startAngle, false);
        ctx.closePath();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();

        // Leading beam line
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.lineTo(
            this.centerX + this.radius * Math.cos(startAngle),
            this.centerY + this.radius * Math.sin(startAngle)
        );
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        this.sweepAngle += 0.025;
        if (this.sweepAngle >= Math.PI * 2) {
            this.sweepAngle = 0;
        }
    }

    drawTargets() {
        const ctx = this.ctx;
        this.targets.forEach(target => {
            const rad = (target.angle * Math.PI) / 180;
            const x = this.centerX + (this.radius * target.distance) * Math.cos(rad);
            const y = this.centerY + (this.radius * target.distance) * Math.sin(rad);

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = target.threat === 'RED' ? '#ef4444' : '#f59e0b';
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px Orbitron';
            ctx.fillText(target.id, x + 10, y + 4);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawSweep();
        this.drawTargets();
        requestAnimationFrame(() => this.animate());
    }
}
