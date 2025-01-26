import { gl } from '../../context';
import { Program } from '../program';

export class FirstProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/src/shaders/vertex.glsl';
    const fsPath = '/src/shaders/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.locations.attributes.aVertexPosition = gl.getAttribLocation(
      this.program,
      'aVertexPosition'
    );
    this.locations.attributes.aTextureCoordinate = gl.getAttribLocation(
      this.program,
      'aTextureCoordinate'
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

  get aVertexPosition() {
    return this.locations.attributes.aVertexPosition;
  }
  get aTextureCoordinate() {
    return this.locations.attributes.aTextureCoordinate;
  }
  get uHasTexture() {
    return this.locations.uniforms.uHasTexture;
  }
  get uSampler() {
    return this.locations.uniforms.uSampler;
  }
  get uColor() {
    return this.locations.uniforms.uColor;
  }
  get uViewModelMatrix() {
    return this.locations.uniforms.uViewModelMatrix;
  }
  get uProjectionMatrix() {
    return this.locations.uniforms.uProjectionMatrix;
  }
}
