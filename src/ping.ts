import { $ } from 'bun';

export async function ping(ip: string): Promise<number> {
  try {
    const stdout = await $`ping -c 3 ${ip}`.text();
    // 如果丢包则返回无穷大
    const packetLossMatch = stdout.match(/(\d+)% packet loss/);
    if (packetLossMatch && packetLossMatch[1] !== "0") {
      return Number.POSITIVE_INFINITY;
    }
    const matches = stdout.match(/time=(\d+\.?\d*) ms/g);
    if (matches) {
      // 取三次延迟平均值
      const latencies = matches.map((match) => Number.parseFloat(match.split("=")[1]));
      const averageLatency =
        latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
      return Math.round(averageLatency);
    }
    return Number.POSITIVE_INFINITY;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}