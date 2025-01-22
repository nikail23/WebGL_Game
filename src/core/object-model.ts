import { vec4 } from 'gl-matrix';
import { ShaderProgram } from './shader';
import { MeshWithBuffers, OBJ } from 'webgl-obj-loader';

export class Object3DModel {
  private _gl: WebGLRenderingContext;
  private _shaderProgram: ShaderProgram;
  private _url: string;
  private _textureUrl: string;
  private _defaultColor: vec4;

  private _mesh: MeshWithBuffers;
  private _texture: WebGLTexture;

  private _aVertexPosition: number;
  private _aTextureCoordinate: number;

  private _uHasTexture: WebGLUniformLocation;
  private _uSampler: WebGLUniformLocation;
  private _uColor: WebGLUniformLocation;

  public get indices(): number {
    return this._mesh?.indices.length ?? 0;
  }

  public constructor(
    url: string,
    defaultColor: vec4,
    gl: WebGLRenderingContext,
    shaderProgram: ShaderProgram
  ) {
    this._gl = gl;
    this._shaderProgram = shaderProgram;
    this._url = url;
    this._textureUrl = url.replace('.obj', '.jpg');
    this._defaultColor = defaultColor;

    if (this._shaderProgram) {
      this._aVertexPosition =
        this._shaderProgram.getAttribLocation('aVertexPosition');
      this._aTextureCoordinate =
        this._shaderProgram.getAttribLocation('aTextureCoordinate');
      this._uHasTexture = this._shaderProgram.getUniformLocation('uHasTexture');
      this._uSampler = this._shaderProgram.getUniformLocation('uSampler');
      this._uColor = this._shaderProgram.getUniformLocation('uColor');
    }
  }

  public prepareToRender(): boolean {
    console.log('prepareToRender');
    if (this._mesh && this._shaderProgram) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._mesh.vertexBuffer);
      this._gl.enableVertexAttribArray(this._aVertexPosition);
      this._gl.vertexAttribPointer(
        this._aVertexPosition,
        3,
        this._gl.FLOAT,
        false,
        0,
        0
      );

      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._mesh.textureBuffer);
      this._gl.enableVertexAttribArray(this._aTextureCoordinate);
      this._gl.vertexAttribPointer(
        this._aTextureCoordinate,
        2,
        this._gl.FLOAT,
        false,
        0,
        0
      );

      if (this._mesh.textures?.length) {
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
        this._gl.uniform1i(this._uSampler, 0);
        this._gl.uniform1i(this._uHasTexture, 1);
      } else {
        this._gl.uniform1i(this._uHasTexture, 0);
        this._gl.uniform4fv(this._uColor, this._defaultColor);
      }

      this._gl.bindBuffer(
        this._gl.ELEMENT_ARRAY_BUFFER,
        this._mesh.indexBuffer
      );

      return true;
    }

    return false;
  }

  public async load(): Promise<void> {
    if (this._url) {
      await fetch(this._url)
        .then((response) => response.text())
        .then((objData) => OBJ.initMeshBuffers(this._gl, new OBJ.Mesh(objData)))
        .then((mesh) => (this._mesh = mesh))
        .then(() => this._initTexture())
        .catch((error) => console.error('Error loading .obj file:', error));
    }
  }

  private _initTexture(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._texture = this._gl.createTexture();
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        this._handleLoadedTexture(this._texture, image);
        resolve();
      };
      image.src = this._textureUrl;
    });
  }

  private _handleLoadedTexture(
    texture: WebGLTexture,
    image: HTMLImageElement
  ): void {
    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);
    this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
    this._gl.texImage2D(
      this._gl.TEXTURE_2D,
      0,
      this._gl.RGBA,
      this._gl.RGBA,
      this._gl.UNSIGNED_BYTE,
      image
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MAG_FILTER,
      this._gl.LINEAR
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MIN_FILTER,
      this._gl.LINEAR_MIPMAP_LINEAR
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_S,
      this._gl.MIRRORED_REPEAT
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_T,
      this._gl.MIRRORED_REPEAT
    );
    this._gl.generateMipmap(this._gl.TEXTURE_2D);

    this._gl.bindTexture(this._gl.TEXTURE_2D, null);
  }
}
