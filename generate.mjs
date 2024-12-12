import { promises as dns } from 'node:dns';
import { promises as fs } from 'node:fs';

async function dnsResolve() {
  const hosts = {
    'github.com': [],
    'objects.githubusercontent.com': [],
  };

  for (const domain in hosts) {
    try {
      const addresses = await dns.resolve4(domain);
      hosts[domain] = addresses;
    } catch (error) {
      console.error(`Error resolving ${domain}:`, error);
    }
  }

  return hosts;
}

async function generateHostsFile() {
  const hosts = await dnsResolve();
  const hostsFileContent = Object.entries(hosts)
    .map(([domain, addresses]) => addresses.map((ip) => `${ip} ${domain}`).join('\n'))
    .join('\n');

  try {
    await fs.writeFile('hosts', hostsFileContent);
    console.log('Hosts file generated successfully.');
  } catch (error) {
    console.error('Error writing hosts file:', error);
  }
}

generateHostsFile();
