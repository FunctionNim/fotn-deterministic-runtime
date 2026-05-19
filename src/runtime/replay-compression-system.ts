export enum ReplayCompressionLevel {
  Raw = 'Raw',
  Condensed = 'Condensed',
  Symbolic = 'Symbolic',
  Mythic = 'Mythic',
}

export interface ReplayCompressionInput {
  readonly replayId: string;
  readonly eventCount: number;
  readonly uniqueStateSignatureCount: number;
  readonly symbolicWeight: number;
  readonly historicalWeight: number;
}

export interface ReplayCompressionResult {
  readonly replayId: string;
  readonly level: ReplayCompressionLevel;
  readonly compressionRatio: number;
  readonly preservesDeterminism: boolean;
  readonly archiveRecommended: boolean;
}

export class ReplayCompressionSystem {
  public compress(input: ReplayCompressionInput): ReplayCompressionResult {
    const compressionRatio = clamp01(
      1 - (input.uniqueStateSignatureCount / Math.max(1, input.eventCount)),
    );

    const meaningWeight = clamp01(
      input.symbolicWeight * 0.55 + input.historicalWeight * 0.45,
    );

    return {
      replayId: input.replayId,
      level: compressionLevelFor(compressionRatio, meaningWeight),
      compressionRatio,
      preservesDeterminism: input.uniqueStateSignatureCount > 0,
      archiveRecommended: meaningWeight >= 0.65,
    };
  }
}

function compressionLevelFor(
  compressionRatio: number,
  meaningWeight: number,
): ReplayCompressionLevel {
  if (meaningWeight >= 0.85 && compressionRatio >= 0.75) {
    return ReplayCompressionLevel.Mythic;
  }

  if (meaningWeight >= 0.65) return ReplayCompressionLevel.Symbolic;
  if (compressionRatio >= 0.35) return ReplayCompressionLevel.Condensed;
  return ReplayCompressionLevel.Raw;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
