import { Math as Maths } from 'phaser';
import ExtensionFunctions from '../../Utils/ExtensionFunctions';

class PlayerSquisher {
  // Squisher Scales
  private static readonly PlayerMinXScale = 0.8;
  private static readonly PlayerMaxXScale = 1.2;
  private static readonly PlayerMinYScale = 0.8;
  private static readonly PlayerMaxYScale = 1.2;
  private static readonly PlayerShotMinScale = 0.5;

  // Scale Change Rate
  private static readonly PlayerJumpScaleChange = 1.5;
  private static readonly PlayerLandScaleChange = 7;
  private static readonly PlayerFallScaleChange = 7;

  private _playerTargetScale: Maths.Vector2;
  private _lerpAmount: number;

  private _morphToTarget: boolean;
  private _morphCompleted: boolean;

  private _playerScale: Maths.Vector2;
  private _scaleChangeRate: number;

  //#region Construction

  constructor() {
    this._morphCompleted = true;
    this._playerTargetScale = Maths.Vector2.ZERO;
    this._playerScale = Maths.Vector2.ONE;
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

  public playerForceSquish(xValue: number, yValue: number) {
    const xSquishAmount = ExtensionFunctions.map(Math.abs(xValue), 0, 1, 1, PlayerSquisher.PlayerShotMinScale);
    const ySquishAmount = ExtensionFunctions.map(Math.abs(yValue), 0, 1, 1, PlayerSquisher.PlayerShotMinScale);

    this._playerScale.x = xSquishAmount;
    this._playerScale.y = ySquishAmount;
  }

  public playerForceSquishComplete() {
    this._scaleChangeRate = PlayerSquisher.PlayerLandScaleChange;
    this._morphCompleted = false;
    this._morphToTarget = false;
    this._lerpAmount = 0;

    this._playerTargetScale.x = 1;
    this._playerTargetScale.y = 1;
  }

  public playerJumped() {
    this._playerTargetScale.x = PlayerSquisher.PlayerMinXScale;
    this._playerTargetScale.y = PlayerSquisher.PlayerMaxYScale;

    this._morphCompleted = false;
    this._morphToTarget = true;
    this._lerpAmount = 0;
    this._scaleChangeRate = PlayerSquisher.PlayerJumpScaleChange;
  }

  public playerLanded() {
    this._playerTargetScale.x = PlayerSquisher.PlayerMaxXScale;
    this._playerTargetScale.y = PlayerSquisher.PlayerMinYScale;

    this._morphCompleted = false;
    this._morphToTarget = true;
    this._lerpAmount = 0;
    this._scaleChangeRate = PlayerSquisher.PlayerLandScaleChange;
  }

  public playerFalling(currentFallVelocity: number, maxFallVelocity: number, deltaTime: number) {
    const xScale = ExtensionFunctions.map(currentFallVelocity, 0, maxFallVelocity, 1, PlayerSquisher.PlayerMinXScale);
    const yScale = ExtensionFunctions.map(currentFallVelocity, 0, maxFallVelocity, 1, PlayerSquisher.PlayerMaxYScale);

    if (this._morphCompleted) {
      this._playerScale.x = Maths.Linear(this._playerScale.x, xScale, PlayerSquisher.PlayerFallScaleChange * deltaTime);
      this._playerScale.y = Maths.Linear(this._playerScale.y, yScale, PlayerSquisher.PlayerFallScaleChange * deltaTime);
    }
  }

  public playerMoving(currentMovementVelocity: number, maxMovementVelocity: number, deltaTime: number) {
    const xScale = ExtensionFunctions.map(
      currentMovementVelocity,
      100,
      maxMovementVelocity,
      1,
      PlayerSquisher.PlayerMaxXScale
    );
    const yScale = ExtensionFunctions.map(
      currentMovementVelocity,
      100,
      maxMovementVelocity,
      1,
      PlayerSquisher.PlayerMinYScale
    );

    if (this._morphCompleted) {
      this._playerScale.x = Maths.Linear(this._playerScale.x, xScale, PlayerSquisher.PlayerFallScaleChange * deltaTime);
      this._playerScale.y = Maths.Linear(this._playerScale.y, yScale, PlayerSquisher.PlayerFallScaleChange * deltaTime);
    }
  }

  public get PlayerScale() {
    return this._playerScale;
  }

  //#endregion
}

export default PlayerSquisher;
