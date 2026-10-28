/** The only two terminal targets PUB ever requests (verdict mapping). */
export type ProjetoTargetStatus = 'publicado' | 'com_erros';

export interface AdvanceProjetoStatusResult {
  readonly projetoId: string;
  readonly newStatus: ProjetoTargetStatus;
  readonly changed: boolean;
}

/**
 * Outbound port: requests the terminal project status from PROJ's
 * `AdvanceProjetoStatusUseCase`.
 *
 * Called at most once per build outcome, from `PublicationBuildJob`. PUB
 * never writes `projeto_editorial` directly and never calls `reopen` (that
 * backward edge is PROJ/editor-owned). If this call fails, the caller
 * must still persist the `Publicacao` outcome — the build result is never
 * discarded.
 *
 * `bearerToken` is the raw JWT from the originating request, propagated
 * explicitly so the HTTP adapter can forward it as `Authorization: Bearer
 * <token>` to the PROJ service. The stub adapter ignores it.
 *
 * Use cases are tested against Jest mocks of this interface.
 */
export interface AdvanceProjetoStatusPort {
  advanceTo(
    input: { projetoId: string; targetStatus: ProjetoTargetStatus },
    bearerToken: string,
  ): Promise<AdvanceProjetoStatusResult>;
}

/** DI injection token for AdvanceProjetoStatusPort. Re-exported by pub.tokens.ts. */
export const AdvanceProjetoStatusPort = Symbol('AdvanceProjetoStatusPort');
