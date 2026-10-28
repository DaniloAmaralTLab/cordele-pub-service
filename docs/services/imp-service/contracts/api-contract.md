# imp-service API (the parts pub-service uses)

The import service turns an uploaded DOCX/Markdown file into a structured content tree. pub-service only
reads from it. This file covers just the endpoints and payloads pub-service depends on.

Base path: `/api/v1/imp`. Every call needs `Authorization: Bearer <jwt>` with scope `imp:read`;
pub-service forwards the token of the user who triggered the export. The empresa comes from the token, so a
project or manuscript from another empresa answers `404`. Errors are RFC 7807
`application/problem+json`.

## `GET /projetos/{projetoId}/manuscritos`

Manuscripts imported into a project, newest first (`criadoEm` descending). Each upload creates a new
manuscript; nothing is changed in place, so this is an append-only history. Returns `[]` when the project
has no manuscript, `404` when the project does not exist in the empresa.

```json
[
  {
    "id": "uuid",
    "projetoId": "uuid",
    "nomeArquivo": "livro-de-cordel.docx",
    "formato": "docx",
    "status": "imported",
    "totalCapitulos": 12,
    "totalImagens": 5,
    "trechosNaoParseados": 2,
    "tamanhoBytes": 8421000,
    "criadoEm": "2026-08-24T14:31:46Z"
  }
]
```

`formato` is `docx` or `markdown`. `status` is always `imported` today.

## `GET /manuscripts/{manuscritoId}/estrutura`

The content tree of one manuscript. `404` if the manuscript does not exist in the empresa.

```json
{
  "manuscritoId": "uuid",
  "estrutura": { "...": "ContentTree, see below" }
}
```

## ContentTree

The tree is chapters → sections → blocks. Every node has an `id` (unique within the tree) and an integer
`order` that gives its position among its siblings, starting at 0.

```json
{
  "chapters": [
    {
      "id": "ch-1",
      "order": 0,
      "title": "Capítulo I — A partida",
      "sections": [
        {
          "id": "sec-1-1",
          "order": 0,
          "title": "A carta",
          "blocks": [
            {
              "id": "p-14",
              "type": "paragraph",
              "order": 0,
              "content": "Era uma vez, no sertão...",
              "runs": [
                { "text": "Era uma vez, ", "italic": true },
                { "text": "no sertão..." }
              ]
            },
            {
              "id": "img-2",
              "type": "image",
              "order": 2,
              "content": "emp_aetos/manuscritos/<id>/img-2.png"
            }
          ],
          "unparsedSegments": [
            {
              "id": "u-1",
              "order": 1,
              "reason": "complex_table",
              "rawContent": "<w:tbl>...</w:tbl>",
              "sourceLocation": { "kind": "docx", "offset": 18234 }
            }
          ]
        }
      ]
    }
  ],
  "orphanUnparsedSegments": []
}
```

### Blocks

- `type` is one of `paragraph`, `heading`, `image`, `table`, `code`, `quote`, `list`.
- `content` is the raw text of the block; for `image` it is the storage key of the extracted image.
- `runs` (optional, paragraphs only) splits the text into spans with consistent formatting. Each run has
  `text` and optional `bold`, `italic`, `underline` flags. When `runs` is present, joining `runs[].text`
  gives exactly `content`. Parsers that don't split into runs leave it out.
- Paragraph text is kept exactly as the author wrote it.

### Unparsed segments

Anything the parser could not structure is kept verbatim as an unparsed segment, so nothing from the
source is lost. Segments that occur inside a section are in that section's `unparsedSegments`; their
`order` shares the same sequence as the section's `blocks`, so the two lists together give the document
order. Segments that don't belong to any chapter/section go in the top-level `orphanUnparsedSegments`.

- `rawContent`: the original markup, untouched (DOCX XML or Markdown/HTML).
- `reason`: `complex_table`, `math_equation`, `nested_footnote`, `unknown_docx_style`,
  `unsupported_markup`, `embedded_object` or `other` (older imports may also have `unsupported_media`,
  `nested_list`, `unknown_style`, `corrupted_content`, `missing_mapping`).
- `sourceLocation` (optional): `{ kind: 'docx' | 'markdown', offset?: number }`, an approximate byte offset
  in the original file.
