export class Floor {
  public readonly positions: number[] = [
    -10.0, 0.0, -10.0, 10.0, 0.0, -10.0, 10.0, 0.0, 10.0, -10.0, 0.0, 10.0,
  ];

  public readonly colors: number[] = [
    0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5,
    1.0,
  ];

  public readonly indices: number[] = [0, 1, 2, 0, 2, 3];
}
