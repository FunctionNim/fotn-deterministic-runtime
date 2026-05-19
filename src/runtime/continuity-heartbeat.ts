import { ContinuityRuntimeState, clamp01 } from './continuity-state.js';

export class ContinuityHeartbeat {
  public tick(state: ContinuityRuntimeState): ContinuityRuntimeState {
    state.tick += 1;

    this.updateDistrictPressure(state);
    this.updateSeekerResonance(state);
    this.updateRestoration(state);

    return state;
  }

  private updateDistrictPressure(state: ContinuityRuntimeState): void {
    for (const district of Object.values(state.districts)) {
      district.pressureLevel = clamp01(
        district.pressureLevel + (district.migrationPressure * 0.01)
      );

      district.resonanceStability = clamp01(
        district.environmentStability - district.pressureLevel
      );
    }
  }

  private updateSeekerResonance(state: ContinuityRuntimeState): void {
    for (const seeker of Object.values(state.seekers)) {
      seeker.pressureLevel = clamp01(
        seeker.pressureLevel + seeker.exhaustionLevel * 0.01
      );

      seeker.resonance.stability = clamp01(
        seeker.resonance.stability
        + seeker.restoration.resonanceRecovery
        - seeker.pressureLevel * 0.05
      );
    }
  }

  private updateRestoration(state: ContinuityRuntimeState): void {
    for (const seeker of Object.values(state.seekers)) {
      if (seeker.restoration.inTeaRitual) {
        seeker.emotional.calm = clamp01(
          seeker.emotional.calm + 0.05
        );

        seeker.exhaustionLevel = clamp01(
          seeker.exhaustionLevel - 0.03
        );
      }
    }
  }
}
