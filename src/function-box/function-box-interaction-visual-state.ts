import { ResonanceType } from '../runtime/resonance-types.js';

export enum SlotInteractionState {
  Empty = 'Empty',
  Normal = 'Normal',
  Hover = 'Hover',
  Selected = 'Selected',
  Executing = 'Executing',
  Locked = 'Locked',
  Fractured = 'Fractured',
  Restoring = 'Restoring',
}

export enum ComplexityViewMode {
  Basic = 'Basic',
  Advanced = 'Advanced',
  Master = 'Master',
}

export interface FunctionBoxVisualSlot {
  readonly slotIndex: number;
  readonly interactionState: SlotInteractionState;
  readonly resonanceState: ResonanceType;
  readonly shouldAnimate: boolean;
  readonly animationIntensity: number;
}

export interface FunctionBoxVisualLink {
  readonly sourceSlotIndex: number;
  readonly targetSlotIndex: number;
  readonly resonanceState: ResonanceType;
  readonly visible: boolean;
  readonly animationIntensity: number;
}

export interface FunctionBoxVisualState {
  readonly slots: FunctionBoxVisualSlot[];
  readonly links: FunctionBoxVisualLink[];
  readonly complexityViewMode: ComplexityViewMode;
}

export function animationIntensityForResonance(
  resonanceState: ResonanceType,
): number {
  switch (resonanceState) {
    case ResonanceType.Stable:
      return 0.15;
    case ResonanceType.Pressured:
      return 0.65;
    case ResonanceType.Synchronized:
      return 0.35;
    case ResonanceType.Fractured:
      return 1;
    case ResonanceType.Restoring:
      return 0.25;
    default:
      return exhaustiveResonanceCheck(resonanceState);
  }
}

export function shouldShowLink(
  resonanceState: ResonanceType,
  complexityViewMode: ComplexityViewMode,
): boolean {
  if (complexityViewMode === ComplexityViewMode.Master) return true;

  if (complexityViewMode === ComplexityViewMode.Advanced) {
    return resonanceState !== ResonanceType.Stable;
  }

  return resonanceState === ResonanceType.Fractured
    || resonanceState === ResonanceType.Pressured;
}

function exhaustiveResonanceCheck(value: never): never {
  throw new Error(`Unhandled resonance state: ${String(value)}`);
}
