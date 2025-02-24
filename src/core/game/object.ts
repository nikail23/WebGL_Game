import { mat3, mat4, vec3 } from 'gl-matrix';
import { Model3D } from './model';
import { gl, mainProgram, shadowProgram } from '../webgl';
import { SceneData } from './scene/scene-data';
import { UpdateStrategy } from './update-strategies/strategy';

export class Object3D {
  private _model: Model3D | null = null;
  private _updateStrategy: UpdateStrategy | null = null;

  public constructor(
    public position = vec3.create(),
    public rotation = vec3.create(),
    public scale = vec3.create(),
    public textureScale = 1,
    model?: Model3D,
    updateStrategy?: UpdateStrategy
  ) {
    if (model) {
      this._model = model;
    }

    if (updateStrategy) {
      this._updateStrategy = updateStrategy;
    }

    if (this._updateStrategy?.init) {
      this._updateStrategy.init(this);
    }
  }

  public async render(viewMatrix: mat4): Promise<void> {
    const indices = await this._model?.prepareToRender();

    if (!mainProgram?.isActive) {
      console.warn('GAME_render: Main program is not active!');
      return;
    }

    if (!indices) {
      console.warn('GAME_render: Indices are not loaded!');
      return;
    }

    const modelMatrix = this._getModelMatrix();

    const normalMatrix = mat3.create();
    const viewModelMatrix = mat4.create();
    mat4.multiply(viewModelMatrix, viewMatrix, modelMatrix);
    mat3.normalFromMat4(normalMatrix, viewModelMatrix);

    const uModelMatrix = mainProgram.getUniform('uModelMatrix');
    const uNormalMatrix = mainProgram.getUniform('uNormalMatrix');
    const uTextureScale = mainProgram.getUniform('uTextureScale');

    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
    gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);
    gl.uniform1f(uTextureScale, this.textureScale);

    gl.drawElements(gl.TRIANGLES, indices, gl.UNSIGNED_SHORT, 0);
  }

  public async renderShadow(): Promise<void> {
    const indices = await this._model?.prepareToShadowRender();

    if (!shadowProgram?.isActive) {
      console.warn('GAME_renderShadow: Shadow program is not active!');
      return;
    }

    if (!indices) {
      console.warn('GAME_renderShadow: Indices are not loaded!');
      return;
    }

    const modelMatrix = this._getModelMatrix();

    const uModelMatrix = shadowProgram.getUniform('uModelMatrix');

    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

    gl.drawElements(gl.TRIANGLES, indices, gl.UNSIGNED_SHORT, 0);
  }

  public update(deltaTime: number, sceneData: SceneData): void {
    if (this._updateStrategy) {
      this._updateStrategy.update(deltaTime, this, sceneData);
    }
  }

  private _getModelMatrix(): mat4 {
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);
    mat4.scale(modelMatrix, modelMatrix, this.scale);

    return modelMatrix;
  }
}
