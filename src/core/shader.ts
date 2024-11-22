export class ShaderProgram {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  public get WebGlProgram(): WebGLProgram {
    if (!this.program) {
      throw new Error('ShaderProgram is not initialized');
    }
    return this.program;
  }

  public constructor(
    gl: WebGLRenderingContext,
    vsSource: string,
    fsSource: string
  ) {
    this.gl = gl;
    this.program = this.createProgram(vsSource, fsSource);
  }

  public use(): void {
    this.gl.useProgram(this.program);
  }

  public getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program!, name);
  }

  public getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.program!, name);
  }

  private createProgram(vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      fsSource
    );

    const shaderProgram = this.gl.createProgram();
    if (!shaderProgram) throw new Error('Failed to create shader program');

    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      throw new Error('Unable to initialize shader program');
    }

    return shaderProgram;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error('Shader compilation error: ' + info);
    }

    return shader;
  }
}
