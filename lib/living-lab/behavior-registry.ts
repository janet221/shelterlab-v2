export const sprint3BehaviorCodes = [
  "APPROACH",
  "MOVE_AWAY",
  "STAND",
  "SIT",
  "LIE",
  "PACE",
  "BARK",
  "WHINE",
  "TAIL_WAG",
  "TAIL_TUCK",
  "EARS_FORWARD",
  "EARS_BACK",
  "YAWN",
  "LIP_LICK",
  "JUMP",
  "PLAY_BOW",
  "SNIFF",
  "LOOK_AT_HUMAN",
  "LOOK_AWAY",
  "OTHER"
] as const;

export type Sprint3BehaviorCode = (typeof sprint3BehaviorCodes)[number];


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

// Original observation vocabulary retained for historical records.
export const behaviorCodes = [
  "APP_FRONT",
  "MOVE_AWAY",
  "STAY_BACK",
  "STAND",
  "SIT",
  "LIE",
  "PACE",
  "SPIN",
  "JUMP_GATE",
  "BARK",
  "WHINE",
  "QUIET_OBSERVE",
  "TAIL_TUCK",
  "EARS_BACK",
  "YAWN",
  "LIP_LICK"
] as const;

export type BehaviorCode = (typeof behaviorCodes)[number];

export function isBehaviorCode(value: string): value is BehaviorCode {
  return behaviorCodes.includes(value as BehaviorCode);
}
