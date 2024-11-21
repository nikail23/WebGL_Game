export class Buffer {
  private gl: WebGLRenderingContext;
  private buffer: WebGLBuffer | null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
  }

  public bind(target: number): void {
    this.gl.bindBuffer(target, this.buffer);
  }

  public setData(
    target: number,
    data: Float32Array | Uint16Array,
    usage: number
  ): void {
    this.bind(target);
    this.gl.bufferData(target, data, usage);
  }

  public setupAttribute(
    location: number,
    target: number,
    numComponents: number,
    type: number = WebGLRenderingContext.FLOAT,
    normalize: boolean = false,
    stride: number = 0,
    offset: number = 0
  ): void {
    this.bind(target);
    this.gl.vertexAttribPointer(
      location,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(location);
  }
}
