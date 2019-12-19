import { Input, Types } from 'phaser';

export class PlayerController {
  private _keyboardCursorKeys: Types.Input.Keyboard.CursorKeys;
  private _spaceKey: Input.Keyboard.Key;
  private _dashKey: Input.Keyboard.Key;

  private _playerDirection: IPlayerDirection;
  private _input: Input.InputPlugin;

  private _jumpPressed;
  private _dashPressed;

  //#region Construction

  constructor(input: Input.InputPlugin) {
    this._input = input;
    this._playerDirection = {
      xValue: 0,
      yValue: 0,
    };

    this._keyboardCursorKeys = input.keyboard.createCursorKeys();
    this._spaceKey = input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    this._dashKey = input.keyboard.addKey(Input.Keyboard.KeyCodes.E);
  }

  //#endregion

  //#region Update

  public update() {
    this._jumpPressed = false;
    this._dashPressed = false;

    if (this._keyboardCursorKeys.left.isDown) {
      this._playerDirection.xValue = -1;
    } else if (this._keyboardCursorKeys.right.isDown) {
      this._playerDirection.xValue = 1;
    } else {
      this._playerDirection.xValue = 0;
    }

    if (this._keyboardCursorKeys.down.isDown) {
      this._playerDirection.yValue = 1;
    } else if (this._keyboardCursorKeys.up.isDown) {
      this._playerDirection.yValue = -1;
    } else {
      this._playerDirection.yValue = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(this._spaceKey)) {
      this._jumpPressed = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this._dashKey)) {
      this._dashPressed = true;
    }
  }

  //#endregion

  //#region External Functions

  public get PlayerDirection() {
    return this._playerDirection;
  }

  public get PlayerJumped() {
    return this._jumpPressed;
  }

  public get PlayerDashed() {
    return this._dashPressed;
  }

  //#endregion
}

interface IPlayerDirection {
  xValue: number;
  yValue: number;
}
