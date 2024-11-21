export class ShaderLoader {
  public static async loadShaders(): Promise<{ vs: string; fs: string }> {
    const vsResponse = await fetch("/src/shaders/vertex.glsl");
    const fsResponse = await fetch("/src/shaders/fragment.glsl");

    const vs = await vsResponse.text();
    const fs = await fsResponse.text();

    return { vs, fs };
  }
}
