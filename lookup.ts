import { DNS, githubHosts } from "./src";

const dns = new DNS();
await Promise.all(githubHosts.map((hostname) => dns.lookup(hostname)));
const hosts = dns.getHosts();
await Bun.write("candidates.json", JSON.stringify(hosts, null, 2));
