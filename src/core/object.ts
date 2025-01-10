import { mat4 } from 'gl-matrix';
import { Object3DModel } from './object-model';
import { ShaderProgram } from './shader';

export class Object3D {
  private _model: Object3DModel;
  private _modelMatrix: mat4;
  private _gl: WebGLRenderingContext;
  private _shaderProgram: ShaderProgram;

  public constructor(
    model: Object3DModel,
    gl: WebGLRenderingContext,
    shaderProgram: ShaderProgram
  ) {
    this._model = model;
    this._modelMatrix = mat4.create();
    this._gl = gl;
    this._shaderProgram = shaderProgram;
  }

  public setTransformations(transformations: mat4): void {
    this._modelMatrix = transformations;
  }

  public async render(viewMatrix: mat4): Promise<void> {
    this._model.bindBuffers();

    await this._model.bindTexture();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, this._modelMatrix);

    const modelViewLocation =
      this._shaderProgram.getUniformLocation('uModelViewMatrix');
    this._gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);

    this._gl.drawElements(
      this._gl.TRIANGLES,
      this._model.indices,
      this._gl.UNSIGNED_SHORT,
      0
    );
  }
}
