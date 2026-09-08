# Auditoria automática dos módulos HTML — relatório reproduzível

Gerado por `tools/harness.js` (Playwright + Chromium real, headless).
Dados brutos em `docs/auditoria_automatica.json`. Para reproduzir depois
de qualquer correção, ver "Como rodar de novo" no fim deste arquivo.

## Resumo

| Página | Módulos com slider cobertos | Problemas encontrados (após correção) |
|---|---|---|
| cap01_paralaxe.html | 3 | 0 |
| cap02_magnitudes.html | 5 | 0 |
| cap03_termodinamica.html | 6 | 0 |
| cap04_processos_radiativos.html | 9 | 0 |
| cap05_equacoes_estrutura.html | 23 | 0 |
| cap06_estrelas_politropicas.html | 6 | 0 |
| cap07_formacao_estelar.html | 16 | 0 |
| cap08_equacoes_estado.html | 11 | 0 |
| cap09_anas_brancas.html | 5 | 0 |
| cap10_geracao_energia.html | 7 | 0 |
| cap11_nucleossintese.html | 4 | 0 |
| **Total** | **95** | **0** |

**95 módulos** com pelo menos um `<input type="range">` foram varridos
(mínimo, máximo, ~8 pontos intermediários de cada slider, mais
combinações de canto — até 16 por módulo — quando há 2+ sliders). Cada
ponto foi testado por: erro JS (console + exceção não capturada), texto
suspeito exibido (`NaN`, `Infinity`, `undefined`, `null`), e — quando o
módulo tem `<canvas>` com um `Chart.js` associado — valores não-finitos
ou vazios em qualquer dataset do gráfico.

**Dois problemas reais foram encontrados e corrigidos** (ver
`docs/AUDITORIA.md`, seção "Problemas encontrados", para a descrição
completa de causa raiz e correção):

1. **Cap. 6, Módulo 1 (integrador de Lane–Emden)**: `ReferenceError:
   LE_ZMAX is not defined`, disparado exatamente quando o slider de `n`
   se aproxima de 5 (o caso $n\to5$ citado no prompt como historicamente
   delicado — $z_R\to\infty$). O integrador entra corretamente no ramo
   de divergência, mas a mensagem explicativa referenciava uma variável
   nunca declarada. **Corrigido**: `LE_ZMAX` agora é uma constante de
   módulo (`= 500`, o mesmo valor que já era passado como `ymax` para o
   `ShootingODE`).
2. **Cap. 10, Módulo "Integração ao vivo do exemplo do ²⁵Al"**: com o
   slider de $X_H$ (fração de hidrogênio) no mínimo (0), a taxa de
   captura de próton $\lambda\to0$, logo $\tau\to\infty$, e o eixo do
   tempo do gráfico (`linspace(0, 5·τ, 150)`) virava uma sequência de
   `Infinity`/`NaN`. **Corrigido**: quando $\tau$ não é finito, o módulo
   agora mostra explicitamente "∞ (sem captura de próton nesta
   configuração)" e desenha uma reta constante $N/N_0=1$ em vez de tentar
   plotar um eixo infinito, com uma nota explicando a física (sem
   prótons, sem canal de destruição por esse processo).

Depois das duas correções, a varredura completa das 11 páginas voltou
**zero problemas**.

## Sessão 3 — extensão para layout e acessibilidade

Novo script `tools/harness_layout_a11y.js` (mesmo padrão do
`harness.js`, complementar): varre 1280/1440/1920px e checa contraste,
rótulos de `<input>`, `role="img"`+`aria-label` em `<canvas>`, e
`tabindex` negativo. Achou e ajudou a corrigir 3 problemas reais nesta
sessão (ausência de `<!DOCTYPE html>` nas 12 páginas — quirks mode;
contraste insuficiente nos botões `.botao-modulo`; 2 sliders sem rótulo
acessível no Cap. 1). Detalhes de causa raiz e correção em
`docs/AUDITORIA.md`, seção "Etapa D" e "Problemas encontrados". Depois
das correções: **0 problemas nas 11 páginas** também neste harness.
Saída bruta em `tools/harness_layout_a11y_output.json` (não versionado
por padrão — copie manualmente se quiser manter histórico, como já se
faz com `tools/harness_output.json` → `docs/auditoria_automatica.json`).

## Limitações conhecidas desta varredura (leia antes de confiar demais nela)

- **Só cobre módulos com pelo menos um `<input type="range">`.** Módulos
  puramente informativos (tabelas estáticas, diagramas sem controle) não
  são varridos — não é um problema em si, mas não conte esses módulos
  como "auditados" no sentido do checklist original.
- **Não aciona botões play/pause/reset.** A varredura só manipula
  sliders via evento `input`/`change`. Animações cujo estado depende de
  clicar "play" (ex.: campos que só mudam durante uma animação rodando)
  aparecem como "nunca mudou" no relatório bruto — isso é **esperado**,
  não é um sinal de bug, e por isso o resumo acima não lista esses casos
  como "problemas" (só entram na categoria separada `neverChanged` do
  JSON, que não foi promovida a "problema" justamente por causa desse
  viés conhecido).
- **Detecção de "campo órfão" é heurística, não definitiva.** Um campo
  que nunca muda pode ser (a) genuinely um problema, (b) um rótulo de
  botão, (c) uma nota estática legítima, ou (d) um campo dirigido por
  animação, não por slider. O harness já filtra `BUTTON`/`SELECT`, mas
  não distingue (c) de (a) — isso ainda exige olho humano. Não tratei
  "nunca mudou" como "problema" automático nesta rodada por esse motivo;
  ver `docs/auditoria_automatica.json` → campo `neverChanged` de cada
  módulo se quiser essa lista bruta.
- **Não testa layout, responsividade nem acessibilidade** (itens 1.6 e
  1.8 do checklist original) — Playwright poderia fazer isso
  (`page.setViewportSize`, `page.accessibility.snapshot()`), mas não foi
  implementado nesta sessão. Ver `docs/AUDITORIA.md`, seção "Não
  verificado".
- **Não testa Chart.js indiretamente por gráficos desenhados em
  `<canvas>` cru** (`ctx.fillRect`/`ctx.arc`/etc., sem `Chart.js`) — só
  sabe ler `.data.datasets` de instâncias reais do `Chart.js`. Vários
  módulos animados do projeto (barreira coulombiana, cadeia pp, ciclo
  CNO, etc.) desenham direto no canvas 2D sem Chart.js — esses são
  cobertos pela varredura de sliders/erros JS/texto suspeito, mas
  **não** pela checagem específica de dataset não-finito.
- Cada página é carregada do zero (`page.goto`) e cada módulo é varrido
  na mesma carga de página, na ordem em que aparece no DOM — sliders de
  módulos diferentes não interferem entre si porque cada teste de um
  módulo restaura implicitamente os outros sliders ao voltar ao loop
  seguinte (na verdade eles simplesmente não são tocados, então mantêm
  o valor da rodada anterior — isso é **intencional*, simula o uso real
  onde o aluno mexeu em vários controles ao longo da visita à página).

## Como rodar de novo

O Node.js não está instalado globalmente neste ambiente. Um binário
portátil foi baixado para `/tmp/claude-1000/node-local/` nesta sessão —
**esse diretório é efêmero** (pode não sobreviver entre sessões). Para
reproduzir do zero:

```bash
cd /tmp && mkdir -p node-local && cd node-local
curl -sL -o node.tar.xz https://nodejs.org/dist/v20.11.1/node-v20.11.1-linux-x64.tar.xz
tar -xJf node.tar.xz
export PATH="$PWD/node-v20.11.1-linux-x64/bin:$PATH"

cd "<raiz do projeto>/tools"
npm install playwright   # já configurado em tools/package.json
npx playwright install chromium

cd "<raiz do projeto>/docs" && python3 -m http.server 8960 &

cd "<raiz do projeto>/tools"
node harness.js http://localhost:8960 \
  cap01_paralaxe.html cap02_magnitudes.html cap03_termodinamica.html \
  cap04_processos_radiativos.html cap05_equacoes_estrutura.html \
  cap06_estrelas_politropicas.html cap07_formacao_estelar.html \
  cap08_equacoes_estado.html cap09_anas_brancas.html \
  cap10_geracao_energia.html cap11_nucleossintese.html
```

Saída em `tools/harness_output.json` — copie para
`docs/auditoria_automatica.json` para manter o histórico.
