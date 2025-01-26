import { Camera } from '../camera';
import { Model3D } from '../model';
import { Object3D } from '../object';
import { SceneData } from './scene-data';
import { SceneParams } from './scene-params';

export class Scene {
  private _models: Model3D[];
  private _objects: Object3D[];
  private _camera: Camera;

  constructor(params: SceneParams) {
    this._objects = [];
    this._models = [];
    this._camera = new Camera();

    if (params.camera) {
      this._camera.position = params.camera.position;
      this._camera.rotation = params.camera.rotation;
    }

    this._models = params.models ?? [];
    if (this._models.length) {
      this._loadModels();
    }

    params.objects.forEach((objectParams) => {
      const model = this._models.find(
        (model) => model.name === objectParams.model
      );

      if (!model) {
        throw new Error(`Model ${objectParams.model} not found`);
      }

      const object = new Object3D(model, objectParams.strategy);
      object.position = objectParams.position;
      object.rotation = objectParams.rotation;
      object.scale = objectParams.scale;

      this._objects.push(object);
    });
  }

  public async render(): Promise<void> {
    const viewMatrix = this._camera.getViewMatrix();
    for (const object of this._objects) {
      await object.render(viewMatrix);
    }
  }

  public update(deltaTime: number): void {
    this._camera.update(deltaTime);

    const sceneData = this._getSceneData();

    this._objects.forEach((object) => object.update(deltaTime, sceneData));
  }

  private async _loadModels(): Promise<void> {
    await Promise.all(this._models.map((model) => model.load()));
  }

  private _getSceneData(): SceneData {
    return {
      camera: this._camera,
      objects: this._objects,
    };
  }
}
