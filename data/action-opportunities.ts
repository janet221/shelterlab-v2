import type { ActionOpportunity } from "@/lib/action-opportunities/types";

// Opportunities are shown only when they come from a verified public source or
// a real partner announcement. Do not seed fictional recruitment listings.
export function createPrototypeOpportunities(): ActionOpportunity[] {
  return [];
}
