# pub-service API

Base path: `/api/v1/pub`. JSON in and out, errors as RFC 7807 `application/problem+json`.

## Auth

Every endpoint needs `Authorization: Bearer <jwt>` (`401` without it). Scopes: `pub:read` for reads,
`pub:write` to trigger an export. The empresa (tenant schema) comes from the token claim, never from the
path, query or body. A `projetoId` or `publicacaoId` from another empresa answers `404`.

`X-Correlation-Id` is optional on the request and always echoed on the response.

## Endpoints

### `POST /projetos/{projetoId}/publicacoes` — trigger an export

Creates a `Publicacao` in `gerando`, starts the build in the background and returns `202` with a
`PublicacaoStatus` and a `Location` header. If the project already has a build in `gerando`/`validando`,
returns that one with `200` and starts nothing. No request body.

Before creating anything it checks that the project has an imported manuscript (`409 manuscript-missing`)
and that `titulo`, `autor` and `idioma` are filled in (`422 metadata-incomplete`).

### `GET /projetos/{projetoId}/publicacoes/{publicacaoId}/status` — poll build status

Returns `PublicacaoStatus`. While the build is not finished it sets `Retry-After` and
`epubcheckStatus` is `pendente`. Once `publicado`, `arquivoDisponivel` is `true`; once `com_erros`,
`resumoErro` is filled and `arquivoDisponivel` is `false`.

### `GET /projetos/{projetoId}/publicacoes` — history

`PublicacaoHistoryItem[]`, newest first. `arquivoUrl` is `null` when there is nothing to download
(`erros_criticos` or `pendente`).

### `GET /projetos/{projetoId}/publicacoes/{publicacaoId}/download` — signed download URL

```json
{ "publicacaoId": "uuid", "arquivoUrl": "https://storage.../romance-v2.epub?sig=...", "expiresAt": "2026-08-25T15:10:00Z" }
```

Short-lived signed URL; the service never streams the bytes itself. `409 artifact-not-available` when the
publication is `erros_criticos` or `pendente`.

### `GET /projetos/{projetoId}/publicacoes/stats` — KPIs

`PublicationStats`, computed live from the project's publications.

### `GET /projetos/{projetoId}/publicacoes/{publicacaoId}/validation-messages` — epubcheck messages

The epubcheck messages recorded for one publication, ordered by `ordem` ascending, as
`ValidationMessageItem[]`. Optional query `severity` (`error | warning | info`) filters by severity;
without it all messages are returned. `404 publicacao-not-found` when the publication is not in the
project / empresa.

### `POST /publications/latest-batch` — latest publication per project

Body `{ "projetoIds": string[] }`, at most 50 ids (`400 validation` above that). Returns one item per
project that has publications, the one with the highest `sequencia`; projects without publications are
left out and the order is not guaranteed. An empty list returns `[]`.

```
{ projetoId: string, publicacaoId: string, epubcheckStatus: 'valido' | 'avisos' | 'erros_criticos' | 'pendente' }
```

## Errors

`type` is `urn:cordele:pub:<code>`.

| code | HTTP | When |
|---|---|---|
| `validation` | 400 | malformed request |
| `unauthorized` | 401 | missing or invalid token |
| `forbidden` | 403 | token without the required scope or without an empresa claim |
| `projeto-not-found` | 404 | project not in the active empresa |
| `publicacao-not-found` | 404 | publication not in the project / empresa |
| `manuscript-missing` | 409 | export triggered without an imported manuscript |
| `artifact-not-available` | 409 | download of a publication that is not `valido`/`avisos` |
| `metadata-incomplete` | 422 | `titulo`/`autor`/`idioma` missing at export |
| `status-advance-failed` | 502 | the projects service rejected the final status change |

## Schemas

### `PublicacaoStatus`

```json
{
  "publicacaoId": "uuid",
  "projetoId": "uuid",
  "status": "validando",
  "epubcheckStatus": "pendente",
  "sequencia": 2,
  "totalErros": 0,
  "totalAvisos": 0,
  "resumoErro": null,
  "arquivoDisponivel": false,
  "tamanhoBytes": null,
  "totalCapitulos": null,
  "totalImagens": null,
  "iniciadaEm": "2026-08-25T15:00:00Z",
  "concluidaEm": null
}
```

- `status`: `gerando | validando | publicado | com_erros`.
- `epubcheckStatus`: `valido | avisos | erros_criticos | pendente`. Warnings still publish
  (`avisos` → `publicado`); any error or fatal gives `erros_criticos` → `com_erros`.
- `tamanhoBytes`, `totalCapitulos`, `totalImagens` are only set when `publicado`, measured at build time.

### `PublicacaoHistoryItem`

```json
{
  "publicacaoId": "uuid",
  "projetoId": "uuid",
  "epubcheckStatus": "avisos",
  "totalErros": 0,
  "totalAvisos": 2,
  "erros": null,
  "arquivoUrl": "https://storage.../romance-v2.epub?sig=... | null",
  "criadoEm": "2026-08-19T16:30:00Z"
}
```

### `PublicationStats`

```json
{
  "projetoId": "uuid",
  "total": 3,
  "publicadas": 2,
  "comAvisos": 1,
  "comErros": 1,
  "emAndamento": 0,
  "ultimoStatus": "publicado",
  "ultimoEpubcheckStatus": "avisos",
  "ultimaPublicacaoEm": "2026-08-19T16:30:00Z"
}
```

### `ValidationMessageItem`

```json
{
  "id": "uuid",
  "severity": "error",
  "code": "OPF-033",
  "message": "Duplicate spine item reference",
  "location": "OEBPS/content.opf#L42",
  "ordem": 0
}
```

- `severity`: `error | warning | info`.
- `code`: the epubcheck message id (e.g. `PKG-006`, `OPF-033`).
- `location` can be `null`.
- `ordem`: 0-based position of the message in the epubcheck report.
