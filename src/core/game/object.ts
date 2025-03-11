import { mat4, vec3, vec4 } from 'gl-matrix';
import { SceneData } from './scene';
import { UpdateStrategy } from './update-strategies';
import { MeshWithBuffers } from 'webgl-obj-loader';

export class Object3D {
  public type = 'Object3D';
  public visible = true;
  public position = vec3.create();
  public rotation = vec3.create();
  public scale = vec3.create();
  public updateStrategy: UpdateStrategy | null = null;
  public mesh?: MeshWithBuffers;
  public textureScale = 1;
  public baseColor = vec4.fromValues(
    Math.random(),
    Math.random(),
    Math.random(),
    1
  );
  public baseColorValue = 1;
  public texture: WebGLTexture | null = null;

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
