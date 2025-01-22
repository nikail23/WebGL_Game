import { gl } from '../gl';

export class ShaderProgram {
  private program: WebGLProgram;

  public get WebGlProgram(): WebGLProgram {
    if (!this.program) {
      throw new Error('ShaderProgram is not initialized');
    }
    return this.program;
  }

  public constructor(vsSource: string, fsSource: string) {
    this.program = this.createProgram(vsSource, fsSource);
  }

  public use(): void {
    gl.useProgram(this.program);
  }

  public getAttribLocation(name: string): number {
    return gl.getAttribLocation(this.program!, name);
  }

  public getUniformLocation(name: string): WebGLUniformLocation | null {
    return gl.getUniformLocation(this.program!, name);
  }

  private createProgram(vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) throw new Error('Failed to create shader program');

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error('Unable to initialize shader program');
    }

    return shaderProgram;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compilation error: ' + info);
    }

    return shader;
  }
}
