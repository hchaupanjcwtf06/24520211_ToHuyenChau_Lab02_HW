import type { Clock } from './anti-drift-timer.ts';

export type ReservationStatus = 'LOCKED' | 'CHECKED_OUT' | 'EXPIRED' | 'CANCELLED';
export type Reservation = Readonly<{
  id: string; customerId: string; quantity: number; status: ReservationStatus;
  createdAt: number; expiresAt: number;
}>;
export type InventorySnapshot = Readonly<{
  total: number; available: number; locked: number; sold: number;
  reservations: Reservation[];
}>;
export type InventoryResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: 'SOLD_OUT' | 'INVALID_QUANTITY' | 'NOT_FOUND' | 'NOT_LOCKED' | 'EXPIRED' };

/** In-memory single-process simulation. Not a distributed DB inventory lock. */
export class InventoryStore {
  private readonly total: number;
  private readonly ttlMs: number;
  private readonly clock: Clock;
  private reservations = new Map<string, Reservation>();
  private seq = 0;
  private subscribers = new Set<() => void>();

  constructor(total: number, ttlMs: number, clock: Clock = { now: () => Date.now() }) {
    if (!Number.isSafeInteger(total) || total < 0) throw new RangeError('total must be non-negative integer');
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new RangeError('ttl must be positive');
    this.total = total;
    this.ttlMs = ttlMs;
    this.clock = clock;
  }
  subscribe(listener: () => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }
  private notify(): void { for (const fn of this.subscribers) fn(); }
  private expireInternal(now: number): boolean {
    let changed = false;
    for (const [id, r] of this.reservations) {
      if (r.status === 'LOCKED' && now >= r.expiresAt) {
        this.reservations.set(id, { ...r, status: 'EXPIRED' });
        changed = true;
      }
    }
    return changed;
  }
  sweep(): void { if (this.expireInternal(this.clock.now())) this.notify(); }
  snapshot(): InventorySnapshot {
    const now = this.clock.now();
    this.expireInternal(now);
    const reservations = [...this.reservations.values()];
    const locked = reservations.filter(r => r.status === 'LOCKED').reduce((a,r) => a + r.quantity, 0);
    const sold = reservations.filter(r => r.status === 'CHECKED_OUT').reduce((a,r) => a + r.quantity, 0);
    return { total: this.total, available: this.total - locked - sold, locked, sold, reservations };
  }
  reserve(customerId: string, quantity = 1): InventoryResult {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) return { ok: false, reason: 'INVALID_QUANTITY' };
    const snapshot = this.snapshot();
    if (quantity > snapshot.available) return { ok: false, reason: 'SOLD_OUT' };
    const now = this.clock.now();
    const reservation: Reservation = {
      id: `R-${++this.seq}`, customerId, quantity, status: 'LOCKED',
      createdAt: now, expiresAt: now + this.ttlMs,
    };
    this.reservations.set(reservation.id, reservation);
    this.notify();
    return { ok: true, reservation };
  }
  private transition(id: string, action: 'checkout' | 'cancel'): InventoryResult {
    this.sweep();
    const r = this.reservations.get(id);
    if (!r) return { ok: false, reason: 'NOT_FOUND' };
    if (r.status === 'EXPIRED') return { ok: false, reason: 'EXPIRED' };
    if (r.status !== 'LOCKED') return { ok: false, reason: 'NOT_LOCKED' };
    const updated: Reservation = { ...r, status: action === 'checkout' ? 'CHECKED_OUT' : 'CANCELLED' };
    this.reservations.set(id, updated);
    this.notify();
    return { ok: true, reservation: updated };
  }
  checkout(id: string): InventoryResult { return this.transition(id, 'checkout'); }
  cancel(id: string): InventoryResult { return this.transition(id, 'cancel'); }
  assertInvariants(): boolean {
    const s = this.snapshot();
    return s.available >= 0 && s.locked >= 0 && s.sold >= 0 && s.total === s.available + s.locked + s.sold;
  }
}
