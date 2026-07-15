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
