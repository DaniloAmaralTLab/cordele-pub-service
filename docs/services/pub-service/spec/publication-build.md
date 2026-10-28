# Build de publicação

Como o pub-service gera uma publicação a partir de um projeto, do disparo até o status final.

## Fluxo

A `Publicacao` passa por `gerando → validando → publicado | com_erros`.

**Disparo (síncrono).** `GeneratePublicationUseCase.generate({ projetoId })` confere que o manuscrito
existe e que os metadados obrigatórios estão preenchidos, cria a `Publicacao` em `gerando` com a próxima
`sequencia`, enfileira o job no próprio processo e responde `202` com o `publicacaoId`. Só pode haver um
build não terminado por projeto (índice único parcial sobre `gerando`/`validando`).

**Job (assíncrono, mesmo processo e mesmo contexto de empresa do request).** `PublicationBuildJob.run`:

1. Em `gerando`, lê a árvore de conteúdo do serviço de importação (`getContentTree`) e os metadados e o
   layout do serviço de composição, e monta o pacote ePub 3 com o `EpubBuilder`.
2. Em `validando`, roda o epubcheck (`EpubValidationPort.validate`), grava cada mensagem do relatório
   como uma linha de `validation_message` e traduz o veredito em `status`/`epubcheckStatus`.
3. No estado final: se `publicado`, grava o `.epub` via `FileStoragePort` e preenche `artefato_ref`; se
   `com_erros`, preenche `resumo_erro`. Salva a publicação.
4. Chama `AdvanceProjetoStatusUseCase.advanceTo({ projetoId, targetStatus })` uma única vez.
5. Depois de salvar, emite `PublicationSucceeded` ou `PublicationFailed` (sem garantia de entrega).

As mensagens gravadas no passo 2 são as que o front lê em `GET .../validation-messages`.

## Regras

- As transições de status ficam na entidade; controllers e adapters não reimplementam as regras.
- `advanceTo` é chamado no máximo uma vez por desfecho, e uma falha nele não perde o resultado do build.
- O job não segura a thread do request (montagem e epubcheck são lentos); o front acompanha por polling.

## Casos de borda

- `advanceTo` falha (transição ilegal ou serviço de projetos fora do ar): a publicação continua salva e
  a falha aparece como `status-advance-failed`.
- O storage falha depois de um build válido: o desfecho é `com_erros`, com `resumo_erro` explicando a
  falha de storage.
- O processo cai no meio do build: a linha fica em `gerando`/`validando` e bloqueia novos builds do
  projeto até ser reconciliada (ver `runbook-orphan-build.md`).
