import { InfiniteSynchronizationStage } from './infinite-continuation-synchronization-system.js';
import { WatcherRecursionStage } from './watcher-recursion-system.js';

export enum AuditVisibilityLevel {
  Hidden = 'Hidden',
  Summary = 'Summary',
  Detailed = 'Detailed',
  Recursive = 'Recursive',
  Eternal = 'Eternal',
}

export interface EternalAuditVisualizationInput {
  readonly auditId: string;
  readonly synchronizationStage: InfiniteSynchronizationStage;
  readonly watcherStage: WatcherRecursionStage;
  readonly synchronizationStrength: number;
  readonly auditRequired: boolean;
}

export interface EternalAuditVisualizationResult {
  readonly auditId: string;
  readonly visibilityLevel: AuditVisibilityLevel;
  readonly coherenceScore: number;
  readonly shouldNotifySophia: boolean;
  readonly shouldPersistAudit: boolean;
}

export class EternalAuditVisualizationSystem {
  public visualize(input: EternalAuditVisualizationInput): EternalAuditVisualizationResult {
    const coherenceScore = clamp01(
      input.synchronizationStrength * 0.65
        + watcherStrength(input.watcherStage) * 0.35,
    );

    return {
      auditId: input.auditId,
      visibilityLevel: visibilityFor(coherenceScore, input),
      coherenceScore,
      shouldNotifySophia: input.auditRequired || coherenceScore < 0.55,
      shouldPersistAudit: input.auditRequired || coherenceScore >= 0.7,
    };
  }
}

function visibilityFor(
  coherenceScore: number,
  input: EternalAuditVisualizationInput,
): AuditVisibilityLevel {
  if (input.synchronizationStage === InfiniteSynchronizationStage.InfiniteContinuation
    && coherenceScore >= 0.9) {
    return AuditVisibilityLevel.Eternal;
  }

  if (input.watcherStage === WatcherRecursionStage.SelfRememberingSystem
    && coherenceScore >= 0.75) {
    return AuditVisibilityLevel.Recursive;
  }

  if (coherenceScore >= 0.6) return AuditVisibilityLevel.Detailed;
  if (coherenceScore >= 0.35) return AuditVisibilityLevel.Summary;
  return AuditVisibilityLevel.Hidden;
}

function watcherStrength(stage: WatcherRecursionStage): number {
  switch (stage) {
    case WatcherRecursionStage.ObservedEvent:
      return 0.2;
    case WatcherRecursionStage.AttributedPattern:
      return 0.4;
    case WatcherRecursionStage.CompressedHistory:
      return 0.6;
    case WatcherRecursionStage.RecursiveWitness:
      return 0.8;
    case WatcherRecursionStage.SelfRememberingSystem:
      return 1;
    default:
      return exhaustiveWatcherStageCheck(stage);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveWatcherStageCheck(value: never): never {
  throw new Error(`Unhandled watcher recursion stage: ${String(value)}`);
}
