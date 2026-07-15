"use server";

import { requireDemoUser } from "@/lib/auth/demo-session";
import { SyntheticDemoDatasetAdapter } from "@/lib/government-data/adapters";

export async function syncGovernmentDatasetsNowAction(formData: FormData) {
  requireDemoUser(String(formData.get("testCode") || ""), ["admin"]);
  await new SyntheticDemoDatasetAdapter().import();
}
