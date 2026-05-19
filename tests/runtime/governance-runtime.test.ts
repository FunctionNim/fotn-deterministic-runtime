import { describe, expect, it } from 'vitest';

import { GovernanceDecisionType, GovernanceRuntime } from '../../src/governance/governance-runtime.js';

import { EmotionalTrend } from '../../src/runtime/index.js';

describe('GovernanceRuntime', () => {
  it('creates emergency stabilization decisions under high pressure', () => {
    const runtime = new GovernanceRuntime();

    const signal = runtime.evaluateDistrictPriority({
      districtId: 'fractured-district',
      pressureLevel: 0.95,
      emotionalClimate: {
        calm: 0.1,
        fear: 0.9,
        hope: 0.2,
        curiosity: 0.3,
        isolation: 0.8,
        connection: 0.2,
        currentTrend: EmotionalTrend.Distorting,
      },
      restorationProgress: 0.1,
      memoryPressure: 0.8,
      migrationPressure: 0.9,
      environmentStability: 0.2,
      resonanceStability: 0.15,
    });

    const decision = runtime.createDecision(signal, 100);

    expect(decision.type)
      .toBe(GovernanceDecisionType.EmergencyStabilization);

    expect(decision.urgency)
      .toBeGreaterThan(0.75);
  });

  it('creates restoration priority decisions for recoverable districts', () => {
    const runtime = new GovernanceRuntime();

    const signal = runtime.evaluateDistrictPriority({
      districtId: 'restoring-district',
      pressureLevel: 0.3,
      emotionalClimate: {
        calm: 0.7,
        fear: 0.2,
        hope: 0.8,
        curiosity: 0.5,
        isolation: 0.2,
        connection: 0.7,
        currentTrend: EmotionalTrend.Recovering,
      },
      restorationProgress: 0.6,
      memoryPressure: 0.3,
      migrationPressure: 0.2,
      environmentStability: 0.75,
      resonanceStability: 0.7,
    });

    const decision = runtime.createDecision(signal, 120);

    expect(decision.type)
      .toBe(GovernanceDecisionType.RestorationPriority);
  });
});
