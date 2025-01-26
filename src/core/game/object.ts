import { mat4, quat, vec3 } from 'gl-matrix';
import { Model3D } from './model';
import { gl, currentProgram } from '../webgl';
import { SceneData } from './scene/scene-data';
import { UpdateStrategy } from './update-strategies/strategy';

export class Object3D {
  private _model: Model3D;
  private _position = vec3.create();
  private _rotation = vec3.create();
  private _scale = vec3.create();

  private _updateStrategy: UpdateStrategy;

  public get position(): vec3 {
    return this._position;
  }

  public set position(value: vec3) {
    vec3.copy(this._position, value);
  }

  public get rotation(): vec3 {
    return this._rotation;
  }

  public set rotation(value: vec3) {
    vec3.copy(this._rotation, value);
  }

  public get scale(): vec3 {
    return this._scale;
  }

  public set scale(value: vec3) {
    vec3.copy(this._scale, value);
  }

  public constructor(model?: Model3D, updateStrategy?: UpdateStrategy) {
    this._model = model;
    this._updateStrategy = updateStrategy;

    if (this._updateStrategy?.init) {
      this._updateStrategy.init(this);
    }
  }

  public async render(viewMatrix: mat4): Promise<void> {
    if (this._model) {
      const modelPrepared = await this._model?.prepareToRender();

      if (gl && currentProgram && modelPrepared) {
        this._setViewModelMatrix(viewMatrix);

        gl.drawElements(
          gl.TRIANGLES,
          this._model.indices,
          gl.UNSIGNED_SHORT,
          0
        );
      }
    }
  }

  public update(deltaTime: number, sceneData?: SceneData): void {
    if (this._updateStrategy) {
      this._updateStrategy.update(deltaTime, this, sceneData);
    }
  }

  private _setViewModelMatrix(viewMatrix: mat4): void {
    const viewModelMatrix = mat4.create();

    const modelMatrix = this._getModelMatrix();

    mat4.multiply(viewModelMatrix, viewMatrix, modelMatrix);

    gl.uniformMatrix4fv(
      currentProgram.uViewModelMatrix,
      false,
      viewModelMatrix
    );
  }

  private _getModelMatrix(): mat4 {
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, this._position);
    mat4.rotateX(modelMatrix, modelMatrix, this._rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, this._rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, this._rotation[2]);
    mat4.scale(modelMatrix, modelMatrix, this._scale);

    return modelMatrix;
  }
}
