import { ShaderProgram } from './shader';
import { Object3DModelData } from './object-model-data';

export class Object3DModel {
  protected readonly data: Object3DModelData;

  private _gl: WebGLRenderingContext;
  private _shaderProgram: ShaderProgram;

  private _positionBuffer: WebGLBuffer | null = null;
  private _uvBuffer: WebGLBuffer | null = null;
  private _colorBuffer: WebGLBuffer | null = null;
  private _indexBuffer: WebGLBuffer | null = null;

  private _texture: WebGLTexture | null = null;

  public get indices(): number {
    return this.data.indices.length;
  }

  public constructor(
    data: Object3DModelData,
    gl: WebGLRenderingContext,
    shaderProgram: ShaderProgram
  ) {
    this.data = data;

    this._gl = gl;
    this._shaderProgram = shaderProgram;

    this._initObjectBuffers();

    if (this.data.texture) {
      this._createTexture(this.data.texture);
    }
  }

  public bindBuffers(): void {
    this._loadObjectBuffers();
  }

  public async bindTexture(): Promise<void> {
    await this._loadTexture();
  }

  private _loadObjectBuffers(): void {
    const positionLocation =
      this._shaderProgram.getAttribLocation('aVertexPosition');
    const colorLocation = this._shaderProgram.getAttribLocation('aVertexColor');
    const uvLocation = this._shaderProgram.getAttribLocation('aTextureCoord');

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._positionBuffer);
    this._gl.enableVertexAttribArray(positionLocation);
    this._gl.vertexAttribPointer(
      positionLocation,
      3,
      this._gl.FLOAT,
      false,
      0,
      0
    );

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._colorBuffer);
    this._gl.enableVertexAttribArray(colorLocation);
    this._gl.vertexAttribPointer(colorLocation, 4, this._gl.FLOAT, false, 0, 0);

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._uvBuffer);
    this._gl.enableVertexAttribArray(uvLocation);
    this._gl.vertexAttribPointer(uvLocation, 2, this._gl.FLOAT, false, 0, 0);

    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
  }

  private _initObjectBuffers(): void {
    this._positionBuffer = this._gl.createBuffer();
    this._uvBuffer = this._gl.createBuffer();
    this._colorBuffer = this._gl.createBuffer();
    this._indexBuffer = this._gl.createBuffer();

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._positionBuffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(this.data.positions),
      this._gl.STATIC_DRAW
    );

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._colorBuffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(this.data.colors),
      this._gl.STATIC_DRAW
    );

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._uvBuffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(this.data.uv),
      this._gl.STATIC_DRAW
    );

    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    this._gl.bufferData(
      this._gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.data.indices),
      this._gl.STATIC_DRAW
    );
  }

  private _createTexture(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = path;
      image.onload = () => {
        this._texture = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
        this._gl.texImage2D(
          this._gl.TEXTURE_2D,
          0,
          this._gl.RGBA,
          this._gl.RGBA,
          this._gl.UNSIGNED_BYTE,
          image
        );
        this._gl.generateMipmap(this._gl.TEXTURE_2D);
        this._gl.texParameteri(
          this._gl.TEXTURE_2D,
          this._gl.TEXTURE_MIN_FILTER,
          this._gl.LINEAR
        );
        this._gl.texParameteri(
          this._gl.TEXTURE_2D,
          this._gl.TEXTURE_MAG_FILTER,
          this._gl.LINEAR
        );
        this._gl.texParameteri(
          this._gl.TEXTURE_2D,
          this._gl.TEXTURE_WRAP_S,
          this._gl.REPEAT
        );
        this._gl.texParameteri(
          this._gl.TEXTURE_2D,
          this._gl.TEXTURE_WRAP_T,
          this._gl.REPEAT
        );
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);

        if (this._texture) {
          resolve();
        } else {
          reject(new Error('Failed to create texture'));
        }
      };
    });
  }

  private _loadTexture(): void {
    if (this._texture) {
      this._gl.activeTexture(this._gl.TEXTURE0);
      this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);

      const samplerLocation =
        this._shaderProgram.getUniformLocation('uSampler');
      this._gl.uniform1i(samplerLocation, 0);
    }
  }
}
