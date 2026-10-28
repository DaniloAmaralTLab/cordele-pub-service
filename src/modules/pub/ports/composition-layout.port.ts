/** One honoured, non-stale image-alignment override. */
export interface LayoutOverrideRead {
  readonly id: string;
  readonly referenciaNo: string;
  readonly tipo: 'imagem' | 'em-branco';
  readonly alinhamento: 'full' | 'centralizado' | 'junto-esquerda' | 'junto-direita' | null;
  readonly ordem: number;
}

/** Persisted `ConfiguracaoLayout`, honoured non-stale overrides only. */
export interface LayoutRead {
  readonly projetoId: string;
  readonly fonteCorpoFamilia: 'serif' | 'sans-serif';
  readonly fonteCorpoTamanho: number;
  readonly espacamentoLinha: number;
  readonly margemLateral: number;
  readonly h1Tamanho: number;
  readonly h2Tamanho: number;
  readonly h3Tamanho: number;
  readonly overrides: readonly LayoutOverrideRead[];
}

/**
 * Outbound port: layout configuration honoured by the ePub stylesheet, owned
 * by COMP's `GetConfiguracaoLayoutUseCase`.
 *
 * `null` is not a failure: PUB assembles with COMP's documented defaults
 * — only metadata is required at export.
 *
 * Use cases are tested against Jest mocks of this interface.
 */
export interface CompositionLayoutPort {
  get(projetoId: string): Promise<LayoutRead | null>;
}

/** DI injection token for CompositionLayoutPort. Re-exported by pub.tokens.ts. */
export const CompositionLayoutPort = Symbol('CompositionLayoutPort');
