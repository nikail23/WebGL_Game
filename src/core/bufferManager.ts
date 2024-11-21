import { ShaderProgram } from "./shader";

export class BufferManager {
  private gl: WebGLRenderingContext;
  private objectBuffers: Map<
    string,
    {
      position: WebGLBuffer;
      color: WebGLBuffer;
      index: WebGLBuffer;
      indexCount: number;
    }
  > = new Map();

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public initObjectBuffers(
    name: string,
    positions: number[],
    colors: number[],
    indices: number[]
  ) {
    const positionBuffer = this.gl.createBuffer();
    const colorBuffer = this.gl.createBuffer();
    const indexBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(colors),
      this.gl.STATIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );

    this.objectBuffers.set(name, {
      position: positionBuffer!,
      color: colorBuffer!,
      index: indexBuffer!,
      indexCount: indices.length,
    });
  }

  public bindObjectBuffers(name: string, shaderProgram: ShaderProgram) {
    const buffers = this.objectBuffers.get(name);
    if (!buffers) return;

    const positionLocation = shaderProgram.getAttribLocation("aVertexPosition");
    const colorLocation = shaderProgram.getAttribLocation("aVertexColor");

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
    this.gl.vertexAttribPointer(
      positionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(positionLocation);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
    this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(colorLocation);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    return buffers.indexCount;
  }
}
