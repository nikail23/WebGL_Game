const { createCanvas } = require('canvas');
const fs = require('fs');

const width = 256,
  height = 256;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

const imageData = ctx.createImageData(width, height);
const data = imageData.data;

for (let i = 0; i < width * height; i++) {
  const index = i * 4;
  const value = Math.floor(Math.random() * 256);
  data[index] = value;
  data[index + 1] = value;
  data[index + 2] = value;
  data[index + 3] = 255;
}

ctx.putImageData(imageData, 0, 0);
const buffer = canvas.toBuffer('image/png');
const outputPath = 'd:\\Projects\\game\\src\\assets\\textures\\noise-256.png';
fs.writeFileSync(outputPath, buffer);
console.log(`Noise texture generated: ${outputPath}`);
