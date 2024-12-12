import { exec } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

type HostsObj = {
  [key: string]: string[];
};

const execPromise = promisify(exec);

async function ping(ip: string): Promise<number> {
  try {
    const { stdout } = await execPromise(`ping -c 1 ${ip}`);
    const match = stdout.match(/time=(\d+\.?\d*) ms/);
    if (match) {
      return Number.parseFloat(match[1]);
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
      const validIPs: string[] = [];
      for (const ip of hosts[domain]) {
        const latency = await ping(ip);
        if (latency <= maxLatency) {
          validIPs.push(ip);
        }
      }
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
}

generateHostsFile();
