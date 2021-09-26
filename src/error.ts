/* eslint-disable max-classes-per-file */
import { DEBUG_MODE } from './env';

export class ClientError extends Error { }

export class CFError extends Error {
  constructor(
    private cfResponse: any,
    ...args: any[]
  ) {
    super(...args);
  }

  public toString(): string {
    if (DEBUG_MODE) return `${super.toString.call(this)}\n${this.cfResponse.toString()}`;
    return super.toString.call(this);
  }
}
