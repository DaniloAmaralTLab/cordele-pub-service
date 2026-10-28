import { Logger } from '@nestjs/common';

const logger = new Logger('BuildMetrics');

/**
 * Payload logged for a completed publication build phase.
 */
export interface BuildPhasePayload {
  /** Human-readable phase name (e.g. 'assemble', 'validating'). */
  readonly phase: string;
  /** Duration of this phase in milliseconds. */
  readonly durationMs: number;
  /** Outcome verdict for this phase. */
  readonly result: 'success' | 'failure' | 'skipped';
  /** Publication aggregate ID. */
  readonly publicacaoId: string;
  /** Project ID. */
  readonly projetoId: string;
  /** Sequential build number for idempotency. */
  readonly sequencia?: number;
  /** Epubcheck verdict (present when phase is 'validating'). */
  readonly epubcheckStatus?: string;
  /** Number of epubcheck errors. */
  readonly totalErros?: number;
  /** Number of epubcheck warnings. */
  readonly totalAvisos?: number;
}

/**
 * recordBuildPhase — logs a completed build phase as a structured JSON line
 * (machine-parseable). Never throws, so it cannot affect the build outcome.
 */
export function recordBuildPhase(payload: BuildPhasePayload): void {
  const structured = JSON.stringify({
    event: 'pub_build_phase',
    ...payload,
    ts: new Date().toISOString(),
  });
  logger.debug(structured);
}
