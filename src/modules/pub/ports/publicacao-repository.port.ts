/**
 * Re-export from the canonical domain location.
 *
 * The actual interface and DI token Symbol live in `domain/pub/ports/` so that
 * both `infrastructure/` (repository adapter) and
 * `modules/` (use cases) can import them without cross-layer violations.
 *
 * Kept here for backwards compatibility with existing use-case imports
 * — callers see the same import path with no change.
 */
export { PublicacaoRepositoryPort } from '../../../domain/pub/ports/publicacao-repository.port';
