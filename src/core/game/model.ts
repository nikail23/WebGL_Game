import { vec4 } from 'gl-matrix';
import { MeshWithBuffers, OBJ } from 'webgl-obj-loader';
import { gl } from '../webgl';
import { currentProgram } from '../webgl/programs/current-program';

export class Model3D {
  private _name: string;
  private _objUrl: string;
  private _textureUrl: string;
  private _defaultColor: vec4;

  private _mesh: MeshWithBuffers | null = null;
  private _texture: WebGLTexture | null = null;

  private _aVertexPosition: number | null = null;
  private _aNormal: number | null = null;
  private _aTextureCoordinate: number | null = null;

  private _uHasTexture: WebGLUniformLocation | null = null;
  private _uSampler: WebGLUniformLocation | null = null;
  private _uColor: WebGLUniformLocation | null = null;

  public get indices(): number {
    return this._mesh?.indices.length ?? 0;
  }

  public get name(): string {
    return this._name;
  }

  public constructor(
    name: string,
    objUrl: string,
    textureUrl: string,
    defaultColor: vec4
  ) {
    this._name = name;
    this._objUrl = objUrl;
    this._textureUrl = textureUrl;
    this._defaultColor = defaultColor;

    if (gl && currentProgram) {
      this._aVertexPosition = currentProgram.aVertexPosition;
      this._aNormal = currentProgram.aNormal;
      this._aTextureCoordinate = currentProgram.aTextureCoordinate;
      this._uHasTexture = currentProgram.uHasTexture;
      this._uSampler = currentProgram.uSampler;
      this._uColor = currentProgram.uColor;
    }
  }

  public prepareToRender(): boolean {
    if (!this._mesh) {
      console.warn('GAME: Mesh is not loaded!');
      return false;
    }

    if (gl && currentProgram) {
      if (this._aVertexPosition !== null) {
        gl.enableVertexAttribArray(this._aVertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.vertexBuffer);
        gl.vertexAttribPointer(
          this._aVertexPosition,
          this._mesh.vertexBuffer.itemSize,
          gl.FLOAT,
          false,
          0,
          0
        );
      }

      if (this._aNormal !== null) {
        gl.enableVertexAttribArray(this._aNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.normalBuffer);
        gl.vertexAttribPointer(
          this._aNormal,
          this._mesh.normalBuffer.itemSize,
          gl.FLOAT,
          false,
          0,
          0
        );
      }

      if (this._aTextureCoordinate !== null) {
        gl.enableVertexAttribArray(this._aTextureCoordinate);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.textureBuffer);
        gl.vertexAttribPointer(
          this._aTextureCoordinate,
          this._mesh.textureBuffer.itemSize,
          gl.FLOAT,
          false,
          0,
          0
        );
      }

      if (this._mesh.textures?.length) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.uniform1i(this._uSampler, 0);
        gl.uniform1f(this._uHasTexture, 1);
      } else {
        gl.uniform1f(this._uHasTexture, 0);
        gl.uniform4fv(
          this._uColor,
          new Float32Array([
            this._defaultColor[0],
            this._defaultColor[1],
            this._defaultColor[2],
            this._defaultColor[3],
          ])
        );
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._mesh.indexBuffer);

      return true;
    }

    return false;
  }

  public async load(): Promise<void> {
    if (this._objUrl) {
      await fetch(this._objUrl)
        .then((response) => response.text())
        .then((objData) => OBJ.initMeshBuffers(gl, new OBJ.Mesh(objData)))
        .then((mesh) => (this._mesh = mesh))
        .then(() => this._initTexture())
        .catch((error) => console.error('Error loading .obj file:', error));
    }
  }

  private _initTexture(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._texture = gl.createTexture();
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (this._texture) {
          this._handleLoadedTexture(this._texture, image);
        }
        resolve();
      };
      image.src = this._textureUrl;
    });
  }

  private _handleLoadedTexture(
    texture: WebGLTexture,
    image: HTMLImageElement
  ): void {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
