/** Serializes asynchronous simulation requests in FIFO arrival order. */
export class RequestQueue {
  private tail: Promise<void> = Promise.resolve();
  private waiting = 0;
  get pending(): number { return this.waiting; }
  enqueue<T>(work: () => Promise<T> | T): Promise<T> {
    this.waiting++;
    const task = this.tail.then(() => work());
    this.tail = task.then(
      () => { this.waiting--; },
      () => { this.waiting--; },
    );
    return task;
  }
}
