import { currentProgram, Game } from './core';

await currentProgram.init();

if (!currentProgram.isReady()) {
  console.warn('GAME: Program is not ready! Check some locations...');
}

const game = new Game();
game.start();
