/** Read-only content tree of a project's latest manuscript. */
export interface ManuscriptContentTree {
  readonly manuscritoId: string;
  readonly estrutura: readonly unknown[];
}

/**
 * Outbound port: manuscript content tree, owned by IMP.
 *
 * PUB reads the manuscript, never writes it. `null` means the project has no
 * imported manuscript — the export pre-flight rejects with 409
 * manuscript-missing.
 *
 * `bearerToken` is the raw JWT from the originating request, propagated
 * explicitly through the async call chain so the HTTP adapter can forward it
 * as `Authorization: Bearer <token>` to the IMP service.
 * The stub adapter ignores this parameter.
 *
 * Use cases are tested against Jest mocks of this interface.
 */
export interface ManuscriptContentPort {
  getContentTree(projetoId: string, bearerToken: string): Promise<ManuscriptContentTree | null>;
}

/** DI injection token for ManuscriptContentPort. Re-exported by pub.tokens.ts. */
export const ManuscriptContentPort = Symbol('ManuscriptContentPort');
