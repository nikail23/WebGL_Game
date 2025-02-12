import { gl } from '../context';
import { Program } from './program';

export class ShadowProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/src/core/webgl/shaders/shadow/vertex.glsl';
    const fsPath = '/src/core/webgl/shaders/shadow/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.locations.attributes.aVertexPosition = gl.getAttribLocation(
      this.program,
      'aVertexPosition'
    );

    this.locations.uniforms.uModelMatrix = gl.getUniformLocation(
      this.program,
      'uModelMatrix'
    );
    this.locations.uniforms.uLightViewProjectionMatrix = gl.getUniformLocation(
      this.program,
      'uLightViewProjectionMatrix'
    );
  }

  public isReady(): boolean {
    return (
      !!this.program &&
      !!~this.aVertexPosition &&
      !!this.uModelMatrix &&
      !!this.uLightViewProjectionMatrix
    );
  }

  get aVertexPosition(): number {
    return this.locations.attributes.aVertexPosition;
  }

  get uModelMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uModelMatrix;
  }

  get uLightViewProjectionMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightViewProjectionMatrix;
  }
}
