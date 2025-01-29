import { Camera } from '../camera';
import { Light } from '../light';
import { Model3D } from '../model';
import { Object3D } from '../object';
import { SceneData } from './scene-data';
import { SceneParams } from './scene-params';

export class Scene {
  private _models: Model3D[] = [];
  private _objects: Object3D[] = [];
  private _camera = new Camera();
  private _light: Light | null = null;

  constructor(params: SceneParams) {
    this._initScene(params);
  }

  public async render(): Promise<void> {
    const viewMatrix = this._camera.getViewMatrix();

    this._light?.prepareToRender();

    for (const object of this._objects) {
      await object.render(viewMatrix);
    }
  }

  public update(deltaTime: number): void {
    const sceneData = this._getSceneData();

    this._camera.update(deltaTime, sceneData);

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

  private async _initScene(params: SceneParams): Promise<void> {
    if (params.camera?.position) {
      this._camera.position = params.camera.position;
    }

    if (params.camera?.rotation) {
      this._camera.rotation = params.camera.rotation;
    }

    this._models = params.models ?? [];
    if (this._models.length) {
      await this._loadModels();
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

    if (params.light) {
      this._light = new Light();
      this._light.position = params.light.position;
    }
  }
}
