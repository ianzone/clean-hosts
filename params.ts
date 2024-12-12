const dnsServers = ['8.8.8.8', '8.8.4.4', '1.1.1.1'];
const domains = ['github.com', 'objects.githubusercontent.com'];

type HostObj = {
  [dnsServer: string]: string[];
};

type HostsObj = {
  [domain: string]: HostObj;
};

export { dnsServers, domains, type HostObj, type HostsObj };
