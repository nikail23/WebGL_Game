import { gl } from '../context';

export abstract class Program {
  protected program: WebGLProgram | null = null;
  protected locations: {
    attributes: { [key: string]: number };
    uniforms: { [key: string]: WebGLUniformLocation | null };
  } = {
    attributes: {},
    uniforms: {},
  };

  public get isActive(): boolean {
    return gl.getParameter(gl.CURRENT_PROGRAM) === this.program;
  }

  public get status() {
    const attributesStatus = Object.entries(this.locations.attributes).reduce(
      (acc, [key, location]) => {
        acc[key] = location !== undefined && location !== -1;
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    const uniformsStatus = Object.entries(this.locations.uniforms).reduce(
      (acc, [key, location]) => {
        acc[key] = Boolean(location);
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    return {
      attributes: attributesStatus,
      uniforms: uniformsStatus,
    };
  }

  public abstract init(): Promise<void>;

  public use(): void {
    if (!this.program) throw new Error('Program is not initialized');
    gl.useProgram(this.program);
  }

  public getAttribute(name: string): number {
    const location = this.locations.attributes[name];
    if (location === undefined || location === -1) {
      throw new Error(`Attribute ${name} is not found`);
    }
    return location;
  }

  public getUniform(name: string): WebGLUniformLocation {
    const location = this.locations.uniforms[name];
    if (!location) {
      throw new Error(`Uniform ${name} is not found`);
    }
    return location;
  }

  protected addAttribute(name: string): void {
    if (this.program) {
      this.locations.attributes[name] = gl.getAttribLocation(
        this.program,
        name
      );
    }
  }

  protected addUniform(name: string): void {
    if (this.program) {
      this.locations.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
  }

  protected async setProgram(
    vsPath: string,
    fsPath: string
  ): Promise<WebGLProgram> {
    const fs = await fetch(fsPath).then((response) => response.text());
    const vs = await fetch(vsPath).then((response) => response.text());

    const vertexShader = this._compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, fs);

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

  private _compileShader(type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      const shaderType = type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
      throw new Error(
        `${shaderType} shader compilation error: ${info}\n\nSource:\n${source}`
      );
    }

    return shader;
  }
}
