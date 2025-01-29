import { gl } from '../../context';
import { Program } from '../program';

export class FirstProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/src/core/webgl/shaders/vertex.glsl';
    const fsPath = '/src/core/webgl/shaders/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.locations.attributes.aVertexPosition = gl.getAttribLocation(
      this.program,
      'aVertexPosition'
    );
    this.locations.attributes.aTextureCoordinate = gl.getAttribLocation(
      this.program,
      'aTextureCoordinate'
    );
    this.locations.attributes.aNormal = gl.getAttribLocation(
      this.program,
      'aNormal'
    );

    this.locations.uniforms.uLightPosition = gl.getUniformLocation(
      this.program,
      'uLightPosition'
    );
    this.locations.uniforms.uHasTexture = gl.getUniformLocation(
      this.program,
      'uHasTexture'
    );
    this.locations.uniforms.uSampler = gl.getUniformLocation(
      this.program,
      'uSampler'
    );
    this.locations.uniforms.uColor = gl.getUniformLocation(
      this.program,
      'uColor'
    );
    this.locations.uniforms.uViewModelMatrix = gl.getUniformLocation(
      this.program,
      'uViewModelMatrix'
    );
    this.locations.uniforms.uProjectionMatrix = gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
  }

  public isReady(): boolean {
    return (
      !!this.program &&
      !!~this.aVertexPosition &&
      !!~this.aTextureCoordinate &&
      !!~this.aNormal &&
      !!this.uHasTexture &&
      !!this.uSampler &&
      !!this.uColor &&
      !!this.uViewModelMatrix &&
      !!this.uProjectionMatrix &&
      !!this.uLightPosition
    );
  }

  get aVertexPosition(): number {
    return this.locations.attributes.aVertexPosition;
  }
  get aNormal(): number {
    return this.locations.attributes.aNormal;
  }
  get aTextureCoordinate(): number {
    return this.locations.attributes.aTextureCoordinate;
  }

  get uHasTexture(): WebGLUniformLocation | null {
    return this.locations.uniforms.uHasTexture;
  }
  get uSampler(): WebGLUniformLocation | null {
    return this.locations.uniforms.uSampler;
  }
  get uColor(): WebGLUniformLocation | null {
    return this.locations.uniforms.uColor;
  }
  get uLightPosition(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightPosition;
  }
  get uViewModelMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uViewModelMatrix;
  }
  get uProjectionMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uProjectionMatrix;
  }
}
