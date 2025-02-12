export const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

export const gl = canvas.getContext('webgl') as WebGLRenderingContext;
if (!gl) {
  throw new Error('WebGL not supported');
}

export const aspect = canvas.clientWidth / canvas.clientHeight;

export const shadowMapSize = 1024;

export const depthTextureExtension = gl.getExtension('WEBGL_depth_texture');
if (!depthTextureExtension) {
  console.error(
    'This WebGL program requires the use ' +
      'of the WEBGL_depth_texture extension. This extension is not supported ' +
      'by your browser, so this WebGL program is terminating.'
  );
}
