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
    this.locations.uniforms.uViewMatrix = gl.getUniformLocation(
      this.program,
      'uViewMatrix'
    );
    this.locations.uniforms.uModelMatrix = gl.getUniformLocation(
      this.program,
      'uModelMatrix'
    );
    this.locations.uniforms.uProjectionMatrix = gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
    this.locations.uniforms.uNormalMatrix = gl.getUniformLocation(
      this.program,
      'uNormalMatrix'
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
      !!this.uViewMatrix &&
      !!this.uModelMatrix &&
      !!this.uProjectionMatrix &&
      !!this.uNormalMatrix &&
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
  get uModelMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uModelMatrix;
  }
  get uViewMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uViewMatrix;
  }
  get uProjectionMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uProjectionMatrix;
  }
  get uNormalMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uNormalMatrix;
  }
}
