import PlayerSquisher from './PlayerSquisher';

class PlayerCollision {
  private _isGrounded: boolean;
  private _playerSquisher: PlayerSquisher;

  //#region Construction

  constructor() {
    this._isGrounded = false;
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
  }

  public onPlayerJumped() {
    this._isGrounded = false;
    this._playerSquisher.playerJumped();
  }

  //#endregion
}

export default PlayerCollision;
