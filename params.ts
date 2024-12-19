const dnsServers = [
  '8.8.8.8', // Google公共DNS
  '1.1.1.1', // Cloudflare公共DNS
  '101.101.101.101', // 台湾Quad 101 DNS
  '185.222.222.222', // DNS.SB公共DNS
  '94.140.14.14', // AdGuard 公共DNS
  '208.67.222.222', // OpenDNS(Cisco)
  '9.9.9.9', // IBM Quad9
];
const domains = ['github.com', 'objects.githubusercontent.com'];

type HostObj = {
  [dnsServer: string]: string[];
};

type HostsObj = {
  [domain: string]: HostObj;
};

export { dnsServers, domains, type HostObj, type HostsObj };
