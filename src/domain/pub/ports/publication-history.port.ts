/**
 * Inbound port: PublicationHistoryPort
 *
 * Exported by PUB and injected by PROJ via DI token
 * PUBLICATION_HISTORY_PORT (pub.tokens.ts). Provides a read-model over the
 * `Publicacao` aggregate for PROJ's library card list (latest) and the
 * publication history view (history), and mints short-TTL signed URLs for
 * downloading ePub artifacts.
 *
 * Field set matches the history item in the pub-service API contract.
 *
 * Zero @prisma/client imports.
 * zero @nestjs/* imports.
 * Real implementation: src/modules/pub/publication-history.service.ts
 * DI token: PUBLICATION_HISTORY_PORT (pub.tokens.ts)
 */

/** Minimal summary for PROJ's library badge — avoids transferring full records. */
export interface LatestPublicationSummary {
  readonly publicacaoId: string;
  readonly epubcheckStatus: 'valido' | 'avisos' | 'erros_criticos' | 'pendente';
}

/** Full publication record for PROJ's history view. */
export interface PublicationRecord {
  readonly publicacaoId: string;
  readonly projetoId: string;
  readonly epubcheckStatus: 'valido' | 'avisos' | 'erros_criticos' | 'pendente';
  readonly totalErros: number;
  readonly totalAvisos: number;
  /** Nullable: only set when epubcheckStatus is erros_criticos; summary of first error. */
  readonly erros: string | null;
  /**
   * Nullable: only non-null when epubcheckStatus is valido|avisos and the caller
   * has explicitly requested a signed URL. `history()` always returns null here;
   * use `signedDownloadUrl()` to obtain the download URL on demand.
   */
  readonly arquivoUrl: string | null;
  /** ISO-8601 UTC timestamp of when the build was initiated (iniciada_em). */
  readonly criadoEm: string;
}

/** Result of a signed-URL mint. */
export interface SignedDownloadUrlResult {
  readonly arquivoUrl: string;
  /** ISO-8601 UTC expiry timestamp. */
  readonly expiresAt: string;
}

/**
 * Port interface for the publication history queries that PUB exports to PROJ.
 *
 * Implementations:
 *  - Real: src/modules/pub/publication-history.service.ts
 */
export interface PublicationHistoryPort {
  /**
   * Returns a Map keyed by projetoId with the latest publication summary for
   * each project. Projects without publications are absent from the Map.
   *
   * MUST execute a single batched DB query — no N+1 per projetoId.
   *
   *
   * @param projetoIds - list of project UUIDs to query (may be empty)
   * @param empresaId  - active tenant (used for observability/logging only;
   *                    tenant isolation is enforced at the schema level)
   */
  latest(
    projetoIds: string[],
    empresaId: string,
  ): Promise<Map<string, LatestPublicationSummary>>;

  /**
   * Returns the full publication history for one project, ordered by
   * criadoEm (iniciada_em) DESC. Returns empty array when the project
   * has never been published.
   *
   * `arquivoUrl` is always null — callers use `signedDownloadUrl()` on demand.
   *
   * @param projetoId - single project UUID
   * @param empresaId - active tenant (logging/tracing)
   */
  history(projetoId: string, empresaId: string): Promise<PublicationRecord[]>;

  /**
   * Mints a short-TTL signed URL for downloading the ePub artifact of the
   * given publication.
   *
   * Throws when:
   *  - publicacaoId does not exist.
   *  - Publication has no artifact (erros_criticos | pendente status).
   *
   * The caller (PROJ's GetSignedDownloadUrlUseCase) is responsible for the
   * 409 guard before invoking this method.
   *
   * @param publicacaoId - UUID of the specific publication
   * @param empresaId    - active tenant (logging/tracing)
   */
  signedDownloadUrl(
    publicacaoId: string,
    empresaId: string,
  ): Promise<SignedDownloadUrlResult>;
}
