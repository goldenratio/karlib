import type { EventEmitterLike, EventEmitterOnOffLike } from "./types.js";

export interface Disposable {
  dispose(): void;
}

export type DisposeCallback = () => void;

export function isDisposable(object: unknown): object is Disposable {
  return (
    typeof object === 'object'
    && object !== null
    && 'dispose' in object
    && typeof (object as { dispose?: unknown }).dispose === 'function'
  );
}

export class DisposeBag implements Disposable {
  private readonly _list = new Set<DisposeCallback>();
  private _isDisposed = false;

  add(item: DisposeCallback | Disposable): void {
    if (this._isDisposed) {
      throw new Error('DisposeBag is already disposed, create new instance');
    }
    if (typeof item === 'function') {
      this._list.add(() => item());
    } else if (isDisposable(item)) {
      this._list.add(() => item.dispose());
    } else {
      throw new Error(`${item as string} doesn't contain dispose method`);
    }
  }

  fromEvent<TEvent = unknown>(
    emitter: EventEmitterLike | EventEmitterOnOffLike,
    eventType: string,
    listener: (event: TEvent) => void,
  ): void {
    if (this._isDisposed) {
      throw new Error('DisposeBag is already disposed, create new instance');
    }
    const wrappedListener = (event: TEvent): void => {
      listener(event);
    };

    if ("on" in emitter) {
      emitter.on(eventType, wrappedListener);
      this.add(() => emitter.off(eventType, wrappedListener));
    } else {
      emitter.addEventListener(eventType, wrappedListener);
      this.add(() => emitter.removeEventListener(eventType, wrappedListener));
    }
  }

  dispose(): void {
    this._list.forEach(cb => cb());
    this._list.clear();
    this._isDisposed = true;
  }
}
