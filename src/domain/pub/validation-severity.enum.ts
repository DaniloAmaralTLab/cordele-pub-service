/**
 * Epubcheck message class (`validation_message.severity`).
 *
 * `error` rows drive `EpubcheckStatus.ERROS_CRITICOS`; `warning` rows drive
 * `EpubcheckStatus.AVISOS` when no `error` row is present.
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}
