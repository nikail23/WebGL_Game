import { vec4 } from 'gl-matrix';
import { ExtendedGLBuffer, Mesh } from 'webgl-obj-loader';

export interface Mesh3DBuffers {
  normalBuffer: ExtendedGLBuffer;
  textureBuffer: ExtendedGLBuffer;
  vertexBuffer: ExtendedGLBuffer;
  indexBuffer: ExtendedGLBuffer;
}

export class Mesh3D extends Mesh {
  public defaultColor = vec4.fromValues(1, 1, 1, 1);
  public texture: WebGLTexture | null = null;
  public buffers: Mesh3DBuffers = {
    normalBuffer: { itemSize: 0, numItems: 0 },
    textureBuffer: { itemSize: 0, numItems: 0 },
    vertexBuffer: { itemSize: 0, numItems: 0 },
    indexBuffer: { itemSize: 0, numItems: 0 },
  };
}
