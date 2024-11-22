export interface HUDElement {
  draw(ctx: CanvasRenderingContext2D): void;
  update(deltaTime: number): boolean;
}
