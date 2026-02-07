import { promises as dns } from "node:dns";

export class DNS {
  private readonly servers = [
    "8.8.8.8", // Google 公共 DNS
    "1.1.1.1", // Cloudflare 公共 DNS
    "101.101.101.101", // 台湾 Quad 101 DNS
    "185.222.222.222", // DNS.SB 公共 DNS
    "94.140.14.14", // AdGuard 公共 DNS
    "208.67.222.222", // OpenDNS(Cisco)
    "9.9.9.9", // IBM Quad9
  ];

  private hosts: Record<string, string> = {};

  getHosts() {
    return this.hosts;
  }

  private async resolve4(hostname: string, server: string) {
    const resolver = new dns.Resolver();
    resolver.setServers([server]);
    const IPs = await resolver.resolve4(hostname);
    for (const ip of IPs) {
      this.hosts[ip] = hostname;
    }
  }

  async lookup(hostname: string) {
    const res = await Promise.allSettled(
      this.servers.map((server) => this.resolve4(hostname, server)),
    );
    for (const result of res) {
      if (result.status === "rejected") {
        console.error(
          `Failed to resolve ${hostname} with server ${result.reason.server}:`,
          result.reason.error,
        );
      }
    }
  }
}
