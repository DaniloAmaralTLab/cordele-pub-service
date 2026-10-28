import { EpubcheckStatus } from '../../../domain/pub/epubcheck-status.enum';
import { ValidationSeverity } from '../../../domain/pub/validation-severity.enum';

export interface ValidationReportMessage {
  readonly severity: ValidationSeverity;
  readonly code: string;
  readonly message: string;
  readonly location?: string;
}

/** epubcheck's parsed report — `verdict` is derived from message severities. */
export interface ValidationReport {
  readonly verdict: EpubcheckStatus.VALIDO | EpubcheckStatus.AVISOS | EpubcheckStatus.ERROS_CRITICOS;
  readonly messages: readonly ValidationReportMessage[];
}

/**
 * Outbound port: epubcheck validation, the one external tool PUB integrates
 * with.
 *
 * epubcheck's verdict is authoritative for `publicado` vs `com_erros`; the
 * domain knows only a verdict, never a Java process. If epubcheck cannot
 * run, the caller must record `com_erros` — an unvalidated artifact is
 * never published (doc 01 core promise).
 *
 * The adapter (`EpubcheckValidationAdapter`) runs
 * epubcheck as a child process. Use cases are tested against Jest mocks
 * of this interface.
 */
export interface EpubValidationPort {
  validate(epubBytes: Buffer): Promise<ValidationReport>;
}

/** DI injection token for EpubValidationPort. Re-exported by pub.tokens.ts. */
export const EpubValidationPort = Symbol('EpubValidationPort');
