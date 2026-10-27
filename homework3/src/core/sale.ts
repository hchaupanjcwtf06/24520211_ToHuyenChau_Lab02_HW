import { InventoryStore, type InventoryResult } from './inventory.ts';
import { RequestQueue } from './request-queue.ts';
import type { Clock } from './anti-drift-timer.ts';
export type SaleResult = InventoryResult | { ok: false; reason: 'SALE_NOT_ACTIVE' };
export class FlashSale {
  readonly inventory: InventoryStore;
  readonly queue = new RequestQueue();
  readonly endsAt: number;
  private readonly clock: Clock;
  constructor(stock: number, saleDurationMs: number, lockDurationMs: number, clock: Clock = { now: () => Date.now() }) {
    this.clock = clock;
    this.endsAt = clock.now() + saleDurationMs;
    this.inventory = new InventoryStore(stock, lockDurationMs, clock);
  }
  get active(): boolean { return this.clock.now() < this.endsAt; }
  reserve(customerId: string): Promise<SaleResult> {
    return this.queue.enqueue(() => {
      if (!this.active) return { ok: false, reason: 'SALE_NOT_ACTIVE' } as SaleResult;
      return this.inventory.reserve(customerId);
    });
  }
}
