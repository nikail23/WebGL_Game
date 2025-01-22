console.log('gl.bundle.js loaded');

export const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

export const gl = canvas.getContext('webgl') as WebGLRenderingContext;
if (!gl) {
  throw new Error('WebGL not supported');
}

export const fov = (45 * Math.PI) / 180;
export const aspectRatio = canvas.clientWidth / canvas.clientHeight;
