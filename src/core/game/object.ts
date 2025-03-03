import { mat4, vec3 } from 'gl-matrix';
import { SceneData } from './scene';
import { UpdateStrategy } from './update-strategies';

export abstract class Object3D {
  public abstract type: string;
  public position = vec3.create();
  public rotation = vec3.create();
  public scale = vec3.create();
  public updateStrategy: UpdateStrategy | null = null;

  public update(deltaTime: number, sceneData: SceneData): void {
    this.updateStrategy?.update(deltaTime, this, sceneData);
  }

  public get modelMatrix(): mat4 {
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);
    mat4.scale(modelMatrix, modelMatrix, this.scale);

    return modelMatrix;
  }
}
