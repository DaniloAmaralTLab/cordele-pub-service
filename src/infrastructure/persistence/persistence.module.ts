import { Global, Module } from '@nestjs/common';

import { PublicacaoRepositoryPort } from '../../domain/pub/ports/publicacao-repository.port';
import { ValidationMessageRepositoryPort } from '../../domain/pub/ports/validation-message-repository.port';
import { DatabaseModule } from './database.module';
import { PrismaPublicacaoRepository } from './prisma-publicacao.repository';
import { PrismaValidationMessageRepository } from './prisma-validation-message.repository';

/**
 * Global persistence module for pub-service.
 *
 * Decorated with `@Global()` so `PubModule` and any future feature module can
 * inject the repository tokens without importing this module directly
 * (modules/ must not import infrastructure/ directly;
 *  infrastructure/ must not import modules/).
 *
 * This module is imported once in `AppModule`. Feature modules receive the
 * tokens through the global scope — they never reference `PersistenceModule`
 * or any infrastructure class directly.
 *
 * Token resolution:
 *   `PublicacaoRepositoryPort` (Symbol) → `PrismaPublicacaoRepository`
 *
 * Token resolution:
 *   `ValidationMessageRepositoryPort` (Symbol) → `PrismaValidationMessageRepository`
 *
 * `EpubValidationPort` and `FileStoragePort` adapters will
 * be added here.
 */
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    PrismaPublicacaoRepository,
    {
      provide: PublicacaoRepositoryPort,
      useExisting: PrismaPublicacaoRepository,
    },
    PrismaValidationMessageRepository,
    {
      provide: ValidationMessageRepositoryPort,
      useExisting: PrismaValidationMessageRepository,
    },
  ],
  exports: [
    DatabaseModule,
    PublicacaoRepositoryPort,
    ValidationMessageRepositoryPort,
  ],
})
export class PersistenceModule {}
