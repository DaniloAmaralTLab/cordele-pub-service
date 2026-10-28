# Montagem e validação do ePub

Como o pub-service monta o pacote ePub 3 a partir do conteúdo importado e da composição, e como o
resultado do epubcheck vira o status da publicação.

## Montagem

O `EpubBuilder` gera o OPF (manifest e spine), o `nav.xhtml`, um XHTML por capítulo, o CSS do layout e
empacota tudo num ZIP OCF (com `mimetype` primeiro e sem compressão).

**Conteúdo.** Vem de `ManuscriptContentPort.getContentTree`. A estrutura (capítulos, seções e blocos
`paragraph`/`image`/`unparsed`) é percorrida pela ordem (`order`). O texto dos parágrafos é mantido como
veio; `runs`/`marks` viram spans inline. A imagem é lida do storage pelo `storageKey` e embutida no
pacote. Blocos `unparsed` entram no livro como estão, nunca são descartados. O formato da árvore que o
serviço de importação devolve está em `docs/services/imp-service/contracts/api-contract.md`.

**Metadados no OPF.** `dc:title` = `titulo`, `dc:creator` = `autor`, `dc:language` = `idioma`,
`dc:identifier` = `isbn` quando existir (senão um UUID `urn:uuid:`). A capa (`capaUrl`) entra no
manifest como item com `properties="cover-image"`.

**Layout no CSS.** Só os parâmetros suportados: `fonteCorpoFamilia`, `fonteCorpoTamanho`,
`espacamentoLinha`, `margemLateral`, `h1/h2/h3Tamanho` e o `alinhamento` de imagens. Sem layout, valem
os defaults.

A montagem é determinística: a mesma entrada gera o mesmo pacote (ordem estável no manifest, sem
timestamps desnecessários).

## Validação

`EpubValidationPort.validate` roda o epubcheck (processo filho com o JAR, relatório JSON convertido em
`ValidationReport`). O veredito do epubcheck é o que decide:

| Mensagens do epubcheck | `epubcheckStatus` | `status` |
|---|---|---|
| nenhuma | `valido` | `publicado` |
| só warnings | `avisos` | `publicado` |
| pelo menos um error/fatal | `erros_criticos` | `com_erros` |

`total_erros` e `total_avisos` saem das mensagens de validação (severity `error`/`warning`).

## Casos de borda

- Manuscrito com muitos blocos `unparsed`: o ePub ainda é gerado. A qualidade é problema editorial, não
  motivo para bloquear a publicação.
- Imagem que não existe no storage (`storageKey` não resolve): erro de montagem, publicação termina em
  `com_erros` com `resumo_erro`.
- epubcheck não executa (sem Java/JAR, crash): `com_erros`. Um artefato não validado nunca é publicado.
