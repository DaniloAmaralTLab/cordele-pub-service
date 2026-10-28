/** Persisted `Metadados` (minus `materialized`). */
export interface MetadadosRead {
  readonly projetoId: string;
  readonly titulo: string | null;
  readonly autor: string | null;
  readonly isbn: string | null;
  readonly idioma: string | null;
  readonly categoria: string | null;
  readonly capaUrl: string | null;
  readonly editoraNome: string | null;
  readonly atualizadoEm: string;
}

/**
 * Outbound port: editorial metadata, owned by COMP's `GetMetadadosUseCase`.
 *
 * `null` means the project's composition was never saved — the export
 * pre-flight rejects with 422 metadata-incomplete; PUB
 * validates presence of `titulo`/`autor`/`idioma`, COMP does not.
 *
 * Use cases are tested against Jest mocks of this interface.
 */
export interface CompositionMetadataPort {
  get(projetoId: string): Promise<MetadadosRead | null>;
}

/** DI injection token for CompositionMetadataPort. Re-exported by pub.tokens.ts. */
export const CompositionMetadataPort = Symbol('CompositionMetadataPort');
