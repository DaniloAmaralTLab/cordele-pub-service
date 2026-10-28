import { Global, Module } from '@nestjs/common';

import { FileStoragePort } from '../../../modules/pub/ports/file-storage.port';
import { DiskFileStorageAdapter } from './disk-file-storage.adapter';

/**
 * StorageModule — registers the disk-backed adapter for `FileStoragePort`.
 *
 * Decorated `@Global()` so `PubModule`'s use cases (and `EpubBuilder` via
 * the build job) receive the token from the global scope without importing
 * infrastructure/ directly.
 *
 * Environment variables consumed by `DiskFileStorageAdapter`:
 *   - `PUB_STORAGE_ROOT`               — base directory for artifact storage
 *   - `PUB_DOWNLOAD_URL_TTL_SECONDS`   — default signed-URL TTL (default: 900s)
 *   - `PUB_SIGN_SECRET`                — HMAC key for signed URLs
 *
 * In production, replace `DiskFileStorageAdapter` with an S3-backed adapter
 * here — no domain or application code changes required.
 */
@Global()
@Module({
  providers: [
    DiskFileStorageAdapter,
    {
      provide: FileStoragePort,
      useExisting: DiskFileStorageAdapter,
    },
  ],
  exports: [FileStoragePort],
})
export class StorageModule {}
