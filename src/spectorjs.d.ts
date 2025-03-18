declare module 'spectorjs' {
  export class Spector {
    public constructor();
    public displayUI(): void;
    public startCapture(canvas: HTMLCanvasElement, commandCount?: number): void;
    public captureCanvas(canvas: HTMLCanvasElement): void;
    public stopCapture(): void;
    public spyCanvases(): void;
    public onCaptureStarted: (capture: any) => void;
    public onCapture: (capture: any) => void;
    public onError: (message: string) => void;
    public clearCapture(): void;
    public pauseCapture(): void;
    public resumeCapture(): void;
  }
}
