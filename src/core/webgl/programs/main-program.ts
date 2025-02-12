import { gl } from '../context';
import { Program } from './program';

export class MainProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/src/core/webgl/shaders/base/vertex.glsl';
    const fsPath = '/src/core/webgl/shaders/base/fragment.glsl';

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
    this.locations.uniforms.uLightPosition = gl.getUniformLocation(
      this.program,
      'uLight.position'
    );
    this.locations.uniforms.uLightColor = gl.getUniformLocation(
      this.program,
      'uLight.color'
    );
    this.locations.uniforms.uLightShininess = gl.getUniformLocation(
      this.program,
      'uLight.shininess'
    );
    this.locations.uniforms.uLightAmbient = gl.getUniformLocation(
      this.program,
      'uLight.ambient'
    );
    this.locations.uniforms.uLightViewProjectionMatrix = gl.getUniformLocation(
      this.program,
      'uLightViewProjectionMatrix'
    );
    this.locations.uniforms.uShadowMap = gl.getUniformLocation(
      this.program,
      'uShadowMap'
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
      !!this.uLightPosition &&
      !!this.uLightColor &&
      !!this.uLightShininess &&
      !!this.uLightAmbient &&
      !!this.uLightViewProjectionMatrix &&
      !!this.uShadowMap
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
  get uLightPosition(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightPosition;
  }
  get uLightColor(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightColor;
  }
  get uLightShininess(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightShininess;
  }
  get uLightAmbient(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightAmbient;
  }
  get uLightViewProjectionMatrix(): WebGLUniformLocation | null {
    return this.locations.uniforms.uLightViewProjectionMatrix;
  }
  get uShadowMap(): WebGLUniformLocation | null {
    return this.locations.uniforms.uShadowMap;
  }
}
