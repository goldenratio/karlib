import { NOOP } from "./constants.js";
import type { Disposable } from "./dispose_bag.js";

export interface PoolConfig<TPoolItem> {
  readonly create_pooled_item: () => TPoolItem;
  readonly on_take_from_pool?: (item: TPoolItem) => void;
  readonly on_returned_to_pool?: (item: TPoolItem) => void;
  readonly on_destroy_pool_object?: (item: TPoolItem) => void;
}

export class PoolBag<TPoolType = unknown> implements Disposable {
  private readonly items = new Set<TPoolType>();
  private readonly create_pooled_item: () => TPoolType;
  private readonly on_take_from_pool: (item: TPoolType) => void;
  private readonly on_returned_to_pool: (item: TPoolType) => void;
  private readonly on_destroy_pool_object: (item: TPoolType) => void;

  constructor(config: PoolConfig<TPoolType>) {
    const { create_pooled_item, on_take_from_pool = NOOP, on_returned_to_pool = NOOP, on_destroy_pool_object = NOOP } = config;
    this.create_pooled_item = create_pooled_item;
    this.on_take_from_pool = on_take_from_pool;
    this.on_returned_to_pool = on_returned_to_pool;
    this.on_destroy_pool_object = on_destroy_pool_object;
  }

  get size(): number {
    return this.items.size;
  }

  set size(size: number) {
    if (typeof size !== 'number') {
      throw new Error('Parameter is not a number: ' + typeof size);
    }

    let current = this.items.size;

    while (current < size) {
      const item = this.create_pooled_item();
      this.release(item);
      current++;
    }

    while (current > size) {
      const [item] = this.items.values();
      this.delete(item);
      current--;
    }
  }

  dispose(): void {
    this.items.clear();
  }

  /**
   * returns get value from pool
   */
  get(): TPoolType {
    if (this.size === 0) {
      return this.create_pooled_item();
    }

    const [item] = this.items.values();
    this.on_take_from_pool(item);
    this.items.delete(item);
    return item;
  }

  /**
   * puts object to end of pool
   */
  release(item: TPoolType): void {
    this.items.add(item);
    this.on_returned_to_pool(item);
  }

  /**
   * deletes object from pool manually
   */
  delete(item: TPoolType) {
    this.items.delete(item);
    this.on_destroy_pool_object(item);
  }
}
