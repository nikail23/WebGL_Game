import { HUDElement } from './hud-element';

// src/ui/hud.ts
export class HUD {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private elements: HUDElement[] = [];

  public constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  public addElement(element: HUDElement): void {
    this.elements.push(element);
  }

  public removeElement(element: HUDElement): void {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  public update(deltaTime: number): void {
    this.elements = this.elements.filter((element) =>
      element.update(deltaTime)
    );
  }

  public draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.elements.forEach((element) => element.draw(this.ctx));
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public dispose(): void {
    window.removeEventListener('resize', this.resize.bind(this));
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.elements = [];
  }
}
