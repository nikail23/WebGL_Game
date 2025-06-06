export const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

export const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
if (!gl) {
  throw new Error('WebGL not supported');
}

export const aspect = canvas.clientWidth / canvas.clientHeight;

export const anisotropicFilteringExtension = gl.getExtension(
  'EXT_texture_filter_anisotropic'
);
if (!anisotropicFilteringExtension) {
  console.error(
    'This WebGL program requires the use ' +
      'of the EXT_texture_filter_anisotropic extension. This extension is not supported ' +
      'by your browser, so this WebGL program is terminating.'
  );
}
