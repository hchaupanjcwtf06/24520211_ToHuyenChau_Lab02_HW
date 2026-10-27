/** Serialized FIFO queue. Only one task (load, decode, play) runs at a time. */
export type QueueSnapshot = {
  active: string | null;
  pending: string[];
  completed: number;
  cancelled: number;
};

type Task<T> = {
  id: number;
  url: string;
  controller: AbortController;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
};

export function abortError(): Error {
  const error = new Error('Task cancelled');
  error.name = 'AbortError';
  return error;
}

export class AudioTaskQueue<T> {
  private queue: Task<T>[] = [];
  private active: Task<T> | null = null;
  private isProcessing = false;
  private nextId = 1;
  private completed = 0;
  private cancelled = 0;
  private listeners = new Set<(state: QueueSnapshot) => void>();
  private disposed = false;

  private readonly execute: (url: string, signal: AbortSignal) => Promise<T>;

  constructor(execute: (url: string, signal: AbortSignal) => Promise<T>) {
    this.execute = execute;
  }

  subscribe(listener: (snapshot: QueueSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): QueueSnapshot {
    return {
      active: this.active?.url ?? null,
      pending: this.queue.map((task) => task.url),
      completed: this.completed,
      cancelled: this.cancelled
    };
  }

  enqueue(url: string): Promise<T> {
    if (this.disposed) return Promise.reject(new Error('Queue has been disposed'));
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ id: this.nextId++, url, controller: new AbortController(), resolve, reject });
      this.emit();
      void this.processNext();
    });
  }

  cancelActive(): void {
    this.active?.controller.abort();
  }

  cancelPending(): void {
    for (const task of this.queue.splice(0)) {
      task.controller.abort();
      task.reject(abortError());
      this.cancelled++;
    }
    this.emit();
  }

  cancelAll(): void {
    this.cancelPending();
    this.cancelActive();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelAll();
    this.listeners.clear();
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.disposed) return;
    this.isProcessing = true;
    try {
      while (this.queue.length > 0 && !this.disposed) {
        const task = this.queue.shift()!;
        this.active = task;
        this.emit();
        try {
          const value = await this.execute(task.url, task.controller.signal);
          if (task.controller.signal.aborted) throw abortError();
          this.completed++;
          task.resolve(value);
        } catch (error) {
          if (task.controller.signal.aborted) {
            this.cancelled++;
            task.reject(abortError());
          } else {
            task.reject(error instanceof Error ? error : new Error(String(error)));
          }
        } finally {
          this.active = null;
          this.emit();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
