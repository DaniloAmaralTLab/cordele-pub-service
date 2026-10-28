/**
 * Async build-machine state of a `Publicacao`.
 *
 * `gerando -> validando -> publicado | com_erros`. Independent from
 * `EpubcheckStatus`, which carries the epubcheck verdict.
 */
export enum PublicacaoStatus {
  GERANDO = 'gerando',
  VALIDANDO = 'validando',
  PUBLICADO = 'publicado',
  COM_ERROS = 'com_erros',
}
