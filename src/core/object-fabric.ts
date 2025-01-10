import { Object3DModel } from './object-model';
import { ShaderProgram } from './shader';
import { Object3DModelData } from './object-model-data';
import { Object3D } from './object';
import { mat4 } from 'gl-matrix';

export class Object3DFabric {
  private _gl: WebGLRenderingContext;
  private _shaderProgram: ShaderProgram;
  private _models: { [key: string]: Object3DModel } = {};
  private _objects: { [key: string]: Object3D } = {};

  public constructor(gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
    this._gl = gl;
    this._shaderProgram = shaderProgram;
  }

  public createModel(modelData: Object3DModelData, modelName: string): void {
    const model = new Object3DModel(modelData, this._gl, this._shaderProgram);
    this._models[modelName] = model;
  }

  public getModel(modelName: string): Object3DModel {
    return this._models[modelName];
  }

  public createObject(name: string, modelName: string): Object3D {
    const model = this._models[modelName];

    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    const object = new Object3D(model, this._gl, this._shaderProgram);
    this._objects[name] = object;
    return object;
  }

  public async renderObject(name: string, viewMatrix: mat4): Promise<void> {
    const object = this._objects[name];
    if (object) {
      await object.render(viewMatrix);
    }
  }
}
