const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create textures directory
const texturesDir = path.join(__dirname, '../public/textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

// Create Earth map texture
const earthCanvas = createCanvas(1024, 512);
const earthCtx = earthCanvas.getContext('2d');
earthCtx.fillStyle = '#1e4d8c';
earthCtx.fillRect(0, 0, 1024, 512);
earthCtx.fillStyle = '#2d7a4d';
earthCtx.beginPath();
earthCtx.arc(512, 256, 256, 0, Math.PI * 2);
earthCtx.fill();
fs.writeFileSync(path.join(texturesDir, 'earthmap.jpeg'), earthCanvas.toBuffer('image/jpeg'));

// Create Earth bump map texture
const bumpCanvas = createCanvas(1024, 512);
const bumpCtx = bumpCanvas.getContext('2d');
bumpCtx.fillStyle = '#333333';
bumpCtx.fillRect(0, 0, 1024, 512);
bumpCtx.fillStyle = '#666666';
bumpCtx.beginPath();
bumpCtx.arc(512, 256, 256, 0, Math.PI * 2);
bumpCtx.fill();
fs.writeFileSync(path.join(texturesDir, 'earthbump.jpeg'), bumpCanvas.toBuffer('image/jpeg'));

// Create Earth cloud texture
const cloudCanvas = createCanvas(1024, 512);
const cloudCtx = cloudCanvas.getContext('2d');
cloudCtx.fillStyle = 'rgba(255, 255, 255, 0)';
cloudCtx.fillRect(0, 0, 1024, 512);
cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
for (let i = 0; i < 100; i++) {
  const x = Math.random() * 1024;
  const y = Math.random() * 512;
  const r = Math.random() * 20 + 10;
  cloudCtx.beginPath();
  cloudCtx.arc(x, y, r, 0, Math.PI * 2);
  cloudCtx.fill();
}
fs.writeFileSync(path.join(texturesDir, 'earthCloud.png'), cloudCanvas.toBuffer('image/png'));

// Create galaxy texture
const galaxyCanvas = createCanvas(2048, 2048);
const galaxyCtx = galaxyCanvas.getContext('2d');
galaxyCtx.fillStyle = '#000000';
galaxyCtx.fillRect(0, 0, 2048, 2048);
galaxyCtx.fillStyle = '#ffffff';
for (let i = 0; i < 1000; i++) {
  const x = Math.random() * 2048;
  const y = Math.random() * 2048;
  const r = Math.random() * 2 + 1;
  galaxyCtx.beginPath();
  galaxyCtx.arc(x, y, r, 0, Math.PI * 2);
  galaxyCtx.fill();
}
fs.writeFileSync(path.join(texturesDir, 'galaxy.png'), galaxyCanvas.toBuffer('image/png'));