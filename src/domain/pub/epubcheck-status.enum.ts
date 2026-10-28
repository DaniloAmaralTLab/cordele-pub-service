/**
 * Epubcheck verdict surfaced to PROJ/FE.
 *
 * `pendente` until the build reaches a terminal state. Warnings do not block
 * publication: `avisos` still yields `PublicacaoStatus.PUBLICADO`.
 */
export enum EpubcheckStatus {
  VALIDO = 'valido',
  AVISOS = 'avisos',
  ERROS_CRITICOS = 'erros_criticos',
  PENDENTE = 'pendente',
}
