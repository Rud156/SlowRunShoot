import { Input, Types } from 'phaser';

export class PlayerController {
  private _keyboardCursorKeys: Types.Input.Keyboard.CursorKeys;
  private _spaceKey: Input.Keyboard.Key;

  private _playerDirection: PlayerDirection;
  private _input: Input.InputPlugin;

  private _jumpPressed;

  //#region Construction

  constructor(input: Input.InputPlugin) {
    this._input = input;
    this._playerDirection = PlayerDirection.None;

    this._keyboardCursorKeys = input.keyboard.createCursorKeys();
    this._spaceKey = input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
  }

  //#endregion

  //#region Update

  public update() {
    this._jumpPressed = false;

    if (this._keyboardCursorKeys.left.isDown) {
      this._playerDirection = PlayerDirection.Left;
    } else if (this._keyboardCursorKeys.right.isDown) {
      this._playerDirection = PlayerDirection.Right;
    } else if (this._keyboardCursorKeys.down.isDown) {
      this._playerDirection = PlayerDirection.Down;
    } else {
      this._playerDirection = PlayerDirection.None;
    }

    if (Phaser.Input.Keyboard.JustDown(this._spaceKey)) {
      this._jumpPressed = true;
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

  //#endregion
}

export enum PlayerDirection {
  None,
  Left,
  Right,
  Down,
}
