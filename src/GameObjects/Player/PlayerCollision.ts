import PlayerSquisher from './PlayerSquisher';
import Player from './Player';

class PlayerCollision {
  private _isGrounded: boolean;
  private _playerSquisher: PlayerSquisher;

  private _playerParent: Player;

  //#region Construction

  constructor(playerParent: Player) {
    this._isGrounded = false;
    this._playerParent = playerParent;
  }

  //#endregion

  //#region External Functions

  public setPlayerSquisher(playerSquisher: PlayerSquisher) {
    this._playerSquisher = playerSquisher;
  }

  public onGroundCollision() {
    if (this._isGrounded) {
      return;
    }

    this._isGrounded = true;
    this._playerSquisher.playerLanded();
    this._playerParent.playLandEffect();
  }

  public onPlayerJumped() {
    this._isGrounded = false;
    this._playerSquisher.playerJumped();
  }

  //#endregion
}

export default PlayerCollision;
