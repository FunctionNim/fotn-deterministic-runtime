export enum RuntimeValidationStatus {
  Valid = 'Valid',
  Warning = 'Warning',
  DriftDetected = 'DriftDetected',
  Invalid = 'Invalid',
}

export interface ContinuityRuntimeValidationInput {
  readonly validationId: string;
  readonly expectedSignature: string;
  readonly actualSignature: string;
  readonly synchronizationStrength: number;
  readonly replayMatched: boolean;
  readonly auditRequired: boolean;
}

export interface ContinuityRuntimeValidationResult {
  readonly validationId: string;
  readonly status: RuntimeValidationStatus;
  readonly coherenceScore: number;
  readonly requiresRepair: boolean;
  readonly requiresAudit: boolean;
}

export class ContinuityRuntimeValidationSystem {
  public validate(input: ContinuityRuntimeValidationInput): ContinuityRuntimeValidationResult {
    const signatureMatched = input.expectedSignature === input.actualSignature;
    const coherenceScore = clamp01(
      input.synchronizationStrength * 0.5
        + (signatureMatched ? 0.25 : 0)
        + (input.replayMatched ? 0.25 : 0),
    );

    return {
      validationId: input.validationId,
      status: statusFor(coherenceScore, signatureMatched, input.replayMatched),
      coherenceScore,
      requiresRepair: coherenceScore < 0.6 || !signatureMatched,
      requiresAudit: input.auditRequired || !input.replayMatched || !signatureMatched,
    };
  }
}

function statusFor(
  coherenceScore: number,
  signatureMatched: boolean,
  replayMatched: boolean,
): RuntimeValidationStatus {
  if (!signatureMatched) return RuntimeValidationStatus.DriftDetected;
  if (!replayMatched) return RuntimeValidationStatus.Warning;
  if (coherenceScore >= 0.85) return RuntimeValidationStatus.Valid;
  if (coherenceScore >= 0.6) return RuntimeValidationStatus.Warning;
  return RuntimeValidationStatus.Invalid;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
