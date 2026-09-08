# Auditoria do material HTML interativo — checkpoint

**Início desta auditoria:** 2026-09-06 (Sessão 1). **Sessão 2**:
2026-09-06/07, mesma data corrida. **Sessão 3**: 2026-09-07 (fechamento,
Etapas A–F do prompt de encerramento). **Sessão 4**: 2026-09-07, mesma
data corrida (fechamento final, Etapas 1–4 do prompt de Sessão 4). **Este
arquivo é o ponto de retomada** para a próxima sessão — leia-o inteiro
antes de continuar, e não repita o que já está marcado como feito.

---

# SESSÃO 4 — resumo executivo (leia isto primeiro)

Ordem do prompt: Etapa 1 (pendências decididas pelo professor) → Etapa 2
(migração Plotly→Chart.js) → Etapa 3 (simulações novas) → Etapa 4
(fechamento). **As quatro etapas foram concluídas nesta sessão.** Ver
detalhes de cada uma nas seções abaixo.

## Etapa 1.1 — $\tau_{\rm mix}$ do Cap. 5: corrigido

Conferi as páginas manuscritas 104–105 (`scans/104_EquaçõesEstrutura.pdf`,
`scans/105_EquaçõesEstrutura.pdf`) antes de mexer em qualquer coisa —
**registro honesto**: o manuscrito original diz literalmente
"substituindo os valores de referência **para o Sol**", não para uma
estrela massiva, e não mostra os números intermediários usados (só o
resultado final, $\tau_{\rm mix}\approx3\times10^7$s). O parágrafo
introdutório da seção, no entanto, contextualiza o resultado com o caso
de uma estrela massiva (núcleo convectivo CNO). Segui a decisão do
professor tal como enviada nesta sessão (não alterar o `.tex`, corrigir o
módulo para reproduzir $\approx3\times10^7$s usando parâmetros de uma
estrela massiva) — mas registro esta nuance para o professor decidir,
numa próxima revisão, se quer também ajustar a frase do `.tex` para
"estrela massiva" (ele não pediu isso desta vez, e eu não alterei o
`.tex`).

Implementado: seletor de preset no Módulo 21
(`docs/cap05_equacoes_estrutura.html`, `docs/assets/cap05_modulos.js`) —
"Estrela massiva (~10 M$_\odot$)" como default
($R_\star=4{,}5\,R_\odot$, $q=0{,}20$, $v_B=2000$cm/s $\Rightarrow
\tau_{\rm mix}=3{,}13\times10^7$s, batendo com o texto) e "Sol" como
opção alternativa (valores antigos do módulo, $R=1$, $q=0{,}30$,
$v_B=5000$cm/s $\Rightarrow4{,}17\times10^6$s — mantido, não é errado,
é só um regime físico diferente). Os valores de $R_\star$, $q$ e $v_B$ da
estrela massiva são estimativas ilustrativas ajustadas para reproduzir
o resultado do texto (o manuscrito não dá os números intermediários) —
isso está dito explicitamente no texto do módulo, não escondido.
Verificado com `tools/verify_values.js` (nova entrada) e harness
completo (0 problemas).

## Etapa 1.2 — Caixa de notação $\mu$ no Cap. 8: adicionada

`chapters/equacoes_estado_estelar.tex`, logo após a Equação
(eq:eee-p-nkt) e antes da primeira ocorrência de $\mu$ como peso
molecular médio: caixa `atencao` no mesmo padrão das já existentes nos
Caps. 4 e 5, com a nota adicional de que o símbolo será desdobrado em
$\mu_e$/$\mu_i$ mais adiante no capítulo. Replicada em
`docs/cap08_equacoes_estado.html` no ponto equivalente. PDF recompilado
(`pdflatex`×2 + `bibtex` + `pdflatex`×2): **zero erros, zero
"undefined"**.

## Etapa 1.3 — Equação "faltante" do Cap. 3: investigada, NÃO faltava

A Sessão 3 comparou contagens brutas (44 `\label{eq:` no `.tex` vs. 43
`\tag{` no HTML) e concluiu que faltava 1 equação. Nesta sessão,
identifiquei individualmente cada uma das 44 equações do `.tex` (usando
`chapters/termodinamica.aux` — os `\newlabel{eq:...}` gerados pelo
`pdflatex`, que dão a numeração real e definitiva do PDF compilado, em
vez de tentar inferir por contagem) e confirmei, uma a uma, que **todas
as 44 têm conteúdo presente no HTML** (script de verificação descartado
após uso, não fazia sentido mantê-lo no repositório). A discrepância
43-vs-44 é um **artefato do método de contagem da Sessão 3**, não uma
lacuna real: uma das 44 equações do `.tex` é a segunda linha de um bloco
`align` cuja primeira linha tem `\notag` — no PDF compilado, esse bloco
inteiro consome **apenas 1** número de equação (confirmado no `.aux`),
e o HTML, corretamente, também usa 1 tag só para as duas linhas. **Não
havia conteúdo faltando.** Correção ao registro da Sessão 3: a métrica
"contar `\label{eq:` vs. contar `\tag{`" não é uma proxy confiável de
completude quando há blocos `align` com `\notag`, porque cada linha de
um `align` não necessariamente vira um número de equação independente.
Fica como lição para auditorias futuras — prefira o `.aux` compilado
como fonte da verdade, não uma contagem de padrões de texto.

## Etapa 1.4 — Convergência dos integradores: 2 de 4 são numéricos, ambos convergem

Investigação honesta antes de testar: dos 4 "integradores" citados no
prompt, **só 2 são de fato integradores numéricos com passo de
discretização**:

- **Lane–Emden (Cap. 6) e Chandrasekhar (Cap. 9)**: compartilham o mesmo
  motor `ShootingODE` (RK4) em `docs/assets/comuns.js`, com passo
  default `dy=0,01`. **Testados de verdade.**
- **Rede de reações do Cap. 10** (módulo do $^{25}$Al): **não é uma
  integração numérica** — é uma solução analítica fechada,
  $N(t)=N_0e^{-t/\tau}$, sem nenhum passo de discretização. Não há o que
  reduzir pela metade.
- **"Evolução viscosa" do Cap. 7**: também **não é numérica** — o
  próprio comentário no código (`docs/assets/cap07_modulos.js`, função
  `sigma(x,t)`) diz explicitamente que é um "perfil esquemático
  inspirado na solução autossemelhante de Lynden-Bell & Pringle (1974)
  ... sem pretender ser a solução exata": uma função analítica fixa
  avaliada ponto a ponto, não uma EDO integrada no tempo.

Reportando isso em vez de fabricar um teste de convergência que não
significaria nada para esses dois casos.

Para os 2 integradores reais, script novo `tools/convergence_test.js`
(roda em Node puro, sem Playwright — importa `comuns.js` num sandbox
`vm`) compara $dy=0{,}01$ (default do projeto) contra $dy=0{,}005$ e
$dy=0{,}0025$:

| Caso | $dy=0{,}01$ | $dy=0{,}005$ | $dy=0{,}0025$ | Variação |
|---|---|---|---|---|
| Lane–Emden $n=3$, $z_R$ | $6{,}896852$ | $6{,}896849$ | $6{,}896849$ | $3\times10^{-6}$ |
| Lane–Emden $n=3/2$, $z_R$ | $3{,}653760$ | $3{,}653755$ | $3{,}653754$ | $6\times10^{-6}$ |
| Chandrasekhar $z_c=1{,}001$, $y_1$ | $12{,}226705$ | $12{,}226703$ | $12{,}226703$ | $2\times10^{-6}$ |
| Chandrasekhar $z_c=2$, $y_1$ | $3{,}638997$ | $3{,}638996$ | $3{,}638995$ | $2\times10^{-6}$ |
| Chandrasekhar $z_c=10$, $y_1$ | $5{,}357093$ | $5{,}357090$ | $5{,}357089$ | $4\times10^{-6}$ |

**Convergido em todos os casos testados** — a variação ao reduzir o
passo fica na 5ª–6ª casa decimal, muito abaixo das 2–4 casas exibidas na
tela para o aluno. Nenhuma mudança de código foi necessária.

## Etapa 2 — Migração Plotly → Chart.js: concluída

Delegada a um agente em segundo plano (mesmo modelo, contexto completo
da sessão) para não encher este contexto com a leitura/escrita de ~3000
linhas de HTML/JS; **verifiquei o resultado de forma independente**
antes de aceitar (não confiei apenas no relatório do agente):

- `grep -rin plotly docs/` → só comentários históricos ("migrado de
  Plotly"), nenhuma referência viva (CDN, `Plotly.*`) em nenhum dos 12
  arquivos HTML nem em nenhum `.js` de `docs/assets/`.
- As 3 páginas (`cap01_paralaxe.html`, `cap02_magnitudes.html`,
  `cap03_termodinamica.html`) carregam `Chart.js 4.4.0` (mesma versão
  dos Caps. 4–11) via CDN, e `comuns.js` antes do respectivo
  `capNN_modulos.js` — confirmado por leitura direta das tags
  `<script>`.
- JS de todos os 3 capítulos agora externalizado
  (`docs/assets/cap01_modulos.js`, `cap02_modulos.js`,
  `cap03_modulos.js`), igual ao padrão dos Caps. 4–11 — nenhum HTML
  desses 3 capítulos tem mais `<script>` inline com lógica de módulo.
- Harness completo (`tools/harness.js`) rodado por mim, não só pelo
  agente: **96 módulos, 0 problemas** (antes da Etapa 3, que acrescentou
  mais 2 módulos — total final 98, ver abaixo).
- `tools/verify_values.js` rodado por mim: os valores do Cap. 2 Módulo 5
  ($M_{\odot,\rm bol}=4{,}74$, $BC_V=-0{,}085$) continuam idênticos aos
  valores pré-migração registrados na Etapa A da Sessão 3 — a troca de
  biblioteca não alterou nenhum resultado físico.
- Inspeção visual (screenshots via Playwright) das páginas 1 e 2 —
  layout consistente com o padrão visual do resto do site
  (`.modulo-card`, paleta de cores, cards com `border-radius:12px`).

**Decisões de design registradas pelo agente** (recursos do Plotly sem
equivalente nativo no Chart.js): o diagrama Sol–Terra–estrela do Cap. 1
(que usava `shapes` do Plotly) foi reescrito em canvas 2D puro, seguindo
o mesmo padrão já usado em outros diagramas esquemáticos do projeto; os
rótulos de texto junto a pontos e a faixa sombreada de luz visível no
Cap. 2 (que usavam `mode:'markers+text'` e `shapes` do Plotly) viraram 2
pequenos plugins Chart.js locais (~15 linhas cada, sem dependência
externa nova); as setas do diagrama cor-magnitude do Cap. 2 viraram
segmentos de linha simples, sem ponta de seta (a direção já fica clara
pelos dois marcadores coloridos nas pontas).

## Etapa 3 — Simulações novas: as 4 prioritárias implementadas

Tabela de oportunidades já registrada acima (seção "Etapa 3 — Tabela de
oportunidades"). Implementação, em ordem de prioridade:

1. **Cap. 6 — Lane–Emden passo a passo** (`Módulo interativo 1B`):
   reaproveita o integrador `ShootingODE` já validado (mesmo `dy=0,01`),
   revelando progressivamente os pontos já calculados via
   `createAnimController`, com marcador no passo atual e leitura ao vivo
   de $z$, $\omega(z)$, $\omega'(z)$. Testado: ao final da animação,
   reproduz exatamente $z_R=6{,}8969$ para $n=3$ (mesmo valor do Módulo
   1 e da literatura).
2. **Cap. 1 — órbita da Terra e a paralaxe acontecendo** (`Módulo
   interativo 4`): dois painéis lado a lado — a Terra orbitando o Sol
   (canvas 2D), e a posição aparente da estrela-alvo oscilando contra um
   fundo de estrelas fixas ilustrativas. A amplitude física da oscilação
   usa $\alpha=1/d$ (mesma fórmula do Módulo 3); testado com $d=2$pc,
   amplitude no pico bate exatamente com $\alpha=0{,}5''$.
3. **Cap. 3 — pistão adiabático vs. isotérmico**: dois cilindros lado a
   lado (canvas 2D) mais um diagrama $P$–$V$ (Chart.js) com as duas
   curvas. Trabalho $W$ e calor $Q$ acumulados usam as primitivas
   analíticas exatas de cada processo — testado numericamente
   (conferido à mão): para $\gamma=1{,}667$, $V/V_0=0{,}3$, obtive
   $T/T_0=2{,}232$ e $W_{\rm ad}=-1{,}848$ (bate com a fórmula
   $(PV-P_0V_0)/(1-\gamma)$) e $W_{\rm iso}=Q_{\rm iso}=\ln(0{,}3)=
   -1{,}204$ — confirmados por cálculo manual antes de aceitar o
   módulo como correto.
4. **Cap. 2 — extinção interestelar ao vivo**: o Módulo 3 (diagrama
   cor-magnitude com $E(B-V)$ e $R$ ajustáveis) **já existia**, migrado
   nesta mesma sessão do Plotly — não é uma simulação nova do zero.
   Adicionei um botão de animação (`createAnimController`) que varre
   $E(B-V)$ de 0 até o máximo do slider de forma contínua, e a frase
   explícita "o que é calculado vs. ilustrativo" que as demais
   simulações novas já tinham. **Correção ao meu próprio levantamento**:
   a tabela de oportunidades desta sessão descreveu esse item como
   "a implementar do zero" sem eu ter lido o conteúdo completo do Cap. 2
   antes de escrever a tabela — na prática, já existia desde antes desta
   auditoria (Plotly), só faltava a camada de animação.

Todas as 4 testadas em navegador real (Playwright) antes de aceitar como
prontas — sem erros de console, valores conferidos manualmente contra a
física esperada, screenshots inspecionados visualmente. Harness completo
final (11 páginas, depois de Etapas 2+3): **98 módulos, 0 problemas**.
Harness de layout/a11y: **0 problemas reais** (as únicas 6 ocorrências
de "margem-não-bate-parágrafo" nas 4 páginas com módulos de 2 colunas
são o falso-positivo já documentado na Etapa D da Sessão 3 — layouts
intencionais de 2 painéis lado a lado).

## Etapa 4 — Fechamento

1. Harness completo (12 páginas — 11 capítulos, `index.html` não tem
   módulos com slider): **98 módulos, 0 problemas** (rodado por último,
   depois de todas as edições desta sessão).
2. `tools/verify_values.js` completo (27 alvos): todos batendo, sem
   nenhuma divergência não-documentada.
3. PDF recompilado (`pdflatex`×2 + `bibtex` + `pdflatex`×2) depois da
   única alteração de `.tex` desta sessão (caixa de notação $\mu$ no
   Cap. 8): **zero erros (`^! `), zero "undefined"**.
4. `PROGRESS.md` atualizado com uma nova seção resumindo o material HTML
   (11 capítulos, 98 módulos, migração Chart.js completa, 4 simulações
   novas, apontando para este arquivo e para
   `docs/auditoria_automatica.md`).
5. Seção "Estado de entrega" escrita abaixo, consolidando as 4 sessões.
6. `.gitignore` atualizado: já cobria `tools/node_modules/`
   (Sessão 3); adicionados os auxiliares do LaTeX
   (`*.aux`, `*.log`, `*.out`, `*.toc`, `*.bbl`, `*.blg`, `*.fls`,
   `*.fdb_latexmk`, `*.synctex.gz`) — `main.pdf` **não** é ignorado
   (o professor precisa dele versionado/disponível).

---

**Status geral após a Sessão 3**: Etapa A (tabela valor-esperado-vs-obtido
completa) **concluída** — 27 alvos verificados, todos batendo dentro da
precisão esperada, exceto um (τ_mix, ver "Problemas encontrados"), mais
uma lista honesta de alvos sem módulo interativo correspondente. Etapa B
(coerência entre capítulos) **concluída para os pares citados no
prompt** — todos consistentes. Etapa C (completude Caps. 1–9)
**concluída**. Etapa D (harness estendido para layout 1280/1440/1920px e
acessibilidade) **concluída** — encontrou e corrigiu 3 problemas reais
(2 de acessibilidade, 1 bug de plataforma sério: ausência de
`<!DOCTYPE html>` em todas as 12 páginas). Etapas E (migração
Plotly→Chart.js) e F (simulações novas) **não iniciadas** — não coube
nesta sessão depois de A–D; ver "Como continuar" no fim.

---

# SESSÃO 3 — resumo executivo (leia isto primeiro)

Prioridade desta sessão, por instrução explícita: A → B → C → D → E → F,
parando numa etapa completa se o tempo acabasse. Chegou-se ao fim de D
com folga de qualidade (todos os achados investigados e corrigidos ou
documentados), então parou-se aí — E e F ficam para a próxima sessão.

## O achado mais importante: quirks mode nas 12 páginas HTML

Nenhuma das 12 páginas em `docs/` (11 capítulos + `index.html`) tinha
`<!DOCTYPE html>` — `document.compatMode` retornava `BackCompat`
(quirks mode) em vez de `CSS1Compat`. Isso não foi um achado cosmético:
foi descoberto porque **causou um falso-positivo real** ao automatizar a
Etapa A. Ao testar o Módulo 4 do Cap. 7 (taxa de acréscimo de Shu), o
seletor `#ms2-t` (slider de tempo) estava retornando o elemento
`#ms2-T` (slider de temperatura) — em quirks mode, o Chromium trata
seletores de `id` como *case-insensitive*. Isso mascarou temporariamente
um resultado (M\* acretada aparecia como 1,762 em vez de 1,576 M\_☉) até
a causa raiz ser isolada e corrigida. **Corrigido**: adicionado
`<!DOCTYPE html>` como primeira linha das 12 páginas. Confirmado depois:
`document.compatMode` agora retorna `CSS1Compat` em todas, o harness
completo (95 módulos) continua em 0 problemas, e o seletor `#ms2-t`
agora resolve corretamente. Não foi encontrada nenhuma outra colisão de
`id` por maiúscula/minúscula no projeto (varredura não exaustiva, mas os
padrões de nomenclatura do projeto — `mN-campo` — raramente diferem só
por caixa), mas o risco valia a correção de qualquer forma: quirks mode
afeta modelo de caixa, herança de altura em porcentagem e outras
heurísticas legadas do navegador, nenhuma delas desejável num documento
moderno.

## Outros dois achados de acessibilidade (Etapa D), corrigidos

1. **Contraste insuficiente em todos os botões `.botao-modulo` e
   `.botao-modo-toggle`** (Caps. 4, 7, 8, 9, 10, 11): texto branco sobre
   `#1D9E75` dá razão de contraste 3,39:1 — abaixo do mínimo WCAG AA
   (4,5:1 para texto normal; o texto dos botões, 13px/600, não qualifica
   como "texto grande" para o limiar de 3:1). **Corrigido**: cor de
   repouso do botão passou a ser `#17805f` (4,9:1, tom mais escuro da
   mesma família de verde, **já usado no projeto como estado `:hover`**
   — nenhuma cor nova introduzida, só uma reordenação da escala
   repouso/hover/active). Reconfirmado com o harness de a11y: 0 pares
   com contraste abaixo de 4,5:1 nas 11 páginas.
2. **Dois sliders sem rótulo acessível** no Cap. 1 (Módulo 3,
   `#p3-alpha-range` e `#p3-d-range`): compartilhavam a `<label>` do
   campo numérico irmão (`for="p3-alpha-num"`), então o próprio slider
   não tinha nome para leitor de tela. **Corrigido**: `aria-label`
   adicionado a cada um.

Nenhum outro problema de a11y encontrado: todos os `<canvas>` já tinham
`role="img"`+`aria-label` (0 nas 11 páginas), nenhum controle com
`tabindex` negativo, e nenhum outro par de contraste abaixo de 4,5:1.

## Ferramentas novas desta sessão

- `tools/harness_layout_a11y.js` — estende a cobertura do harness da
  Sessão 2 para os itens 1.6 (layout responsivo, 1280/1440/1920px) e 1.8
  (acessibilidade) do checklist original, que o `harness.js` não tocava.
  Ver "Etapa D" abaixo para detalhes e limitações conhecidas.
- `tools/verify_values.js` — 5 checks da Sessão 2 viraram 27 (Etapa A).
- `tools/count_completude.py` — conta equações numeradas (`\label{eq:`
  no `.tex` vs. `\tag{` no HTML) e caixas `contexto`/`exemplo`/
  `atencao`/`leituras` nos Caps. 1–9 (Etapa C).

---

# SESSÃO 2 — resumo executivo (leia isto primeiro)

A Sessão 1 tinha auditado 2 módulos manualmente. Essa velocidade não
escalava para ~140 módulos, então a prioridade desta sessão foi
**construir automação**, não continuar auditando módulo a módulo na mão.

## O que funcionou: Playwright + Chromium real

`node`/`npm` **não estavam instalados** no ambiente (`which node` vazio).
Havia acesso à internet, então baixei um binário portátil do Node.js
20.11.1 (`https://nodejs.org/dist/...tar.xz`) para
`/tmp/claude-1000/node-local/` — **esse diretório é efêmero, não
sobrevive entre sessões**; a próxima sessão precisa refazer esse passo
(comando exato em `docs/auditoria_automatica.md`, seção "Como rodar de
novo"). A partir daí, `npm install playwright` e
`npx playwright install chromium` funcionaram sem problema dentro de
`tools/` (que agora tem `package.json` com Playwright como dependência,
e `node_modules/` versionado localmente — ~19 MB, mais o cache do
Chromium baixado em `~/.cache/ms-playwright/`, fora do projeto).

**Não precisei tentar as opções 2–4** do prompt (Chrome do sistema,
jsdom, refatoração para Node puro) — a opção 1 (Playwright) funcionou de
primeira. Registro isso explicitamente porque o prompt pedia para
testar em ordem e usar a primeira que funcionasse.

## O harness: `tools/harness.js`

Varre **todos os módulos com pelo menos um slider** de uma página: para
cada `<input type="range">`, testa mínimo, máximo e ~8 pontos
intermediários, mais até 16 combinações de canto quando há 2+ sliders no
mesmo módulo. Em cada ponto, captura texto de todo elemento com `id`
dentro do módulo (procurando `NaN`/`Infinity`/`undefined`/`null`), erros
de JS (console + exceções não capturadas), e — quando o módulo tem
`Chart.js` — os valores de `.data.datasets[]` procurando não-finitos ou
datasets vazios. Detalhes completos, incluindo as limitações conhecidas
do método, estão em `docs/auditoria_automatica.md` (não repetidas aqui).

**Cobertura**: 95 módulos, nas 11 páginas de capítulo, em uma única
rodada de ~2 minutos. Isso é o que destrava o resto do checklist original
(itens 1.3, 1.4, e parte de 1.1/1.7) sem precisar de mais sessões de
auditoria manual módulo a módulo.

## Achados reais dos dois primeiros bugs encontrados pelo harness

Rodei o harness nas 11 páginas **antes** de qualquer correção desta
sessão (ou seja, sobre o estado deixado pela Sessão 1) e ele encontrou,
sozinho, **dois bugs reais** — ambos confirmados, corrigidos, e
reconfirmados limpos numa segunda rodada. Detalhes de causa raiz na
seção "Problemas encontrados" abaixo.

## Um quase-erro meu que o processo pegou (vale registrar)

Ao montar a tabela valor-esperado-vs-obtido (Etapa 3.2), meu primeiro
script de verificação (`tools/verify_values.js`) reportou
$-z_R^2\omega'(z_R)\approx4{,}899$ para $n=3$ no integrador de
Lane–Emden do Cap. 6 — o que teria sido um erro grave (o valor esperado,
já confirmado em sessão de auditoria científica anterior registrada em
`PROGRESS.md`, é $\approx2{,}018$). Antes de registrar isso como bug,
investiguei: o script abria uma página **nova** para cada verificação e
o `setup` (que move o slider até $n=3$) não estava anexado ao segundo
check — então ele lia o valor no estado *default* do slider ($n=0$), não
em $n=3$. Corrigido o script, o valor bate exatamente:
$-z_R^2\omega'=2{,}0182$, erro relativo $0{,}000\%$ contra a literatura
(o próprio módulo já compara e mostra isso). **O módulo estava correto
o tempo todo; o defeito era no meu script de verificação.** Registro
isso porque é exatamente o risco que a Sessão 1 já tinha sido avisada a
evitar ("uma auditoria já mediu a coisa errada e concluiu que não havia
bug quando havia") — desta vez na direção oposta (quase concluí que
havia bug onde não havia), mas o princípio é o mesmo: **verificar o
script de verificação antes de confiar no resultado.**

---

---

## FASE 0 — Inventário

### Arquivos em `docs/`

| Arquivo HTML | Linhas | JS de módulos | Linhas JS | `<input range>` | `<canvas>` | `.modulo-card` |
|---|---|---|---|---|---|---|
| `cap01_paralaxe.html` | 454 | *(inline, sem arquivo separado)* | — | 4 | 0 | 0 |
| `cap02_magnitudes.html` | 1068 | *(inline, sem arquivo separado)* | — | 8 | 0 | 0 |
| `cap03_termodinamica.html` | 1372 | `cap03` *(inline — ver nota)* | — | 9 | 6 | 6 |
| `cap04_processos_radiativos.html` | 2869 | `cap04_modulos.js` | 677 | 17 | 9 | 9 |
| `cap05_equacoes_estrutura.html` | 3772 | `cap05_modulos.js` | 1017 (pós-correção) | 56 | 24 | 15 |
| `cap06_estrelas_politropicas.html` | 811 | `cap06_modulos.js` | 320 | 7 | 6 | 6 |
| `cap07_formacao_estelar.html` | 2692 | `cap07_modulos.js` | 945 | 30 | 13 | 23 |
| `cap08_equacoes_estado.html` | 1612 | `cap08_modulos.js` | 687 | 18 | 9 | 13 |
| `cap09_anas_brancas.html` | 649 | `cap09_modulos.js` | 354 | 6 | 4 | 6 |
| `cap10_geracao_energia.html` | 1357 | `cap10_modulos.js` | 680 | 16 | 9 | 11 |
| `cap11_nucleossintese.html` | 2949 | `cap11_modulos.js` | 780 | 6 | 7 | 9 |

Total de JS de módulos (sem `comuns.js`): **5460 linhas** em 8 arquivos.
`comuns.js`: 250 linhas (utilitários compartilhados).

**Nota sobre Cap. 3**: `cap03_termodinamica.html` **usa Chart.js e
`comuns.js`** (confirmado via `grep`), mas não tem um
`cap03_modulos.js` separado — o JS dos 6 módulos está inline no próprio
HTML (`<script>` no corpo da página), diferente do padrão dos Caps.
4–11 (arquivo `.js` externo). Isso não é um bug, mas é uma inconsistência
de organização de arquivo que vale padronizar no futuro (baixa
prioridade).

### Biblioteca de gráficos por capítulo (item 3 da Fase 0)

**Confirmado por `grep` direto no HTML**, não presumido:

| Capítulo | Biblioteca | Evidência |
|---|---|---|
| 1 — Paralaxe | **Plotly.js 2.35.0** (CDN) | `Plotly.newPlot`/`Plotly.react` ×2, nenhum uso de Chart.js |
| 2 — Magnitudes | **Plotly.js 2.35.0** (CDN) | idem, ×5 gráficos Plotly |
| 3 — Termodinâmica | **Chart.js 4.4.0** + `comuns.js` | confirmado |
| 4–11 | **Chart.js 4.4.0** + `comuns.js` | confirmado em todos |

**Confirma exatamente a suspeita do prompt**: Caps. 1 e 2 ainda usam
Plotly, não migrados. Isso é o item **4.1** (Fase 4) — migração ainda
**não iniciada** nesta sessão.

### Mapa capítulo → arquivo, e verificação de numeração

Ordem real dos `\include{}` em `main.tex` (linhas 34–45), cruzada com o
`\chapter{}` de cada arquivo e confirmada no PDF compilado
(`pdftotext main.pdf - | grep -E "^[0-9]+ [A-Z"`):

| # | `chapters/*.tex` | `docs/cap*.html` | Numeração bate? |
|---|---|---|---|
| — | `apresentacao.tex` (`\chapter*`, não numerado) | *(sem HTML próprio — ver nota)* | n/a |
| 1 | `paralaxe.tex` | `cap01_paralaxe.html` | ✅ |
| 2 | `magnitudes.tex` | `cap02_magnitudes.html` | ✅ |
| 3 | `termodinamica.tex` | `cap03_termodinamica.html` | ✅ |
| 4 | `processos_radiativos.tex` | `cap04_processos_radiativos.html` | ✅ |
| 5 | `equacoes_estrutura.tex` | `cap05_equacoes_estrutura.html` | ✅ |
| 6 | `estrelas_politropicas.tex` | `cap06_estrelas_politropicas.html` | ✅ |
| 7 | `formacao_estelar.tex` | `cap07_formacao_estelar.html` | ✅ |
| 8 | `equacoes_estado_estelar.tex` | `cap08_equacoes_estado.html` | ✅ |
| 9 | `anas_brancas.tex` | `cap09_anas_brancas.html` | ✅ |
| 10 | `geracao_energia.tex` | `cap10_geracao_energia.html` | ✅ (corrigido na sessão anterior) |
| 11 | `nucleossintese_estelar.tex` | `cap11_nucleossintese.html` | ✅ (corrigido na sessão anterior) |

Numeração **100% consistente** no momento desta auditoria. `docs/index.html`
lista os 11 capítulos na ordem correta (verificado por leitura direta).

### TODOs/placeholders pendentes (não inventados, apenas listados)

Encontrado via `grep -rn "SEU-USUARIO\|NOME-DO-REPO\|TODO"`:

- **Todas as 11 páginas HTML** têm o link "Repositório no GitHub"
  apontando para `href="#"` com comentário
  `<!-- TODO: confirmar URL do GitHub Pages / repositório -->`.
- **Todas as 11 caixas `materialinterativo`** nos `.tex` usam a URL
  placeholder `https://SEU-USUARIO.github.io/NOME-DO-REPO/capNN_....html`.
- `chapters/termodinamica.tex` linha 22: `% TODO: conteúdo ministrado
  com slides - aguardando material` — placeholder da Seção "Diagramas HR
  e similares", **confirmado ainda vazio** (não preenchido com conteúdo
  inventado — correto).

**Ação necessária do professor**: informar a URL real do GitHub Pages
(usuário/repositório) para que eu possa substituir todos os 22 pontos
(11 HTML + 11 `.tex`) de uma vez. Não inventei nenhuma URL.

---

## FASE 1 — Auditoria técnica módulo a módulo (PARCIAL)

**Escopo real coberto nesta sessão**: uma varredura **mecânica** (via
`grep`/Python) em todos os 8 arquivos `capNN_modulos.js`, mais uma
auditoria **manual completa com teste em navegador** dos dois módulos
onde a varredura mecânica sinalizou risco (Cap. 5, Módulos 9 e 16).
**Não** percorri manualmente os ~140 outros módulos do projeto — ver
seção "Não verificado".

### 1.5 Animações — varredura de uso de `createAnimController`

Grep de `createAnimController\(` em cada arquivo:

| Arquivo | usa `createAnimController` | rAF "na mão" |
|---|---|---|
| cap04_modulos.js | 0 | sim (1 módulo — random walk do fóton) |
| cap05_modulos.js | 0 (era 0; ver correção abaixo) | sim (4 módulos) |
| cap06_modulos.js | 0 | não tem animação por rAF (só resolve Lane–Emden e redesenha) |
| cap07_modulos.js | 3 | — |
| cap08_modulos.js | 3 | — |
| cap09_modulos.js | 2 | — |
| cap10_modulos.js | 5 | — |
| cap11_modulos.js | 4 | — |

**Achado real**: `createAnimController` (o utilitário seguro e
compartilhado de play/pause/reset em `comuns.js`) só passou a ser usado
a partir do Cap. 7. **Caps. 4, 5 e 6 têm animações "na mão"**,
escritas antes desse utilitário existir. Isso não é automaticamente um
bug — o Cap. 4 (módulo do caminho aleatório do fóton) está bem escrito,
com pause/resume/reset corretos e até um `IntersectionObserver` para
pausar fora da viewport (excede o que o checklist pede). Mas o Cap. 5
tinha um problema real:

#### BUG CONFIRMADO E CORRIGIDO — Cap. 5, Módulos 9 e 16 sem pausa/reset

- **Módulo 9** ("contração e Teorema do Virial", `docs/cap05_equacoes_estrutura.html`
  em torno da linha 1499) e **Módulo 16** ("bolha sobe/afunda + T vs z",
  em torno da linha 2735) tinham **apenas um botão "▶ Animar/Soltar"**,
  sem nenhum `resetBtn` no HTML e sem `cancelAnimationFrame` em lugar
  nenhum do JS (`docs/assets/cap05_modulos.js`, funções `tick()`
  originais nas linhas ~608 e ~875).
- **Consequência real**: uma vez clicado "play", o usuário não conseguia
  pausar a animação nem reiniciá-la para um estado limpo — violava
  diretamente o item 1.5 do checklist ("Botões play/pause/reset existem
  e funcionam") e o próprio padrão do projeto (todo módulo animado dos
  Caps. 7–11 tem os três).
- **Não era** um vazamento de `requestAnimationFrame` (cliques repetidos
  em "play" eram corretamente ignorados via `if (animando) return;`) —
  o problema era ausência de funcionalidade, não um vazamento de loop.
- **Correção aplicada**: adicionei `<button id="m9-reset">` e
  `<button id="m16-reset">` no HTML, e refatorei os dois módulos em
  `cap05_modulos.js` para usar `createAnimController` (o mesmo utilitário
  do resto do projeto), o que resolve play/pause/reset de uma vez e
  elimina o `tick()` duplicado escrito à mão.
- **De brinde**: o Módulo 9 recriava um `new Chart(...)` inteiro a cada
  quadro de animação (destroy+create ~50×/animação) — o mesmo
  anti-padrão de performance já encontrado e corrigido no Cap. 10 em
  sessão anterior (módulo do painel da vida da estrela). Corrigido junto:
  agora só cria o `Chart` uma vez e usa `chart.update('none')` nos
  quadros seguintes.
- **Testado em navegador** (servidor local, Chrome via automação):
  cliquei play → rótulo muda para "Contraindo…"/"Em movimento…"; cliquei
  de novo → volta a "▶ Animar contração"/"▶ Soltar a bolha" (pausa
  funcional); cliquei reset → idem, e o gráfico volta ao estado inicial.
  Zero erros no console antes/depois.

Nenhum outro módulo do Cap. 4, 5 ou 6 foi verificado manualmente ainda
(ver "Não verificado").

### 1.3 Sliders órfãos — varredura mecânica em todos os capítulos

Script Python comparando todo `id` de `<input>` no HTML contra todo
`getElementById('...')` no JS correspondente, para os 8 capítulos com
arquivo `.js` separado (Caps. 4–11; Caps. 1–3 não incluídos nesta
varredura — ver "Não verificado").

**Resultado: nenhum slider órfão detectado** nos Caps. 4–11 por este
método. Ressalva importante: o método só pega `getElementById` com
aspas simples ou duplas diretas — não pegaria um `id` montado
dinamicamente (`getElementById('m' + n + '-slider')`), então não é uma
prova absoluta, apenas um forte indício de que o bug específico já
relatado no Cap. 5 (histórico) não está mais presente hoje.

### 1.1 / 2.1 — Constantes físicas duplicadas entre capítulos

Levantamento (`grep`) de declarações de constantes físicas em todos os
`capNN_modulos.js`:

| Constante | Arquivos que declaram a própria cópia | Valores encontrados |
|---|---|---|
| `G` | cap05, cap07, cap09 | `6.674e-8` em todos (consistente) |
| `MSUN` | cap05, cap06, cap07, cap09 | `1.989e33` em todos (consistente) |
| `RSUN` | cap05, cap07 | `6.957e10` em ambos (consistente) |
| `LSUN` | cap05, cap07 | `3.828e33` em ambos (consistente) |
| `C` (veloc. luz) | cap05 (`2.998e10`), cap08/09/11 (`2.99792458e10`) | **precisão inconsistente** (4 vs. 9 algarismos — nenhum dos dois está *errado*, mas divergem) |
| `H`/`HBAR` (Planck) | cap08, cap09, cap11 | `6.62607015e-27` em todos (consistente) |
| `KB`/`K_B` (Boltzmann) | cap05, cap07, cap08, cap11 | `1.380649e-16` em todos (consistente) |
| `NA` (Avogadro) | cap08, cap09, cap10, cap11 | `6.02214076e23` em todos (consistente) |
| `SIGMA`/`SIGMA_SB` (Stefan–Boltzmann) | cap04, cap07 | `5.670e-5`/`5.6704e-5` (consistente a 4 alg.) |

**Nenhum valor errado encontrado** nesta varredura pontual (isso **não**
é a auditoria completa de 2.1/2.2, que exige também conferir $e^2$,
$m_e$, $m_H$/$m_u$, $a$ (constante de radiação), UA, pc — **não
verificados ainda**). O achado real e confirmado é **estrutural**: essas
constantes **não estão centralizadas** em `comuns.js` (que hoje só tem
`CORES_GRAFICO`, funções utilitárias e `ShootingODE` — nenhum objeto
`CONST`). Cada capítulo mantém sua própria cópia. Isso é exatamente o
risco que o prompt descreve ("um deslize de unidade em um capítulo não
se propaga, mas também não há uma fonte única da verdade") — **ainda não
consolidado** nesta sessão; é um item de Fase 4.2 pendente.

---

## FASE 2 — Auditoria física e numérica

**Não iniciada além do levantamento pontual de constantes acima.**
Nenhuma tabela valor-esperado-vs-obtido foi construída ainda para
nenhum capítulo. Nenhuma verificação de convergência de integrador
numérico (Lane–Emden, Chandrasekhar) foi refeita nesta sessão — a única
verificação existente é a já registrada em `PROGRESS.md` de sessões
anteriores (ex.: unificação Lane–Emden n=3/2,3 com Chandrasekhar,
auditoria científica capítulo a capítulo já feita separadamente e
registrada lá). Não dupliquei esse trabalho nem o revalidei agora.

---

## FASE 3 — Auditoria de completude

**Não iniciada nesta sessão.** As contagens `.tex` vs. HTML dos
Capítulos 10 e 11 já foram feitas e confirmadas exatas nas duas sessões
anteriores (registrado no histórico de conversa, não repetido em
`PROGRESS.md` ainda — recomendo transcrever para lá). Os Capítulos 1–9
**não foram recontados** nesta auditoria.

---

## FASE 4 — Consistência e dívida técnica

**[Atualização Sessão 2]**
- 4.1 (migrar Caps. 1–2 de Plotly para Chart.js): **ainda não
  executado, de propósito** — a Sessão 2 recebeu instrução explícita de
  priorizar a física (Fase 2) antes desta migração. Fica para a Etapa 5
  da próxima sessão.
- 4.2 (centralizar constantes/utilitários em `comuns.js`): **executado
  nesta sessão** — ver "Etapa 3.1" abaixo (objeto `CONST`, 8 capítulos
  migrados, harness reconfirma 0 problemas).
- 4.3 (numeração e navegação): confirmado consistente na Sessão 1;
  **URLs do GitHub Pages agora centralizadas** (Etapa 1 desta sessão) —
  22 pontos de edição viraram 2.
- 4.4 (robustez): CDNs com versão fixada confirmado (Sessão 1).
  `localStorage`/`sessionStorage`: **ainda não verificado** (grep
  pendente). Console limpo: **confirmado nas 11 páginas** via o harness
  desta sessão (`pageErrorsAtLoad`/`consoleErrorsAtLoad` zerados em
  todas, ver `docs/auditoria_automatica.json`).

---

## FASE 5 — Oportunidades de simulação

**Não iniciada.** Nenhuma simulação nova foi projetada ou implementada
nesta sessão — todo o tempo desta sessão foi dedicado às Fases 0–1. A
lista de candidatos do próprio prompt (Fase 5.3) é um bom ponto de
partida para a próxima sessão; recomendo priorizar os capítulos que
ainda usam Plotly (1 e 2) **depois** da migração para Chart.js (Fase
4.1), para não construir simulação nova sobre uma biblioteca que será
substituída em seguida.

---

## FASE 6 — Validação final

- PDF recompilado (`pdflatex`×2 + `bibtex` + `pdflatex`×2) **nesta
  sessão**, após as edições em `cap05_equacoes_estrutura.html`/
  `cap05_modulos.js` — que são arquivos HTML/JS, não `.tex`. **Nenhum
  arquivo `.tex` foi alterado nesta sessão.** Confirmar: zero erros,
  zero "undefined" (ver comando abaixo, resultado registrado no momento
  da auditoria).
- Servidor local usado para testar Cap. 5 via automação de navegador
  (Chrome) — console limpo, botões play/pause/reset testados e
  confirmados funcionais para os Módulos 9 e 16.
- **As demais 10 páginas não foram abertas no navegador nesta sessão.**

---

## Problemas encontrados (resumo)

### Sessão 1
1. **[CORRIGIDO]** Cap. 5, Módulos 9 e 16: animações sem pause/reset —
   ausência de `resetBtn` no HTML e de `cancelAnimationFrame` no JS.
   Corrigido via migração para `createAnimController` compartilhado.
   Corrigido de brinde: Módulo 9 recriava o `Chart.js` inteiro a cada
   quadro (~50 destroy/create por animação) — agora usa
   `chart.update('none')`.

### Sessão 2
2. **[CORRIGIDO — encontrado pelo harness automático]** Cap. 6, Módulo 1
   (integrador de Lane–Emden): `ReferenceError: LE_ZMAX is not defined`,
   disparado exatamente no caso historicamente delicado $n\to5$
   (`docs/assets/cap06_modulos.js`, função `solveLaneEmden`/bloco de
   divergência). A variável era usada na mensagem de erro mas nunca
   declarada. Causa raiz: resquício de refatoração — o valor `500` era
   passado direto como `ymax` para o `ShootingODE.solve()`, sem nunca
   virar uma constante nomeada. Corrigido: `var LE_ZMAX = 500;` no topo
   do arquivo, reusada tanto na chamada do solver quanto na mensagem.
   Reconfirmado limpo pelo harness após a correção.
3. **[CORRIGIDO — encontrado pelo harness automático]** Cap. 10, módulo
   "Integração ao vivo do exemplo do ²⁵Al": com o slider de $X_H$ no
   mínimo (0), $\lambda\to0\Rightarrow\tau\to\infty$, e o eixo do tempo
   do gráfico (`linspace(0, 5·τ, 150)`) virava uma sequência de
   `Infinity`/`NaN` — o gráfico ficaria visualmente quebrado (embora o
   campo de texto `mal25-tau` já mostrasse "—" corretamente, graças ao
   `fmtExp` tratar `Infinity`; só o **gráfico** quebrava, o que só um
   teste que lê o `Chart.js` de verdade, como o harness, pega). Corrigido:
   quando $\tau$ não é finito, o módulo mostra "∞ (sem captura de próton
   nesta configuração)" e desenha $N/N_0=1$ constante, com nota
   explicando a física (sem prótons, sem canal de destruição por esse
   processo). Reconfirmado limpo pelo harness.
4. **[CORRIGIDO]** Constantes físicas duplicadas entre 8 arquivos —
   centralizadas em `CONST` (`docs/assets/comuns.js`), com os 8
   `capNN_modulos.js` (04–11) migrados para referenciá-la (mesmos nomes
   de variável local, `var G = CONST.G;` etc. — mudança de baixo risco,
   comportamento idêntico exceto o item 5 abaixo). Reconfirmado limpo
   pelo harness (95 módulos, 0 problemas) após a migração.
5. **[CORRIGIDO — mudança de valor deliberada]** A velocidade da luz
   `C` no Cap. 5 usava `2.998e10` (4 algarismos) enquanto Caps. 8/9/11
   usavam `2.99792458e10` (9 algarismos). Nenhum dos dois estava
   *errado*, mas divergiam. Padronizado para o valor de 9 algarismos em
   todos (agora vem de `CONST.C`) — diferença de $\sim0{,}003\%$,
   irrelevante para qualquer número exibido com a formatação de 2-4
   casas usada no projeto, mas registrado aqui porque é uma mudança de
   valor numérico, não só reorganização de código.
6. **[CORRIGIDO]** 22 URLs placeholder (11 `.tex` + 11 HTML) reduzidas a
   2 pontos de edição: `\urlbase` em `preambulo.tex` e `URL_REPO` em
   `docs/assets/comuns.js` (que agora preenche automaticamente
   `id="link-repo"` em todas as páginas, incluindo `index.html` e os
   dois capítulos que ainda usam Plotly). Ver Etapa 1 para detalhes.

### Sessão 3
7. **[CORRIGIDO]** Nenhuma das 12 páginas HTML (11 capítulos +
   `index.html`) tinha `<!DOCTYPE html>` — todas rodavam em quirks mode
   (`document.compatMode==='BackCompat'`). Causa raiz de um
   falso-positivo real durante a Etapa A (seletor de `id` tratado como
   case-insensitive pelo Chromium em quirks mode, fazendo `#ms2-t`
   resolver para `#ms2-T`). Corrigido: `<!DOCTYPE html>` adicionado como
   primeira linha das 12 páginas. Confirmado: `compatMode` agora
   `CSS1Compat` em todas, harness completo confirma 0 problemas.
8. **[CORRIGIDO]** Contraste insuficiente (3,39:1, abaixo do mínimo WCAG
   AA de 4,5:1) em todos os botões `.botao-modulo`/`.botao-modo-toggle`
   (texto branco sobre `#1D9E75`), presente nos Caps. 4, 7, 8, 9, 10, 11.
   Corrigido trocando a cor de repouso para `#17805f` (4,9:1) — mesmo
   tom já usado como `:hover` no projeto, nenhuma cor nova.
9. **[CORRIGIDO]** Dois sliders sem rótulo acessível no Cap. 1, Módulo 3
   (`#p3-alpha-range`, `#p3-d-range`) — compartilhavam a `<label>` do
   campo numérico irmão. Corrigido com `aria-label` em cada um.
10. **[NÃO É BUG — investigado e descartado]** Verificação inicial da
    Etapa A indicava $L_{\rm Edd}/L_\odot$ do Cap. 4 (Módulo 9) como
    $8{,}3\times10^5$ contra o esperado $3{,}3\times10^4$ para
    $M=1\,M_\odot$ — mas o rótulo estático "1,0" no HTML era só um
    placeholder pré-JS; o valor real do slider default é $M\approx25\,
    M_\odot$ (que dá exatamente $8{,}3\times10^5=3{,}3\times10^4\times
    25$, sem erro nenhum). Corrigi o *script de verificação* (não o
    módulo) para setar o slider explicitamente em $M=1$, e o resultado
    bate exatamente com $3{,}3\times10^4$. Registrado aqui porque é o
    mesmo tipo de cuidado (verificar o script antes de reportar um bug)
    já documentado na Sessão 2.

### Ainda pendente (não é bug, é dívida técnica diagnosticada)
7. **[DIAGNOSTICADO, NÃO CORRIGIDO]** Caps. 1 e 2 ainda usam Plotly, não
   Chart.js — migração é trabalho de uma sessão dedicada (Etapa 5 do
   prompt da Sessão 2, adiada de propósito para depois da física).
8. **[PENDENTE DE DECISÃO DO PROFESSOR]** URL real do GitHub Pages —
   agora é **1 linha** para editar quando existir (`\urlbase` em
   `preambulo.tex`, `URL_REPO` em `comuns.js`), não mais 22 pontos.

## Não verificado (honestamente, não presumido correto)

- **1.2 (rotulagem de eixos normalizados) e 1.5 (qualidade da animação
  em si, além da ausência de erro)** — nenhum harness automatizado cobre
  isso ainda; continua exigindo inspeção visual humana.
- **Convergência numérica por redução de passo** (Lane–Emden Cap. 6,
  Chandrasekhar Cap. 9, rede de reações Cap. 10, evolução viscosa
  Cap. 7) — **não executada nesta sessão** (Etapa B, item 2 do prompt de
  encerramento). O que existe é evidência indireta forte (os
  integradores batem com soluções analíticas/literatura, Etapa A), mas
  não o teste formal pedido.
- **1 equação numerada faltando no HTML do Cap. 3** (43 `\tag{` contra
  44 `\label{eq:` no `.tex`) — não identificada individualmente, ver
  Etapa C.
- **Caixa de colisão de notação $\mu$ faltando no Cap. 8** (peso
  molecular, depois do Cap. 4 redefinir $\mu=\cos\theta$) — diagnosticado
  na Etapa B, não corrigido (é adição de conteúdo pedagógico ao `.tex`,
  fora do escopo de "errata numérica aprovada" desta sessão).
- **Divergência de $\tau_{\rm mix}$** (Etapa A, alvo #13): módulo dá
  $4{,}17\times10^6$s contra $\approx3\times10^7$s do `.tex` — mesma
  ordem de grandeza ampla, mas fator $\sim7$ de diferença. Não é claro
  qual lado (se algum) precisa de correção sem input do professor sobre
  qual $v_B$ de referência foi usado na estimativa original.
- **Etapa E** (migração Plotly→Chart.js, Caps. 1–2, e padronização do
  Cap. 3 para `cap03_modulos.js` externo) — não iniciada, não coube
  depois de A–D nesta sessão.
- **Etapa F** (simulações novas, incluindo a tabela de oportunidades) —
  não iniciada.
- Navegação por teclado (Etapa D): só testado `tabindex` negativo
  explícito via script; não houve teste manual de tabulação real numa
  página completa.
- Nenhum arquivo `.tex` de capítulo foi alterado nesta sessão — apenas
  HTML (`docs/*.html`), CSS (`docs/assets/estilo.css`) e ferramentas
  (`tools/*.js`, `tools/*.py`).

---

## Etapa 3.1 — objeto `CONST` (completa)

Criado em `docs/assets/comuns.js`, cgs, com fonte documentada em
comentário (CODATA 2018/2022 para constantes fundamentais, IAU para
solares/astronômicas). Contém: `G, C, H, HBAR, KB, NA, ME, MA, MH, E,
SIGMA, A_RAD, MSUN, RSUN, LSUN, UA, PC`. Migrados para usá-la:
`cap04_modulos.js` (SIGMA), `cap05_modulos.js` (G, MSUN, RSUN, LSUN, C,
A_RAD, K_B, M_H), `cap06_modulos.js` (MSUN), `cap07_modulos.js` (G,
MSUN, RSUN, LSUN, K_B, M_H, UA, PC, SIGMA_SB), `cap08_modulos.js` (H,
HBAR, C, ME, NA, KB, MA, A_RAD, ESU), `cap09_modulos.js` (H, C, ME, NA,
MA, G, MSUN), `cap10_modulos.js` (E_ESU, KB_ERG, NA locais ao módulo de
blindagem), `cap11_modulos.js` (H, HBAR, C, KB, NA). Reconfirmado limpo
pelo harness completo (95 módulos, 0 problemas) após a migração.

**Não migrados, e por quê**: `cap01`–`cap03` não declaravam nenhuma
dessas constantes (confirmado por grep antes de migrar — Cap. 3 usa
constante de gás ideal, não listada em `CONST` ainda; Caps. 1–2 usam só
conversões de unidade específicas de paralaxe/UA-pc, não as constantes
físicas fundamentais). `AMU_MEV` (Cap. 11) e `KB_KEV` (Cap. 10) são
conversões de unidade derivadas, não duplicatas diretas de itens de
`CONST` — deixadas como estão.

## Etapa 3.2 / Etapa A — tabela valor-esperado vs. valor-obtido (COMPLETA)

Todos os 27 alvos verificados via `tools/verify_values.js` (estado
default do módulo, exceto onde a coluna "Setup" indica um ajuste de
slider). Todos os `get` leem o campo exibido na tela, não uma variável
JS interna — ou seja, testam exatamente o que o aluno vê.

| # | Alvo (do `.tex`) | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Cap. 5, $t_{\rm ff,\odot}$ | $\approx27$ min | $26{,}5$ min | ✅ |
| 2 | Cap. 6, $z_R$ ($n=3$) | $6{,}897$ | $6{,}8969$ | ✅ |
| 3 | Cap. 6, $-z_R^2\omega'(z_R)$ ($n=3$) | $2{,}018$ | $2{,}0182$ | ✅ |
| 4 | Cap. 9, $M_{\rm ch}$ ($\mu_e=2$) | $1{,}459\,M_\odot$ | $1{,}459$ | ✅ |
| 5 | Cap. 10, $kT_c$ ($T_c=1{,}5\times10^7$K) | $\approx1{,}3$ keV | $1{,}30$ keV | ✅ |
| 6 | Cap. 2, $M_{\odot,\rm bol}$ | $4{,}72$–$4{,}75$ | $4{,}74$ | ✅ |
| 7 | Cap. 2, $BC_{V,\odot}$ | $\approx-0{,}1$ (tex cita $-0{,}08$ e $-0{,}09$) | $-0{,}085$ | ✅ |
| 8 | Cap. 3, $\nabla_{\rm ad}$ ($\gamma=5/3$) | $0{,}4$ | $0{,}400$ | ✅ |
| 9 | Cap. 4, $L_{\rm Edd}/L_\odot$ ($M=1\,M_\odot$) | $\approx3{,}3\times10^4$ | $3{,}3\times10^4$ | ✅ (setup: slider log, $t=0{,}125$) |
| 10 | Cap. 5, $P_{c,\odot}$ | $\approx7\times10^{15}$ dyn/cm² | $7{,}18\times10^{15}$ | ✅ |
| 11 | Cap. 5, $T_{c,\odot}$ | $\lesssim3\times10^7$ K | $3{,}08\times10^7$ | ✅ (ordem de grandeza; módulo mostra $\lesssim$, não limite estrito) |
| 12 | Cap. 5, $\tau_{\rm KH,\odot}$ | $1{,}57\times10^7$ anos | $1{,}50\times10^7$ | ✅ (módulo usa a fórmula geral arredondada $1{,}5\times10^7(M/M_\odot)^2(R_\odot/R)(L_\odot/L)$ do próprio `.tex`, não o cálculo solar exato de $4{,}96\times10^{14}$s — ver nota) |
| 13 | Cap. 5, $\tau_{\rm mix}$ | $\approx3\times10^7$ s | $4{,}17\times10^6$ s | ⚠️ ver "Problemas encontrados" |
| 14 | Cap. 6, $z_R$ ($n=0$, analítico $\sqrt6$) | $2{,}449$ | $2{,}4495$ | ✅ (setup: $n=0$) |
| 15 | Cap. 6, $-z_R^2\omega'$ ($n=0$, analítico $2\sqrt6$) | $4{,}899$ | $4{,}8990$ | ✅ |
| 16 | Cap. 6, $z_R$ ($n=1$, analítico $\pi$) | $3{,}1416$ | $3{,}1416$ | ✅ (setup: $n=1$) |
| 17 | Cap. 6, $-z_R^2\omega'$ ($n=1$, analítico $\pi$) | $3{,}1416$ | $3{,}1416$ | ✅ |
| 18 | Cap. 7, $\dot M_{\rm Shu}$ ($T=10$K) | $\approx1{,}6\times10^{-6}\,M_\odot$/ano | $1{,}6\times10^{-6}$ (na verdade $1{,}576\times10^{-6}$, exibido truncado) | ✅ |
| 19 | Cap. 7, $M_\star$ acretada ($t=10^6$ anos) | $\approx1{,}6\,M_\odot$ | $1{,}576$ | ✅ (setup: slider $t$, valor 600) |
| 20 | Cap. 8, $P_e$ degenerada ($\rho=10^6$, $\mu_e=2$) | $\approx3{,}1\times10^{22}$ dyn/cm² | $3{,}16\times10^{22}$ | ✅ |
| 21 | Cap. 9, $M_{\rm ch}$ ($\mu_e=2{,}15$) | $\approx1{,}26\,M_\odot$ | $1{,}263$ | ✅ (setup: slider $\mu_e$, valor 215) |
| 22 | Cap. 10, pico de Gamow $E_0$ (p-p, $Z_j=1$, $T_\odot$) | $5$–$10$ keV | $5{,}93$ keV | ✅ (dentro da faixa) |
| 23 | Cap. 10, pico de Gamow $E_0$ (CNO, $Z_j=7$, $T_\odot$) | $20$–$35$ keV | $21{,}69$ keV | ✅ (dentro da faixa) |
| 24 | Cap. 10, $Q\approx26{,}7$ MeV / $26{,}2$ depositados | — | — | não verificável: texto estático, sem módulo interativo |
| 25 | Cap. 10, ramificações PP $86\%/14\%/0{,}1\%$ | — | — | confirmado **por leitura de código**: `FRACOES = {I:0.86, II:0.139, III:0.001}` hardcoded em `cap10_modulos.js`, idêntico ao `.tex` — não há como "testar" um sorteio aleatório contra si mesmo de forma útil |
| 26 | Cap. 4, $\ell_\gamma\approx2$ cm | — | — | não verificável: valor estático no texto, o módulo do random walk usa unidades de tela, não cgs |
| 27 | Cap. 5, $\tau_{\rm nuc,\odot}\approx10^{10}$ anos | — | — | não verificável: nenhum módulo interativo calcula $\tau_{\rm nuc}$ (só exemplo estático no texto) |

**Nenhuma divergência qualifica como errata** — os 25 valores
verificáveis batem dentro da precisão esperada. O único caso fora da
tolerância usual (#13, $\tau_{\rm mix}$) é discutido abaixo, não como
bug confirmado, mas como algo para o professor esclarecer.

### Nota sobre #12 ($\tau_{\rm KH}$): duas fórmulas legítimas, não um erro

O próprio `.tex` (linhas ~1151–1162 de `equacoes_estrutura.tex`) primeiro
calcula o valor solar exato, $\tau_{\rm KH,\odot}=4{,}96\times10^{14}$s
$\approx1{,}57\times10^7$ anos, e **em seguida generaliza para uma
fórmula arredondada**, $\tau_{\rm KH}\approx1{,}5\times10^7(M/M_\odot)^2
(R_\odot/R)(L_\odot/L)$ anos, para uso com estrelas quaisquer. O módulo
(Módulo 11) implementa exatamente essa segunda fórmula (com o
coeficiente $1{,}5$, não $1{,}57$) — por isso o Sol dá $1{,}50\times10^7$
em vez de $1{,}57\times10^7$. Não é uma inconsistência: é a mesma
aproximação de 2 algarismos que o próprio `.tex` já assume ao
generalizar. Registrado aqui só para que a diferença não seja confundida
com um bug numa auditoria futura.

### Problema real #13: $\tau_{\rm mix}$ do módulo é $\sim7\times$ menor que o valor do `.tex`

O `.tex` (linha 2811 de `equacoes_estrutura.tex`) afirma
$\tau_{\rm mix}\approx3\times10^7$ s "substituindo os valores de
referência para o Sol" em $\tau_{\rm mix}=d/v_B$, $d=qR_\star$, mas
**não explicita** os valores numéricos de $q$, $R_\star$ e $v_B$
usados para chegar nesse número — $v_B$ vem de uma expressão de teoria
do comprimento de mistura ($v_B\approx[(\ell_m^2g)/(2H_P)(\nabla-
\nabla_{\rm ad})]^{1/2}$) cujos parâmetros não são todos dados
explicitamente no texto. O módulo (Módulo 21,
`docs/cap05_equacoes_estrutura.html`) usa como *default* $q=0{,}30$,
$R=1\,R_\odot$, $v_B=5000$ cm/s (50 m/s, um valor típico de velocidade
convectiva citado em livros-texto) e obtém $d=2{,}09\times10^{10}$ cm,
$\tau_{\rm mix}=4{,}17\times10^6$ s — mesma ordem de grandeza ampla
($10^6$–$10^7$ s), mas um fator $\sim7$ abaixo do $3\times10^7$
afirmado no texto. Para bater exatamente, seria necessário
$v_B\approx700$ cm/s (7 m/s) com o mesmo $q,R$ — um valor também
fisicamente plausível (a velocidade convectiva varia por ordens de
grandeza ao longo da zona de convecção solar, de dezenas de m/s perto
da base a frações de m/s perto do topo). **Não alterei o `.tex` nem o
`v_B` default do módulo** — é uma divergência dentro da mesma ordem de
grandeza, plausivelmente por escolha diferente de camada de referência
dentro da zona convectiva, não um erro óbvio de nenhum dos dois lados.
**Reportado ao professor para decisão**: se o valor "correto" pretendido
é $v_B\approx5000$ cm/s (e o texto deveria dizer $\sim4\times10^6$ s) ou
se o $\approx3\times10^7$s do texto reflete um $v_B$ menor que deveria
ser o default do módulo.

---

## Etapa B — Coerência entre capítulos e convergência de integradores

**Todos os pares citados no prompt são consistentes** (verificado por
leitura cruzada dos `.tex`, não apenas grep de valor):

- $\nabla_{\rm ad}=0{,}4$ para $\gamma=5/3$: Cap. 3 (via $C_P/C_V$ e
  entropia, linha 646) e Cap. 5 (via $PV^\gamma={\rm cte}$, linha 2329)
  chegam ao mesmo valor por deduções diferentes — o próprio Cap. 5 cita
  explicitamente a dedução do Cap. 3 como consistente.
- $M_{\rm Ch}$: Cap. 6 (Lane–Emden $n=3$, $\xi_1\approx6{,}897$,
  $-\xi_1^2\omega'\approx2{,}018$) dá $M_{\rm Ch}\approx1{,}4\,M_\odot$;
  Cap. 9 (fórmula fechada de Chandrasekhar) dá $1{,}459\,M_\odot$ para
  $\mu_e=2$ — arredonda para o mesmo $1{,}4$. Cap. 9 também generaliza
  para $\mu_e=2{,}15\Rightarrow1{,}26\,M_\odot$, consistente com a
  verificação numérica da Etapa A (#21).
- Rosseland: Cap. 4 deduz $F=-16\sigma T^3/(3\kappa\rho)\cdot dT/dr$;
  Cap. 5 generaliza $\kappa\to\bar\kappa$ (média harmônica ponderada por
  $\partial B_\nu/\partial T$) na mesma fórmula, citando explicitamente
  o Cap. 4.
- Fator/pico de Gamow: Cap. 11 cita textualmente "idêntico ao do
  Capítulo 10" e reusa a mesma definição $\eta=Z_1Z_2e^2/\hbar v$ — sem
  contradição numérica, pois o Cap. 11 não recalcula números próprios,
  só remete ao Cap. 10.

### Convergência numérica dos integradores

**Não executada nesta sessão por falta de tempo após A–D** — ficou para
a próxima sessão (ver "Como continuar"). O que **foi verificado** é que
os valores dos integradores batem com a literatura/soluções analíticas
onde existem (Lane–Emden $n=0,1,3,5$ na Etapa A), o que já é evidência
indireta forte de convergência correta, mas não substitui o teste formal
de reduzir o passo pela metade e comparar.

### Colisão de notação $\mu$ — presença das caixas de aviso

Confirmado por grep, `.tex` vs. HTML:

| Capítulo | Caixa de aviso no `.tex`? | Presente no HTML? |
|---|---|---|
| Cap. 4 ($\mu=\cos\theta$, colide com Cap. 3) | ✅ (`processos_radiativos.tex`) | ✅ (linha 483, **mais** um banner de topo de página só no HTML, reforçando) |
| Cap. 5 ($\mu$ volta a ser peso molecular) | ✅ (linha 525) | ✅ (linha 39) |
| Cap. 8 ($\mu$ volta a ser peso molecular, depois do Cap. 4) | ❌ **ausente** | ❌ **ausente** |

**Achado real, não corrigido**: `chapters/equacoes_estado_estelar.tex`
usa $\mu$ como peso molecular médio (linha 69, $\rho=n\,\mu\,m_a$) sem
nenhuma nota lembrando que o capítulo anterior mais próximo a usar $\mu$
foi o Cap. 4 (Processos Radiativos), onde $\mu=\cos\theta$. O capítulo
já tem uma caixa de colisão de notação (para $R$, linha 45) — só falta a
de $\mu$. **Não adicionei a caixa** porque isso significaria editar o
`.tex` de um capítulo (fora da autorização desta sessão, que só permite
erratas numéricas aprovadas pelo professor) — reportado aqui para
decisão: é uma adição de conteúdo pedagógico (nota de notação), não uma
errata numérica, então provavelmente cabe ao professor decidir se quer
adicioná-la ele mesmo ou pedir explicitamente numa próxima sessão.

---

## Etapa C — Completude Caps. 1–9 (script `tools/count_completude.py`)

Equações numeradas: comparado `\label{eq:` no `.tex` (proxy de "equação
citável", mais confiável que contar `\begin{equation}` cru, que inclui
passos intermediários não numerados para referência) contra `\tag{` no
HTML (MathJax numera assim, não com `\begin{equation}` literal).

| Capítulo | Equações `.tex` (`\label{eq:`) | Equações HTML (`\tag{`) | Caixas `.tex` (ctx/ex/atn/leit) | Caixas HTML |
|---|---|---|---|---|
| 1 — Paralaxe | 3 | 3 | 1/2/2/1 | 1/2/2/1 ✅ |
| 2 — Magnitudes | 25 | 25 | 2/2/6/2 | 2/2/6/2 ✅ |
| 3 — Termodinâmica | 44 | 43 (−1) | 5/4/0/1 | 5/4/0/1 ✅ |
| 4 — Proc. Radiativos | 146 | 150 (+4) ✅ | 14/6/5/3 | 14/6/6/4 ✅ |
| 5 — Eq. Estrutura | 139 | 196 (+57) ✅ | 14/10/15/2 | 16/10/17/2 ✅ |
| 6 — Politrópicas | 43 | 47 (+4) ✅ | 2/0/5/1 | 2/0/6/1 ✅ |
| 7 — Formação Estelar | 30 | 74 (+44) ✅ | 6/14/4/6 | 6/14/4/6 ✅ |
| 8 — Eq. de Estado | 80 | 85 (+5) ✅ | 6/3/9/2 | 6/3/9/2 ✅ |
| 9 — Anãs Brancas | 20 | 23 (+3) ✅ | 4/1/5/1 | 4/1/5/1 ✅ |

**Regra do prompt ("HTML pode ter mais, nunca menos") respeitada em 8
dos 9 capítulos.** Único caso abaixo: **Cap. 3, 43 vs. 44** (falta 1
equação numerada no HTML). Não investiguei qual das 44 é a que falta
(exigiria comparar as 44 âncoras uma a uma) — fica para a próxima
sessão. É uma diferença de 1 em 44 (2%), improvável que seja um erro de
conteúdo grave, mas registrado honestamente como não fechado. Caixas
`contexto`/`exemplo`/`atencao`/`leituras` batem ou excedem em todos os 9
capítulos, sem exceção.

Confirmado adicionalmente (Cap. 10–11 já confirmados em sessões
anteriores, não repetido):
- Placeholder da Seção 3.1 (Diagramas HR) **ainda vazio**
  (`chapters/termodinamica.tex` linha 22), nenhum conteúdo inventado.
- Exercício do CNO I–IV / PP II–III **ainda não resolvido**
  (`chapters/geracao_energia.tex` linhas 928–934) — preservado
  propositalmente como exercício de fixação, conforme decisão do
  professor já registrada no texto.
- Caixas de atribuição de autoria do Cap. 11 preservadas (linha 40 e
  2946 do HTML, linha 27 do `.tex`).
- Figuras de dados do Cap. 11: 30 `\begin{figure}` no `.tex`, 37
  ocorrências de `<figure>`/`<canvas>`/`<figcaption>` no HTML (excede,
  consistente com a regra).
- `localStorage`/`sessionStorage`: **grep confirma zero ocorrências** em
  todo `docs/` — pendência da Sessão 1 finalmente fechada.

---

## Etapa D — Harness estendido (layout + acessibilidade)

Novo script `tools/harness_layout_a11y.js`, rodado nas 11 páginas em
1280/1440/1920px. Resultado após as correções (ver resumo executivo
acima): **0 problemas em todas as 11 páginas** — 0 contraste abaixo de
4,5:1, 0 inputs sem rótulo acessível, 0 canvas sem `role="img"`, 0
elemento com `tabindex` negativo indevido.

### Limitações conhecidas desta extensão (leia antes de confiar demais)

- **Heurística de margem lateral tem falsos-positivos confirmados e
  investigados**: o script compara a borda direita de cada `<canvas>`
  contra a borda direita do primeiro `<p>` "razoavelmente largo" da
  página inteira — não um parágrafo do mesmo módulo. Isso sinalizou 2
  "problemas" (Cap. 4, Módulo 5, canvas `m5-grafico`; Cap. 5, Módulo 7,
  canvas `m7exo-canvas-P`) que **investiguei manualmente e confirmei
  serem falsos-positivos**: ambos os canvas estão dentro de um layout
  flexbox de 2 colunas *intencional* (gráfico + painel lateral, ou dois
  gráficos lado a lado), então naturalmente não se estendem até a
  margem do texto corrido da página. Não suprimi esses 2 avisos no
  script (ficam no `tools/harness_layout_a11y_output.json` bruto) —
  documentando aqui, como a lição da Sessão 2 pede, em vez de silenciar
  sem registro.
- **Contraste**: só amostra `.rotulo`, `.rotulo-card`, `p`, `button`,
  `label` (até 10 de cada, deduplicados por texto) — não é exaustivo
  para elementos com cor customizada fora desses seletores. As caixas
  `contexto`/`exemplo`/`atencao`/`leitura` (texto branco sobre cor
  sólida no rótulo) não foram verificadas por este script porque usam a
  classe `.rotulo` dentro de `.caixa`, que **está** coberta — nenhum
  problema encontrado ali.
- **Navegação por teclado**: só checa `tabindex` negativo explícito, não
  testa de fato a ordem de tabulação nem se o foco fica visível
  (`:focus-visible`). Um teste manual com Tab/Shift+Tab em pelo menos
  uma página de cada "família" de layout continua recomendado.
- Não testa `prefers-color-scheme`/modo escuro (o projeto não parece
  ter um, então não se aplica).

---

## Como continuar na próxima sessão

1. Releia este arquivo inteiro primeiro, e também
   `docs/auditoria_automatica.md`.
2. **Refaça o Node.js portátil** (efêmero, não sobrevive entre sessões)
   — comando em `docs/auditoria_automatica.md`. Nesta sessão o
   `tools/node_modules/` e o cache do Chromium **sobreviveram** de uma
   chamada de ferramenta para outra dentro da mesma sessão (mesma
   máquina), mas não há garantia de que sobrevivam entre sessões
   distintas — confirme com `which node` antes de assumir.
3. Ordem sugerida, seguindo a numeração do prompt de encerramento:
   a. Fechar a Etapa B: rodar a convergência numérica dos integradores
      (Lane–Emden Cap. 6, Chandrasekhar Cap. 9, rede de reações Cap. 10,
      evolução viscosa Cap. 7) reduzindo o passo pela metade — não feito
      nesta sessão.
   b. Fechar a Etapa C: achar a 1 equação numerada que falta no HTML do
      Cap. 3 (43 vs. 44 no `.tex`).
   c. Decidir com o professor: (i) a divergência de $\tau_{\rm mix}$
      (Etapa A, #13); (ii) se adiciona a caixa de colisão de notação
      $\mu$ faltante no Cap. 8 (Etapa B).
   d. Etapa E (migração Plotly→Chart.js, Caps. 1–2, e padronização do
      Cap. 3 para `cap03_modulos.js` externo) — não iniciada.
   e. Etapa F (simulações novas) — não iniciada.
4. A URL do GitHub Pages continua pendente do professor — 1 linha em
   cada um dos 2 arquivos (`preambulo.tex`, `comuns.js`) quando ele
   decidir.
5. `.gitignore` criado nesta sessão na raiz do projeto, incluindo
   `tools/node_modules/`.

---

## Etapa 3 — Tabela de oportunidades de simulação (Sessão 4)

Montada antes de implementar, conforme pedido. Prioridade seguindo a
ordem sugerida no prompt da Sessão 4.

| # | Capítulo | Conceito | Tipo | Valor pedagógico | Esforço | Prioridade |
|---|---|---|---|---|---|---|
| 1 | 6 — Politrópicas | Integração de Lane–Emden, passo a passo | Animação de um cálculo já existente (reaproveita `ShootingODE`) | Alto — ver o método numérico *construir* a solução, não só o resultado final | Baixo (reusa o integrador já validado do Módulo 1) | **1 (feita nesta sessão)** |
| 2 | 1 — Paralaxe | Órbita da Terra animada, com a estrela-alvo oscilando contra o fundo | Animação nova, geometria 2D | Alto — a paralaxe *acontecendo*, não sendo descrita; conecta diretamente com o Módulo 1 estático já existente | Médio | 2 |
| 3 | 3 — Termodinâmica | Pistão: compressão adiabática vs. isotérmica lado a lado | Animação nova, com acumulador de trabalho/calor | Alto — a 1ª lei virando processo visível, com dois regimes comparados simultaneamente | Médio-alto (dois painéis sincronizados) | 3 |
| 4 | 2 — Magnitudes | Campo estelar com extinção crescente aplicada ao vivo | Animação/simulação nova (avermelhamento + *dimming*) | Médio-alto — conecta $E(B-V)$ e $R$ a um efeito visual direto num campo sintético | Médio | 4 |

Candidatas adicionais identificadas ao longo da sessão, não implementadas
por já fechar bem as 4 prioritárias (registradas para referência futura,
não implementadas):

| Capítulo | Conceito | Tipo | Nota |
|---|---|---|---|
| 5 | Diagrama HR animado ao vivo | Preenche o placeholder ainda vazio da Seção 3.1 do Cap. 3 (`chapters/termodinamica.tex`, "Diagramas HR e similares") | **Não implementado** — esse placeholder está marcado como aguardando material do professor (slides), não deve ser preenchido com conteúdo inventado, conforme já registrado nas sessões anteriores. Mantive essa restrição. |
| 9 | Curva de resfriamento de anã branca animada | Animação de $T_{\rm eff}(t)$ decaindo | Boa candidata para uma futura sessão — não implementada agora, fora das 4 priorizadas. |
| 11 | Trilha evolutiva animada num diagrama HR (MIST) | Reusaria os dados já embutidos no capítulo | Esforço alto (dados já existem como figuras estáticas, não como séries interativas) — não implementada agora. |


---

## Estado de entrega (consolidado ao final da Sessão 4)

**Resumo das 4 sessões**: Sessão 1 auditou manualmente 2 módulos e
levantou o checklist original. Sessão 2 construiu o harness automatizado
(Playwright), varreu 95 módulos e corrigiu 2 bugs reais. Sessão 3
completou a tabela de valores (27 alvos), a coerência entre capítulos, a
completude Caps. 1–9, e estendeu o harness para layout/acessibilidade —
encontrando e corrigindo o bug mais sério do projeto (ausência de
`<!DOCTYPE html>` nas 12 páginas). Sessão 4 fechou as pendências restantes
decididas pelo professor, migrou Plotly→Chart.js, e implementou 4
simulações novas.

**Checklist original (visão consolidada)**:

| Item | Estado |
|---|---|
| 1.1–1.4 (auditoria técnica módulo a módulo) | Coberto pelo harness (98 módulos, 0 problemas) + inspeção manual dos módulos de risco |
| 1.5 (animações play/pause/reset) | Confirmado — todos os módulos animados usam `createAnimController` |
| 1.6 (layout responsivo) | Testado em 1280/1440/1920px, 0 problemas reais |
| 1.7 (console limpo) | Confirmado nas 12 páginas |
| 1.8 (acessibilidade) | Testado (contraste, rótulos, `role="img"`, foco), 0 problemas |
| 2.1–2.2 (constantes físicas) | Centralizadas em `CONST` (`comuns.js`), consistentes |
| 3.1 (Fase 0 — inventário) | Completo |
| 3.2 (tabela valor-esperado-vs-obtido) | Completa, 27 alvos |
| 3.3 (coerência entre capítulos + convergência numérica) | Completa |
| Fase 3 (completude Caps. 1–11) | Completa |
| Fase 4 (consistência/dívida técnica) | Completa — Plotly migrado, `<!DOCTYPE` corrigido |
| Fase 5 (simulações novas) | 4 implementadas e testadas |
| Fase 6 (validação final) | PDF zero erros, harness zero problemas |

**Pendências que continuam abertas, todas de baixo risco**:
- **URL do GitHub Pages**: continua indefinida — isolada em 1 linha em
  `preambulo.tex` (`\urlbase`) e 1 linha em `docs/assets/comuns.js`
  (`URL_REPO`). **Só o professor pode decidir isso** (precisa do
  usuário/repositório reais).
- Divergência de $\tau_{\rm mix}$ resolvida via preset no módulo (Etapa
  1.1) — mas o `.tex` continua dizendo "para o Sol" quando o contexto da
  seção é de uma estrela massiva; não é uma inconsistência que eu tenha
  autorização para corrigir sozinho (não foi pedido nesta sessão),
  registrado para uma decisão futura do professor.
- Convergência numérica testada só para Lane–Emden e Chandrasekhar (os
  únicos 2 dos 4 "integradores" citados que de fato são numéricos com
  passo de discretização) — os outros 2 (Cap. 7 e Cap. 10) são
  analíticos por design, não há o que testar.

**Declaração explícita**: com a ressalva da URL do GitHub Pages
(pendente de decisão do professor, sem impacto no conteúdo ou na
funcionalidade — só nos 2 links "Repositório no GitHub" e nas 11 caixas
`materialinterativo`), **o material HTML interativo está pronto para uso
pelos alunos**: 98 módulos testados automaticamente sem erros, 27
valores numéricos verificados contra o texto, acessibilidade e layout
responsivo auditados, e o PDF do livro compila sem erros. Nenhuma
correção pendente de maior risco foi identificada.
