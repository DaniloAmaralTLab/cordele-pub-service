import { ApiProperty } from '@nestjs/swagger';

/** Signed download URL response. */
export class DownloadUrlDto {
  @ApiProperty({ format: 'uuid' })
  publicacaoId!: string;

  @ApiProperty()
  arquivoUrl!: string;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;
}
