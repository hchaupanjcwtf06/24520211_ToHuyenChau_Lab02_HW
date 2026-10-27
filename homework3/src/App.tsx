import { useCallback, useEffect, useMemo, useState } from 'react';
import { Countdown } from './components/Countdown';
import { FlashSale } from './core/sale';
import type { InventorySnapshot, Reservation } from './core/inventory';

const START_STOCK = 12;
const LOCK_MS = 15_000;
const SALE_MS = 5 * 60_000;
const demoCustomers = ['Linh', 'Minh', 'Chau', 'Huy', 'An', 'Vy', 'Khanh', 'Trang'];

function message(result: Awaited<ReturnType<FlashSale['reserve']>>): string {
  return result.ok ? `${result.reservation.customerId} reserved ${result.reservation.id}` : `Request rejected: ${result.reason}`;
}
export default function App() {
  const sale = useMemo(() => new FlashSale(START_STOCK, SALE_MS, LOCK_MS), []);
  const [snapshot, setSnapshot] = useState<InventorySnapshot>(() => sale.inventory.snapshot());
  const [logs, setLogs] = useState<string[]>(['Demo ready. Stock is shared by all simulated shoppers.']);
  const [working, setWorking] = useState(false);
  const [time, setTime] = useState(Date.now());
  const update = useCallback(() => setSnapshot(sale.inventory.snapshot()), [sale]);
  const log = useCallback((line: string) => setLogs(prev => [`${new Date().toLocaleTimeString('vi-VN')} · ${line}`, ...prev].slice(0, 24)), []);
  useEffect(() => {
    const stop = sale.inventory.subscribe(update);
    const interval = window.setInterval(() => { sale.inventory.sweep(); setTime(Date.now()); }, 250);
    return () => { stop(); window.clearInterval(interval); };
  }, [sale, update]);
  async function reserveOne() {
    const customer = `User-${Math.floor(Math.random()*9000)+1000}`;
    const result = await sale.reserve(customer);
    log(message(result));
  }
  async function burst() {
    setWorking(true);
    try {
      const tasks = Array.from({ length: 20 }, (_,i) => sale.reserve(`${demoCustomers[i % demoCustomers.length]}-${i+1}`));
      const results = await Promise.all(tasks);
      const approved = results.filter(r => r.ok).length;
      log(`20 concurrent requests: ${approved} locked, ${20-approved} rejected. FIFO order preserved.`);
    } finally { setWorking(false); }
  }
  function change(r: Reservation, action: 'checkout'|'cancel') {
    const result = action === 'checkout' ? sale.inventory.checkout(r.id) : sale.inventory.cancel(r.id);
    log(result.ok ? `${r.id} → ${result.reservation.status}` : `${r.id}: ${result.reason}`);
  }
  const active = time < sale.endsAt;
  const locks = snapshot.reservations.filter(r => r.status === 'LOCKED');
  return (
    <main className="shell">
      <header className="hero">
        <div className="eyebrow">11.11 · VIETNAM MEGA SALE · SIMULATION</div>
        <h1>Midnight Flash Sale</h1>
        <p>Concurrency, millisecond countdown and inventory reservation state machine.</p>
        <div className="sale-clock"><span>SALE ENDS IN</span><Countdown deadline={sale.endsAt}/><strong className={active?'live':'ended'}>{active?'● LIVE':'ENDED'}</strong></div>
      </header>
      <section className="layout" aria-label="Flash sale dashboard">
        <article className="panel product">
          <div className="product-art" aria-hidden="true">⚡<span>11·11</span></div>
          <div className="eyebrow">LIMITED DROP · LIVE INVENTORY</div>
          <h2>Flash Deal Headphones</h2>
          <div className="price"><strong>₫111,000</strong><s>₫599,000</s></div>
          <p className="muted">Each successful request locks one unit for 15 seconds. Checkout converts a lock into a sale.</p>
          <div className="stats">
            <div><span>Available</span><strong>{snapshot.available}</strong></div>
            <div><span>Locked</span><strong>{snapshot.locked}</strong></div>
            <div><span>Sold</span><strong>{snapshot.sold}</strong></div>
            <div><span>Total</span><strong>{snapshot.total}</strong></div>
          </div>
          <div className="stockbar" role="img" aria-label={`${snapshot.available} available, ${snapshot.locked} locked, ${snapshot.sold} sold out of ${snapshot.total}`}>
            <span className="soldbar" style={{width:`${snapshot.sold/snapshot.total*100}%`}}/>
            <span className="lockbar" style={{width:`${snapshot.locked/snapshot.total*100}%`}}/>
          </div>
          <div className="buttons">
            <button disabled={!active || snapshot.available===0 || working} onClick={() => void reserveOne()}>Reserve one item</button>
            <button className="secondary" disabled={!active || working} onClick={() => void burst()}>Simulate 20 buyers</button>
          </div>
          <p className="muted note">All concurrency happens in one browser simulation. This is not a Shopee/Lazada integration or production-grade distributed lock.</p>
        </article>
        <section className="stack">
          <article className="panel">
            <div className="panel-title"><h2>Inventory lock state machine</h2><span className="tag">{locks.length} active locks</span></div>
            <div className="stateflow" aria-label="Reservation state transitions">AVAILABLE → LOCKED → CHECKED_OUT<br/>LOCKED → EXPIRED / CANCELLED</div>
            <div className="scroll-area">
              {locks.length===0 ? <p className="muted empty">No active reservations. Reserve or simulate buyers.</p> :
                <table className="reservation-table"><colgroup><col style={{ width: "42%" }}/><col style={{ width: "20%" }}/><col style={{ width: "38%" }}/></colgroup><thead><tr><th scope="col">ID / Buyer</th><th scope="col">Expires in</th><th scope="col">Action</th></tr></thead><tbody>
                  {locks.map(r => <tr key={r.id}><td><strong>{r.id}</strong><small>{r.customerId}</small></td><td className="timer-small">{((Math.max(0,r.expiresAt-time))/1000).toFixed(1)}s</td><td><div className="actioncell"><button className="small" onClick={() => change(r,'checkout')}>Checkout</button><button className="small ghost" onClick={() => change(r,'cancel')}>Cancel</button></div></td></tr>)}
                </tbody></table>}
            </div>
          </article>
          <article className="panel">
            <div className="panel-title"><h2>Event log</h2><span className="tag">FIFO audit</span></div>
            <ol className="log" aria-live="polite">{logs.map((line,i) => <li key={`${i}-${line}`}>{line}</li>)}</ol>
            <p className="invariant">{sale.inventory.assertInvariants()?'✓ Invariant valid':'✕ Inventory invariant failed'} · Available + Locked + Sold = Total</p>
          </article>
        </section>
      </section>
    </main>
  );
}
