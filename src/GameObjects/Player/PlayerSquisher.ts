import { Math } from 'phaser';
import ExtensionFunctions from '../../Utils/ExtensionFunctions';

class PlayerSquisher {
  // Squisher Scales
  private PlayerMinXScale = 0.8;
  private PlayerMaxXScale = 1.2;
  private PlayerMinYScale = 0.8;
  private PlayerMaxYScale = 1.2;

  // Scale Change Rate
  private PlayerJumpScaleChange = 1.5;
  private PlayerLandScaleChange = 7;
  private PlayerFallScaleChange = 7;

  private _playerTargetScale: Math.Vector2;
  private _lerpAmount: number;

  private _morphToTarget: boolean;
  private _morphCompleted: boolean;

  private _playerScale: Math.Vector2;
  private _scaleChangeRate: number;

  //#region Construction

  constructor() {
    this._morphCompleted = true;
    this._playerTargetScale = Math.Vector2.ZERO;
    this._playerScale = Math.Vector2.ONE;
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    if (this._morphCompleted) {
      return;
    }

    if (this._morphToTarget) {
      this._playerScale = this._playerScale.lerp(this._playerTargetScale, this._lerpAmount);
      this._lerpAmount += this._scaleChangeRate * deltaTime;

      if (this._lerpAmount >= 0.99) {
        this._morphToTarget = false;
        this._lerpAmount = 0;

        this._playerTargetScale.x = 1;
        this._playerTargetScale.y = 1;
      }
    } else {
      this._playerScale = this._playerScale.lerp(this._playerTargetScale, this._lerpAmount);
      this._lerpAmount += this._scaleChangeRate * deltaTime;

      if (this._lerpAmount >= 0.99) {
        this._morphCompleted = true;
        this._playerScale.x = 1;
        this._playerScale.y = 1;
      }
    }
  }

  //#endregion

  //#region External Functions

  public playerJumped() {
    this._playerTargetScale.x = this.PlayerMinXScale;
    this._playerTargetScale.y = this.PlayerMaxYScale;

    this._morphCompleted = false;
    this._morphToTarget = true;
    this._lerpAmount = 0;
    this._scaleChangeRate = this.PlayerJumpScaleChange;
  }

  public playerLanded() {
    this._playerTargetScale.x = this.PlayerMaxXScale;
    this._playerTargetScale.y = this.PlayerMinYScale;

    this._morphCompleted = false;
    this._morphToTarget = true;
    this._lerpAmount = 0;
    this._scaleChangeRate = this.PlayerLandScaleChange;
  }

  public playerFalling(currentFallVelocity: number, maxFallVelocity: number, deltaTime: number) {
    const x = ExtensionFunctions.map(currentFallVelocity, 0, maxFallVelocity, 1, this.PlayerMinXScale);
    const y = ExtensionFunctions.map(currentFallVelocity, 0, maxFallVelocity, 1, this.PlayerMaxYScale);

    if (this._morphCompleted) {
      this._playerScale.x = Math.Linear(this._playerScale.x, x, this.PlayerFallScaleChange * deltaTime);
      this._playerScale.y = Math.Linear(this._playerScale.y, y, this.PlayerFallScaleChange * deltaTime);
    }
  }

  public get PlayerScale() {
    return this._playerScale;
  }

  //#endregion
}

export default PlayerSquisher;
