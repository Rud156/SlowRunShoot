import PlayerSquisher from './PlayerSquisher';
import Player from './Player';
import { Scene, Physics } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';

class PlayerCollision {
  private static readonly ColliderSize = 20;

  private _isGrounded: boolean;
  private _prevIsGrounded: boolean;
  private _playerSquisher: PlayerSquisher;

  private _playerCollider: Physics.Arcade.Sprite;
  private _playerSelfCollider: Physics.Arcade.Sprite;
  private _playerParent: Player;

  //#region Construction

  constructor(playerParent: Player, scene: Scene) {
    this._isGrounded = null;
    this._playerParent = playerParent;

    this.createCollider(scene);
  }

  private createCollider(scene: Scene) {
    this._playerCollider = scene.physics.add.sprite(0, 0, AssetDatabase.WhitePixelString);
    this._playerCollider.setVisible(false);
    this._playerCollider.setSize(PlayerCollision.ColliderSize, PlayerCollision.ColliderSize * 1.5);
    this._playerCollider.setDisplaySize(PlayerCollision.ColliderSize, PlayerCollision.ColliderSize * 1.5);

    this._playerSelfCollider = scene.physics.add.sprite(0, 0, AssetDatabase.WhitePixelString);
    this._playerSelfCollider.setVisible(false);
    this._playerSelfCollider.setSize(PlayerCollision.ColliderSize, PlayerCollision.ColliderSize);
    this._playerSelfCollider.setDisplaySize(PlayerCollision.ColliderSize, PlayerCollision.ColliderSize);

    // @ts-ignore
    this._playerCollider.body.setAllowGravity(false);

    //@ts-ignore
    this._playerSelfCollider.body.setAllowGravity(false);
  }

  //#endregion

  //#region External Functions

  public getCollider() {
    return this._playerCollider;
  }

  public getSelfCollider() {
    return this._playerSelfCollider;
  }

  public setColliderPosition(xPosition: number, yPosition: number) {
    this._playerCollider.setPosition(xPosition, yPosition);
  }

  public setSelfColliderPosition(xPosition: number, yPosition: number) {
    this._playerSelfCollider.setPosition(xPosition, yPosition);
  }

  public onPlayerSelfCollisionUpdate() {
    if (this._prevIsGrounded !== this._isGrounded) {
      this._isGrounded = this._prevIsGrounded;

      if (this._isGrounded) {
        this._playerSquisher.playerLanded();
        this._playerParent.playLandEffect();
      }
    }

    this.forceInAir();
  }

  public onGroundCollision() {
    this._prevIsGrounded = true;
  }

  public setPlayerSquisher(playerSquisher: PlayerSquisher) {
    this._playerSquisher = playerSquisher;
  }

  public onPlayerJumped() {
    this._isGrounded = false;
    this._playerSquisher.playerJumped();
  }

  //#endregion

  //#region Utility Functions

  private forceInAir() {
    this._prevIsGrounded = false;
  }

  //#endregion
}

export default PlayerCollision;
