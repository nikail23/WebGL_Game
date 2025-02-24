import { vec4 } from 'gl-matrix';
import { MeshWithBuffers, OBJ } from 'webgl-obj-loader';
import { anisotropicFilteringExtension, gl } from '../webgl';
import { mainProgram, shadowProgram } from '../webgl/programs/current-program';

export class Model3D {
  private _name: string;
  private _objUrl: string;
  private _textureUrl: string;
  private _defaultColor: vec4;

  private _mesh: MeshWithBuffers | null = null;
  private _texture: WebGLTexture | null = null;

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
  }

  public prepareToRender(): number {
    if (!this._mesh) {
      console.warn('GAME_prepareToRender: Mesh is not loaded!');
      return 0;
    }

    if (!mainProgram?.isActive) {
      console.warn('GAME_prepareToRender: Main program is not active!');
      return 0;
    }

    if (mainProgram.aVertexPosition !== null) {
      gl.enableVertexAttribArray(mainProgram.aVertexPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.vertexBuffer);
      gl.vertexAttribPointer(
        mainProgram.aVertexPosition,
        this._mesh.vertexBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
    }

    if (mainProgram.aNormal !== null) {
      gl.enableVertexAttribArray(mainProgram.aNormal);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.normalBuffer);
      gl.vertexAttribPointer(
        mainProgram.aNormal,
        this._mesh.normalBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
    }

    if (mainProgram.aTextureCoordinate !== null) {
      gl.enableVertexAttribArray(mainProgram.aTextureCoordinate);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.textureBuffer);
      gl.vertexAttribPointer(
        mainProgram.aTextureCoordinate,
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
      gl.uniform1i(mainProgram.uSampler, 0);
      gl.uniform1f(mainProgram.uHasTexture, 1);
    } else {
      gl.uniform1f(mainProgram.uHasTexture, 0);
      gl.uniform4fv(
        mainProgram.uColor,
        new Float32Array([
          this._defaultColor[0],
          this._defaultColor[1],
          this._defaultColor[2],
          this._defaultColor[3],
        ])
      );
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._mesh.indexBuffer);

    return this.indices;
  }

  public prepareToShadowRender(): number {
    if (!this._mesh) {
      console.warn('GAME_prepareToShadowRender: Mesh is not loaded!');
      return 0;
    }

    if (!shadowProgram.isActive) {
      console.warn('GAME_prepareToShadowRender: Shadow program is not active!');
      return 0;
    }

    if (shadowProgram.aVertexPosition !== null) {
      gl.enableVertexAttribArray(shadowProgram.aVertexPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.vertexBuffer);
      gl.vertexAttribPointer(
        shadowProgram.aVertexPosition,
        this._mesh.vertexBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._mesh.indexBuffer);

    return this.indices;
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
    if (anisotropicFilteringExtension) {
      const maxAnisotropy = gl.getParameter(
        anisotropicFilteringExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        anisotropicFilteringExtension.TEXTURE_MAX_ANISOTROPY_EXT,
        maxAnisotropy
      );
    }
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
