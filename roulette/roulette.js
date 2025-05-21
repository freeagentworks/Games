const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultDiv = document.getElementById('result');

const sectors = [
    { label: '1', color: '#f44336' },
    { label: '2', color: '#e91e63' },
    { label: '3', color: '#9c27b0' },
    { label: '4', color: '#3f51b5' },
    { label: '5', color: '#2196f3' },
    { label: '6', color: '#009688' },
    { label: '7', color: '#4caf50' },
    { label: '8', color: '#ffeb3b' },
];
const numSectors = sectors.length;
const anglePerSector = 2 * Math.PI / numSectors;
let currentAngle = 0;
let spinning = false;

function drawWheel(angle = 0) {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const radius = wheel.width / 2;
    for (let i = 0; i < numSectors; i++) {
        const start = angle + i * anglePerSector;
        const end = start + anglePerSector;
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 8, start, end);
        ctx.closePath();
        ctx.fillStyle = sectors[i].color;
        ctx.fill();
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(start + anglePerSector / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(sectors[i].label, radius * 0.65, 0);
        ctx.restore();
    }
    // ポインタ
    ctx.beginPath();
    ctx.moveTo(radius, 8);
    ctx.lineTo(radius - 16, 32);
    ctx.lineTo(radius + 16, 32);
    ctx.closePath();
    ctx.fillStyle = '#333';
    ctx.fill();
}

drawWheel();

function spinWheel() {
    if (spinning) return;
    spinning = true;
    resultDiv.textContent = '';
    let spinAngle = Math.random() * Math.PI * 6 + Math.PI * 6; // 3~6回転
    const duration = 2500;
    const start = performance.now();
    function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        currentAngle = (spinAngle * ease) % (2 * Math.PI);
        drawWheel(currentAngle);
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            showResult();
        }
    }
    requestAnimationFrame(animate);
}

function showResult() {
    // 指針の位置（上）に来ている数字を判定
    const normalized = (2 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
    const idx = Math.floor(normalized / anglePerSector) % numSectors;
    resultDiv.textContent = `結果: ${sectors[idx].label}`;
}

spinBtn.addEventListener('click', spinWheel);
