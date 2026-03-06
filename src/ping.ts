import { Socket } from 'node:net';

export interface PingOptions {
  address?: string;
  port?: number;
  attempts?: number;
  timeout?: number;
}

export interface PingResult {
  seq: number;
  time?: number;
  err?: Error;
}

export interface PingSummary {
  address: string;
  port: number;
  attempts: number;
  avg?: number;
  max?: number;
  min?: number;
  results: PingResult[];
}

function summarize(options: Required<PingOptions>, results: PingResult[]): PingSummary {
  const successfulTimes = results.flatMap((result) => (typeof result.time === 'number' ? [result.time] : []));

  if (successfulTimes.length === 0) {
    return {
      address: options.address,
      port: options.port,
      attempts: options.attempts,
      results,
    };
  }

  const total = successfulTimes.reduce((sum, time) => sum + time, 0);

  return {
    address: options.address,
    port: options.port,
    attempts: options.attempts,
    avg: total / successfulTimes.length,
    max: Math.max(...successfulTimes),
    min: Math.min(...successfulTimes),
    results,
  };
}

async function connectOnce(options: Required<PingOptions>, seq: number): Promise<PingResult> {
  return new Promise((resolve) => {
    const socket = new Socket();
    const start = process.hrtime.bigint();
    let settled = false;

    const finalize = (result: PingResult): void => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.once('connect', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      finalize({ seq, time: durationMs });
    });

    socket.once('error', (err: Error) => {
      finalize({ seq, err });
    });

    socket.once('timeout', () => {
      finalize({ seq, err: new Error('Request timeout') });
    });

    socket.setTimeout(options.timeout);
    socket.connect(options.port, options.address);
  });
}

export async function ping(options: PingOptions): Promise<PingSummary> {
  const normalizedOptions = {
    address: options.address ?? 'localhost',
    port: options.port ?? 80,
    attempts: options.attempts ?? 3,
    timeout: options.timeout ?? 3000,
  };

  const results: PingResult[] = [];
  for (let seq = 0; seq < normalizedOptions.attempts; seq++) {
    results.push(await connectOnce(normalizedOptions, seq));
  }

  return summarize(normalizedOptions, results);
}
