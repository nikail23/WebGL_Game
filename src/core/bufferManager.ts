import { Buffer } from "./buffer";
import { ShaderProgram } from "./shader";

export class BufferManager {
  private gl: WebGLRenderingContext;
  private positionBuffer: Buffer;
  private colorBuffer: Buffer;
  private indexBuffer: Buffer;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.positionBuffer = new Buffer(gl);
    this.colorBuffer = new Buffer(gl);
    this.indexBuffer = new Buffer(gl);
  }

  public initBuffers(
    positions: number[],
    colors: number[],
    indices: number[]
  ): void {
    this.positionBuffer.setData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW
    );
    this.colorBuffer.setData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(colors),
      this.gl.STATIC_DRAW
    );
    this.indexBuffer.setData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );
  }

  public bindBuffers(shaderProgram: ShaderProgram): void {
    const program = shaderProgram.WebGlProgram;
    const positionLocation = this.gl.getAttribLocation(
      program,
      "aVertexPosition"
    );
    const colorLocation = this.gl.getAttribLocation(program, "aVertexColor");

    this.positionBuffer.setupAttribute(
      positionLocation,
      this.gl.ARRAY_BUFFER,
      3
    );
    this.colorBuffer.setupAttribute(colorLocation, this.gl.ARRAY_BUFFER, 4);
    this.indexBuffer.bind(this.gl.ELEMENT_ARRAY_BUFFER);
  }
}
