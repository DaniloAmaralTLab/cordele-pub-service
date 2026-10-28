# pub-service data model

PostgreSQL, managed with Prisma (`prisma/schema.prisma` and `prisma/migrations/`). Both tables live in
each empresa's schema (`emp_<slug>`, e.g. `emp_aetos`), not in `cordele_global`. The `.epub` files are not
stored in the database; the row keeps a storage key.

## `publicacao`

One row per export attempt. History is append-only: exporting again inserts a new row with the next
`sequencia`, and a finished row is not changed afterwards.

- `status`: build state, `gerando → validando → publicado | com_erros`.
- `epubcheck_status`: epubcheck verdict, `valido | avisos | erros_criticos | pendente`.
- `sequencia`: attempt number per project, unique with `projeto_id`.
- `artefato_ref`: storage key of the `.epub`; set if and only if `status = 'publicado'`.
- `resumo_erro`: short failure summary, set when `com_erros`.
- `total_erros`, `total_avisos`: counts of `validation_message` rows with severity `error` / `warning`.
- `tamanho_bytes`, `total_capitulos`, `total_imagens`: set if and only if `publicado`, measured during that
  build.
- `iniciada_em`, `concluida_em`.

The partial unique index `uq_publicacao_projeto_inflight` on `projeto_id` (where status is `gerando` or
`validando`) allows only one unfinished build per project. `projeto_id` references the projects service's
`projeto_editorial` with `ON DELETE CASCADE`.

## `validation_message`

One row per epubcheck message, kept with the publication so you can see why a build failed or warned.

- `publicacao_id` → `publicacao` (`ON DELETE CASCADE`).
- `severity`: `error | warning | info`.
- `code`: epubcheck message code (e.g. `RSC-005`, `OPF-014`).
- `message`, `location` (nullable).
- `ordem`: position of the message in the report, 0-based.
- `criado_em`.
