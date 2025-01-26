import { gl } from '../context';

export abstract class Program {
  protected program: WebGLProgram;
  protected locations: {
    attributes: { [key: string]: number };
    uniforms: { [key: string]: WebGLUniformLocation | null };
  } = {
    attributes: {},
    uniforms: {},
  };

  public abstract init(): Promise<void>;

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

    gl.useProgram(shaderProgram);

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
      throw new Error('Shader compilation error: ' + info);
    }

    return shader;
  }
}
