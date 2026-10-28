/**
 * Dependency-injection token constants for the PUB (Publicação) bounded
 * context.
 *
 * Mirrors the proj-service convention (proj.tokens.ts).
 */

// --- Outbound port tokens ---
// Re-exported from the port files so infrastructure/ adapters can
// import the same Symbol without depending on modules/ internals directly.

/** Injection token for PublicacaoRepositoryPort. */
export { PublicacaoRepositoryPort as PUBLICACAO_REPOSITORY_PORT } from './ports/publicacao-repository.port';

/** Injection token for ManuscriptContentPort (IMP). */
export { ManuscriptContentPort as MANUSCRIPT_CONTENT_PORT } from './ports/manuscript-content.port';

/** Injection token for CompositionMetadataPort (COMP). */
export { CompositionMetadataPort as COMPOSITION_METADATA_PORT } from './ports/composition-metadata.port';

/** Injection token for CompositionLayoutPort (COMP). */
export { CompositionLayoutPort as COMPOSITION_LAYOUT_PORT } from './ports/composition-layout.port';

/** Injection token for AdvanceProjetoStatusPort (PROJ). */
export { AdvanceProjetoStatusPort as ADVANCE_PROJETO_STATUS_PORT } from './ports/advance-projeto-status.port';

/** Injection token for EpubValidationPort (epubcheck). */
export { EpubValidationPort as EPUB_VALIDATION_PORT } from './ports/epub-validation.port';

/** Injection token for FileStoragePort (disk/S3). */
export { FileStoragePort as FILE_STORAGE_PORT } from './ports/file-storage.port';

// --- Use-case tokens ---

/** Injection token for GeneratePublicationUseCase. */
export const GENERATE_PUBLICATION_USE_CASE = Symbol('GeneratePublicationUseCase');

/** Injection token for GetPublicationStatusUseCase. */
export const GET_PUBLICATION_STATUS_USE_CASE = Symbol('GetPublicationStatusUseCase');

/** Injection token for GetPublicationHistoryUseCase. */
export const GET_PUBLICATION_HISTORY_USE_CASE = Symbol('GetPublicationHistoryUseCase');

/** Injection token for GetSignedDownloadUrlUseCase. */
export const GET_SIGNED_DOWNLOAD_URL_USE_CASE = Symbol('GetSignedDownloadUrlUseCase');

/** Injection token for GetPublicationStatsUseCase. */
export const GET_PUBLICATION_STATS_USE_CASE = Symbol('GetPublicationStatsUseCase');

// --- Ports exported to PROJ ---

/** Injection token for PublicationHistoryPort, injected by ProjModule. */
export const PUBLICATION_HISTORY_PORT = Symbol('PublicationHistoryPort');

/** Injection token for PublicationErasurePort, injected by ProjModule. */
export const PUBLICATION_ERASURE_PORT = Symbol('PublicationErasurePort');

/** Injection token for ValidationMessageRepositoryPort. */
export { ValidationMessageRepositoryPort as VALIDATION_MESSAGE_REPOSITORY_PORT } from '../../domain/pub/ports/validation-message-repository.port';

/** Injection token for ListValidationMessagesUseCase. */
export const LIST_VALIDATION_MESSAGES_USE_CASE = Symbol('ListValidationMessagesUseCase');

// --- Cross-cutting ports ---

/**
 * Injection token for EmpresaContextRunnerPort.
 *
 * Bound to `EmpresaContextService` (infrastructure/auth) in `AppModule` via
 * `useExisting`. This indirection keeps modules/ free of infrastructure/
 * imports while letting `GeneratePublicationUseCase` wrap the async
 * `PublicationBuildJob.run` call inside the correct `AsyncLocalStorage` context.
 */
export const EMPRESA_CONTEXT_RUNNER_PORT = Symbol('EmpresaContextRunnerPort');

// --- Domain-event publisher ---

/**
 * Injection token for EventPublisherPort.
 *
 * Bound to a Node.js EventEmitter-based adapter in `PubModule`. Injected by
 * `PublicationBuildJob` to dispatch `publication.succeeded` /
 * `publication.failed` domain events **after** the terminal persistence call.
 */
export { EventPublisherPort as EVENT_PUBLISHER_PORT } from './ports/event-publisher.port';

// --- Batch query use case (PROJ integration) ---

/**
 * Injection token for GetLatestBatchUseCase.
 *
 * Used by PROJ via REST POST /api/v1/pub/publications/latest-batch to resolve
 * the latest epubcheckStatus per project in a single round-trip.
 */
export const GET_LATEST_BATCH_USE_CASE = Symbol('GetLatestBatchUseCase');
