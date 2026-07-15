import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sprint8ImpactSnapshot } from "../lib/impact/demo-data";
import { generateImpactReport } from "../lib/impact/report";

const destination = resolve(process.cwd(), "IMPACT_REPORT.md");

async function main() {
  await writeFile(destination, generateImpactReport(sprint8ImpactSnapshot), "utf8");
  console.log(`Generated ${destination}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
