import { build, serve } from 'bun';
import { cp, readFileSync } from 'fs';
import { join } from 'path';
import app from '../src/index.html';

export async function buildApp() {
  await build({
    entrypoints: ['src/index.ts', 'src/index.html', 'src/core/index.ts'],
    outdir: 'dist',
  });

  console.log('Source files builded');

  generateNoiseTexture();

  copyAssets();

  console.log('Build completed');
}

export async function serveApp(port: number) {
  await serve({
    port,
    routes: {
      '/': app,
    },
    fetch(request) {
      const url = new URL(request.url);
      const filePath = join(process.cwd() + url.pathname);

      try {
        const fileContent = readFileSync(filePath);
        return new Response(fileContent);
      } catch (error) {
        return new Response('Файл не найден', { status: 404 });
      }
    },
  });

  console.log(`Dev is running on http://localhost:${port}`);
}

export function generateNoiseTexture(): void {
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
  const outputPath = join(process.cwd(), 'assets', 'textures', 'noise-256.png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Noise texture generated`);
}

export function copyAssets() {
  const assets = join(process.cwd(), 'assets');
  const distAssets = join(process.cwd(), 'dist', 'assets');

  cp(assets, distAssets, { recursive: true }, () => {});

  console.log('Assets copied');
}
