import { ping } from './src';

type Hosts = Record<string, string>;

async function probe(address: string): Promise<boolean> {
  const data = await ping({ address, port: 80, attempts: 3, timeout: 3000 });
  return data.min !== undefined;
}

async function filterIPsByLatency(hosts: Hosts) {
  const pingPromises = Object.keys(hosts).map((ip) => probe(ip).then((available) => ({ ip, available })));
  const results = await Promise.allSettled(pingPromises);
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.available === false) {
      delete hosts[result.value.ip];
    }
  }
}

const hostsJSON = await Bun.file('./candidates.json').json();
await filterIPsByLatency(hostsJSON);

const hostsFileContent = Object.entries(hostsJSON)
  .map(([ip, host]) => `${ip} ${host}`)
  .join('\n');

const response = await fetch('https://gitee.com/api/v5/gists/hzp8a5rsjygdeuon0k3qt75/comments/49337638', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    charset: 'UTF-8',
  },
  body: JSON.stringify({ access_token: 'c88b3a2aaaf8f067d61780676cf5376f', body: hostsFileContent }),
});

console.log('STATUS', response.status);

console.log('Hosts records generated');
