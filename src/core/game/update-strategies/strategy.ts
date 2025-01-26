import { Object3D } from '../object';
import { SceneData } from '../scene/scene-data';

export abstract class UpdateStrategy {
  public init?(current: Object3D): void;

  public abstract update(
    deltaTime: number,
    current: Object3D,
    sceneData: SceneData
  ): void;
}
