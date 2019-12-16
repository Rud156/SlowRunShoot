import 'phaser';
import { Types } from 'phaser';

// main game configuration
const config: Types.Core.GameConfig = {
  width: 200,
  height: 200,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  input: {
    gamepad: true,
  },
};

// game class
export class Game extends Phaser.Game {
  constructor(config: Types.Core.GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  const game = new Game(config);
});
