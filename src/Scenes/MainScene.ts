import { Scene, Math, Types } from 'phaser';

import GameConstants from '../Utils/GameConstants';
import Player from '../GameObjects/Player/Player';
import StaticBlocks from '../GameObjects/World/StaticBlocks';
import AssetDatabase from '../Utils/AssetDatabase';

class MainScene extends Scene {
  private _player: Player;
  private _ground: StaticBlocks;

  //#region Construction

  constructor() {
    super({ key: GameConstants.MainSceneName });
  }

  preload() {
    this.load.image(AssetDatabase.WhitePixelString, AssetDatabase.WhitePixel);
  }

  create() {
    this.createPlayer();
    this.createGround();

    this.setupColliders();
  }

  private createPlayer() {
    this._player = new Player(new Math.Vector2(400, 300), new Math.Vector2(50, 50), 0xff0000, this);
    this._player.setupInput(this.input);
  }

  private createGround() {
    const groundHeight = 20;
    this._ground = new StaticBlocks(
      new Math.Vector2(GameConstants.Width / 2, GameConstants.Height - groundHeight / 2),
      new Math.Vector2(GameConstants.Width, groundHeight),
      0x00ff00,
      this
    );
  }

  private setupColliders() {
    this.physics.add.collider(this._player.getBody(), this._ground.getBody(), () => {
      this._player.onPlayerGrounded();
    });
  }

  //#endregion

  //#region Update

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    this._player.update(deltaTime);
  }

  //#endregion
}

export default MainScene;
