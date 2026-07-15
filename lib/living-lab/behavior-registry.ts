import { sprint3BehaviorCodes, type Sprint3BehaviorCode } from "../observations/session-engine";

export type BehaviorCodeDefinition = {
  code: Sprint3BehaviorCode;
  definition: string;
  active: boolean;
  overlappingAllowed: boolean;
  version: number;
};

const nonOverlapping = new Set<Sprint3BehaviorCode>(["STAND", "SIT", "LIE"]);

export const behaviorCodeRegistry: BehaviorCodeDefinition[] = sprint3BehaviorCodes.map((code) => ({
  code,
  definition: `Observable ${code.toLowerCase().replaceAll("_", " ")} behavior; record only what is visible or audible.`,
  active: true,
  overlappingAllowed: !nonOverlapping.has(code),
  version: 1
}));

export function getBehaviorCodeDefinition(code: string) {
  return behaviorCodeRegistry.find((item) => item.code === code && item.active);
}

export function canBehaviorEventsOverlap(first: Sprint3BehaviorCode, second: Sprint3BehaviorCode): boolean {
  return Boolean(getBehaviorCodeDefinition(first)?.overlappingAllowed && getBehaviorCodeDefinition(second)?.overlappingAllowed);
}

export function setBehaviorCodeActive(code: string, active: boolean) {
  const definition = behaviorCodeRegistry.find((item) => item.code === code);
  if (!definition) throw new Error("Behavior code not found.");
  definition.active = active;
  definition.version += 1;
  return definition;
}
