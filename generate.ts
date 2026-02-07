import { ping } from "./src";
type Hosts = Record<string, string>;

async function filterIPsByLatency(hosts: Hosts) {
  const pingPromises = Object.keys(hosts).map((ip) =>
    ping(ip).then((latency) => ({ ip, latency })),
  );
  const results = await Promise.allSettled(pingPromises);
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.latency > 400) {
      delete hosts[result.value.ip];
    }
  }
}

const hostsJSON = await Bun.file("./candidates.json").json();
await filterIPsByLatency(hostsJSON);

const hostsFileContent = Object.entries(hostsJSON)
  .map(([ip, host]) => `${ip} ${host}`)
  .join("\n");

await Bun.write("hosts", hostsFileContent);
console.log("Hosts file generated");
