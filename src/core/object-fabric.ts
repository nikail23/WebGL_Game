import { Object3DModel } from './object-model';
import { ShaderProgram } from './shader';
import { Object3D } from './object';
import { mat4, vec4 } from 'gl-matrix';

export class Object3DFabric {
  private _gl: WebGLRenderingContext;
  private _shaderProgram: ShaderProgram;
  private _models: { [key: string]: Object3DModel } = {};
  private _objects: { [key: string]: Object3D } = {};

  public constructor(gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
    this._gl = gl;
    this._shaderProgram = shaderProgram;
  }

  public async createModel(
    url: string,
    defaultColor: vec4,
    modelName: string
  ): Promise<void> {
    const model = new Object3DModel(
      url,
      defaultColor,
      this._gl,
      this._shaderProgram
    );

    await model.load();

    this._models[modelName] = model;
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
