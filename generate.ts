import { exec } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

type HostsObj = {
  [key: string]: string[];
};

const execPromise = promisify(exec);

async function ping(ip: string): Promise<number> {
  try {
    const { stdout } = await execPromise(`ping -c 3 ${ip}`);
    // 如果丢包则返回无穷大
    const packetLossMatch = stdout.match(/(\d+)% packet loss/);
    if (packetLossMatch && packetLossMatch[1] !== '0') {
      return Number.POSITIVE_INFINITY;
    }
    const matches = stdout.match(/time=(\d+\.?\d*) ms/g);
    if (matches) {
      // 取三次延迟平均值
      const latencies = matches.map((match) => Number.parseFloat(match.split('=')[1]));
      const averageLatency =
        latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
      return Math.round(averageLatency);
    }
    return Number.POSITIVE_INFINITY;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

async function filterIPsByLatency(hosts: HostsObj, maxLatency: number): Promise<HostsObj> {
  const filteredHosts: HostsObj = {};

  for (const domain in hosts) {
    if (Object.hasOwn(hosts, domain)) {
      const pingPromises = hosts[domain].map((ip) => ping(ip).then((latency) => ({ ip, latency })));
      const results = await Promise.allSettled(pingPromises);

      const validIPs = results
        .filter((result) => result.status === 'fulfilled' && result.value.latency <= maxLatency)
        .map(
          (result) => (result as PromiseFulfilledResult<{ ip: string; latency: number }>).value.ip,
        );
      filteredHosts[domain] = validIPs;
    }
  }

  return filteredHosts;
}

async function generateHostsFile() {
  const hostsJSON = JSON.parse(readFileSync('./hosts_deduped.json', 'utf-8')) as HostsObj;
  const maxLatency = 300; // 300 milliseconds

  const filteredHosts = await filterIPsByLatency(hostsJSON, maxLatency);

  const hostsFileContent = Object.entries(filteredHosts)
    .map(([domain, addresses]) => addresses.map((ip) => `${ip} ${domain}`).join('\n'))
    .join('\n');

  writeFileSync('hosts', hostsFileContent);
  console.log('Hosts file generated');
}

generateHostsFile();
