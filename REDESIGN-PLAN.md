# REDESIGN-PLAN: Saber-SE (branch `redesign-taste`)

Auditoria feita com a skill `design-taste-frontend`, rodando `hugo server` e vendo as páginas em modo escuro, largura desktop (~1250px). **Nada foi alterado no código.** Aguardando aprovação.

> Limites desta auditoria: não vi ainda o modo claro nem a largura de celular (~380px) página a página, e não abri as páginas individuais de projeto. Essas verificações estão previstas em cada etapa da aplicação (e os itens marcados "a confirmar" abaixo dependem delas). A rota `/authors/diogo-souto/` mostra só um título e uma lista de "Recentes" (página de taxonomia do Hugo); a página de membro real precisa ser conferida pelo link a partir de `/people`.

## 0. Design Read

**Reading this as:** redesign (preserve) de site acadêmico/institucional de grupo de pesquisa em astrofísica, para estudantes candidatos, colaboradores e pares da comunidade científica, com linguagem editorial-científica sóbria sobre tema "céu noturno", apoiado em CSS nativo (SCSS sobre HugoBlox), sem adotar design system externo.

**Dials (redesign-preserve = match existente, +1 em motion):**

| Dial | Valor | Razão |
|---|---|---|
| DESIGN_VARIANCE | 5 | O site é todo centralizado e simétrico (~3). Subir para 5 permite hero e seções alinhados à esquerda e um grid assimétrico, sem comprometer a leitura de conteúdo acadêmico. |
| MOTION_INTENSITY | 4 | Hoje quase estático (só o carrossel). Entradas suaves e hover em cards/botões, tudo atrás de `prefers-reduced-motion`. Nada de scroll-hijack. |
| VISUAL_DENSITY | 4 | Listas de publicações e membros são densas por natureza; o ganho está em ritmo vertical e hierarquia, não em mais ar. |

Sistema de design: nenhum pacote externo (Seção 2.B da skill: estética própria). HugoBlox/Bootstrap continuam como base; as mudanças ficam em `assets/scss/custom.scss` e `layouts/`.

## 1. Tokens de marca a preservar (Seção 11.B)

Paleta `#0a0f1e / #1a2a4a / #4a9eca / #f5c842 / #e8edf5`, logo, divisor ciano→dourado, modo claro/escuro, IA/slugs, rótulos do menu, `baseURL` com `/SABER-SE-UFS/`, `content/people/index.md`, destaque azul dos membros nas publicações, material em `static/cursos/`, PDFs em `static/files/`. Nenhum ponto da skill exige mudar isso; a skill aponta "Max 1 accent color" e a paleta tem dois (ciano + dourado), então o plano **trava papéis**: ciano = ação/links; dourado = só hover, divisor e estado ativo (Color Consistency Lock).

### Onde a skill conflita com suas restrições (decisão sua)

| Item da skill | Situação no site | Proposta |
|---|---|---|
| Inter desencorajado como padrão (4.1) | Corpo em Inter | **Manter** (você fixou; e a skill libera Inter para sites institucionais/acessibilidade). Sem mudança. |
| Serifa muito desencorajada (4.1), Playfair está na lista de "se justificada" | Títulos em Playfair | **Manter**. Justificativa: site acadêmico/editorial com tradição de publicação, e é parte da identidade. Ajuste só de escala/tracking (ver 2.1). |
| Emoji desencorajado (3.D) | Aparecem em Oportunidades (ícones de vaga) e no título do script `.py` | Trocar emojis visíveis por ícones Font Awesome já usados pelo tema. **Pergunta abaixo.** |
| Em-dash banido (9.G) | ~66 arquivos de conteúdo e várias strings de UI usam "—" e "·" | Corrigir **só strings de UI/layout/config** (ex.: "SABERSE-UFS — Grupo de Astrofísica da UFS" na navbar, rodapé). **Conteúdo editorial (posts, resumos) não é reescrito** (11.C: preservar a voz do texto). **Pergunta abaixo.** |
| Hero: máx. 4 elementos de texto; subtexto ≤ 20 palavras | Hero tem título, tagline, parágrafo de ~30 palavras, 2 CTAs e crédito da imagem | Reduzir (ver 3.1). Crédito da imagem mantido, mas movido para o rodapé da seção (não é copy do hero). |

## 2. Problemas globais

### 2.1 Tipografia e escala
- **Bom:** par serifa/sans coerente, Playfair funciona bem nos títulos de seção, `kern/liga` ativos.
- **Problemas:** `h1: 2.8rem` fixo para todas as páginas internas (nunca fluido; no celular é grande demais); `letter-spacing: .02em` em títulos Playfair abre demais (a skill pede tracking apertado em display); `line-height: 1.75` em **todo** `p, li, td, th` inclui itens de lista de publicações, o que faz as listas parecerem soltas; navbar com `letter-spacing: .04em` e `!important`.
- **Proposta:** escala fluida com `clamp()` (h1 `clamp(2rem, 4vw+1rem, 3rem)`), tracking `-0.01em` nos títulos, `line-height` 1.7 só em prosa (`.article-style p`) e 1.5 em listas/metadados, `max-width: 65ch` em parágrafos de texto corrido (hoje as descrições em `/research`, `/post`, `/opportunities` correm em linhas longas).

### 2.2 Espaçamento e ritmo
- Seções da home com padding uniforme, sem variação; páginas internas (`/courses`, `/contact`) ficam com muito vazio abaixo do conteúdo e rodapé flutuando no meio da tela.
- **Proposta:** escala de espaçamento em tokens (`--space-1..8`), padding de seção `clamp(3rem, 8vw, 6rem)`, rodapé empurrado ao fim (`min-height: 100dvh` + flex no `body`). Evitar `100vh`: a verificação com `grep` mostrou `100vh` no SCSS do hero/slider; trocar por `100dvh` (3.E da skill).

### 2.3 Cores, contraste, cards
- **Bom:** fundo `#0a0f1e` e texto `#e8edf5` têm contraste excelente.
- **Problemas:** o cinza `#a0aec0` do menu e metadados pequenos fica no limite do AA em tamanhos menores (a confirmar com medição); nomes de autores não-membros em cinza apagado nas publicações (legíveis, mas fracos); quase **tudo é card** (trabalhos, eventos, posts, oportunidades, cursos), todos com o mesmo fundo/borda: sem hierarquia (4.4 da skill: card só quando eleva hierarquia).
- **Proposta:** 3 níveis de superfície definidos como tokens (base, elevada, destaque). Listas longas (trabalhos, posts, publicações) passam a linhas separadas por filete (`divide-y` suave) em vez de caixas; cards ficam para itens com imagem (posts, eventos, linhas de pesquisa).

### 2.4 Forma e interação
- `border-radius` espalhado em 2px, 4px, 6px, 8px, 10px, 100px e 50% sem regra (Shape Consistency Lock). **Proposta:** raio único de 8px para cards/inputs, pílula só para botões e tags, círculo só para avatares.
- 66 `!important` em `custom.scss` (principalmente navbar). Vamos reduzir onde der, usando especificidade correta em vez de `!important`.
- Sem estados `:active` nem `:focus-visible` consistentes. **Proposta:** `:focus-visible` ciano visível, `:active` com `translateY(1px)`.

### 2.5 Movimento e acessibilidade
- Apenas 1 menção a `prefers-reduced-motion`; as "estrelas animadas" do hero e o carrossel precisam respeitá-lo. **Proposta:** bloco único `@media (prefers-reduced-motion: reduce)` que desliga animações e autoplay do carrossel.
- Nenhum `window.addEventListener('scroll')` novo: o JS atual da navbar (transparente/sólida) será conferido e, se usar scroll listener, trocado por `IntersectionObserver`.

### 2.6 Responsividade
- Só 6 `@media` em 1828 linhas, e boa parte do layout da home usa **estilos inline** (métricas com `display:flex; gap:3rem`), que não colapsam bem. **Proposta:** mover para classes (grid `repeat(auto-fit, minmax(9rem, 1fr))`), breakpoints padronizados (640/768/1024).

## 3. Auditoria por página

### 3.1 Homepage
- **Manter:** foto "Pilares da Criação", paleta, título Playfair, carrossel com as 6 linhas + abertura, divisor ciano→dourado, CTA final.
- **Problemas:**
  1. Hero: tudo centralizado e sem hierarquia; tagline em negrito minúsculo (`Stellar Abundances · Exoplanets · Red Giants & Stellar Evolution`), parágrafo de ~30 palavras, crédito da imagem colado nos botões. Excede o limite de 4 elementos de texto.
  2. Navbar sobre o hero tem título longo "SABERSE-UFS — Grupo de Astrofísica da UFS" em corpo pequeno e 9 itens + 2 ícones comprimidos em ~850px (cabe em uma linha, mas apertado).
  3. Carrossel: o slide ocupa só o miolo (caixa azul ~40% da largura) com a imagem solta dos lados, parece um bug de enquadramento (a confirmar no celular); setas cinza grandes e pouco contrastantes; texto e botão em tamanho pequeno; 7 slides com a mesma composição.
  4. Métricas: números soltos em linha, sem rótulo forte, "500+ citações" e "30+ publicações" são números fixos no markdown (conferir se ainda refletem a realidade; a skill pede dados reais).
  5. "Publicações Recentes" em lista de citações cinza muito pequena; "Linhas de Pesquisa" mostra só 1 card de 2 colunas visíveis na primeira dobra, com imagem azul saturada (gráfico de espectro) dominando.
  6. Sequência de seções todas no mesmo padrão "título centralizado + bloco" (Seção-Layout-Repetition).
- **Sugestões:**
  - Hero alinhado à esquerda (variance 5): título "Saber-SE", subtítulo ≤ 20 palavras ("Astrofísica estelar e exoplanetária na UFS: abundâncias químicas, planetas e evolução da Galáxia."), CTAs "Pesquisa" e "Publicações" como estão; tagline em inglês vira linha de palavras-chave discreta ou sai do hero; crédito da imagem vai ao canto inferior, fora da pilha de texto. Altura `min-height: 100dvh` com padding superior ≤ 6rem.
  - Carrossel: slide em largura total com overlay em gradiente da paleta, texto alinhado à esquerda, setas em ciano com contraste, indicadores maiores. Manter os 7 slides e os destinos dos botões.
  - Métricas: grid de 4 colunas (2x2 no celular) com número em Playfair e rótulo curto; fonte dos dados anotada em comentário.
  - Publicações: itens com título em destaque, autores abaixo em corpo ≥ 0,9rem; manter destaque azul de membros (script não é tocado).
  - Linhas de pesquisa: grid assimétrico (1 card grande + 3 menores) em vez de 2 colunas iguais.

### 3.2 /research e /project/*
- **Manter:** estrutura alternada imagem/texto, tags de membros, botão "Ver linha de pesquisa", número decorativo.
- **Problemas:** o número decorativo (`01`) sobrepõe o título da linha ("Conexão Estrela-Planeta"), prejudicando a leitura; o zigzag se repete em 6 linhas seguidas (limite da skill: 2); texto corrido longo e pequeno; imagens com proporções e saturação muito diferentes. Páginas `/project/*`: a confirmar (não abri).
- **Sugestões:** número decorativo atrás do bloco com opacidade baixa e `z-index` abaixo do título; quebrar o zigzag (linhas 1-2 em zigzag, linhas 3-4 em grid de 2 colunas com imagem acima, linhas 5-6 em largura total); `max-width: 65ch` e corpo 1rem; `aspect-ratio` único nas imagens com `object-fit: cover`.

### 3.3 /people e páginas de membros
- **Manter:** categorias (Coordenador, Pós-Doutorandos, ...), avatar circular com borda ciano, divisor com título, "Trabalhos Acadêmicos" nos perfis, auto-link de nomes.
- **Problemas:** coluna central estreita (~530px) numa tela de 1250px, os cards de membro empilham muito texto centralizado e minúsculo (interesses em itálico, ícones sociais) com pouca hierarquia; o Coordenador aparece sozinho com parágrafo longo de interesses; para Graduandos/Mestrandos (muitos membros) a página fica muito longa. A página de autor via `/authors/<slug>/` mostra uma lista simples de "Recentes" sem foto, cargo ou bio (a confirmar se é a que o `/people` linka; layout em `layouts/authors/list.html`).
- **Sugestões:** grid responsivo `auto-fill, minmax(14rem, 1fr)` na largura do container (4 por linha em desktop, 2 no celular), nome em destaque, cargo em ciano, interesses limitados a 2-3 tags; Coordenador em bloco horizontal (foto + texto); `content/people/index.md` **não** é tocado, só CSS. Página de perfil: cabeçalho com foto, cargo, links e bio, depois publicações e "Trabalhos Acadêmicos".

### 3.4 /publication
- **Manter:** busca, filtros (tipo, data), links Citação/DOI, destaque dos membros, links de perfil.
- **Problemas:** descrição introdutória cita "Para importar automaticamente a partir de BibTeX ou arXiv, utilize o comando `academic import`" (texto de manutenção que o visitante vê; a confirmar na fonte `content/publication/_index.md`); lista longa com filete entre itens e botões minúsculos; listas de autores enormes (ex.: SDSS) dominam o item.
- **Sugestões:** remover instrução de manutenção da vista pública (mover para `README`); título da publicação em destaque e autores em corpo menor com truncamento (`line-clamp: 2` + "mostrar todos" só com CSS/`details`); botões Citação/DOI como pílulas ghost com contraste AA; ano em coluna à esquerda no desktop.

### 3.5 /thesis (Trabalhos)
- **Manter:** conteúdo, selo de data, botão de e-mail, link do autor.
- **Problemas:** cada item é um card idêntico com resumo cinza-escuro de baixíssimo contraste e corpo minúsculo; todos iguais, sem agrupar por tipo (TCC/dissertação/tese) ou ano; muita rolagem.
- **Sugestões:** lista com filete (sem caixas), título em Playfair 1.15rem, autor e tipo em ciano, resumo com `line-clamp: 3` e contraste ≥ 4.5:1; agrupar por ano com cabeçalho leve. Uso de `<details>` para o resumo completo.

### 3.6 /courses
- **Manter:** link para o livro "Estrutura e Evolução Estelar", material em `static/cursos/` (intocado).
- **Problemas:** página quase vazia: um único card, URL em texto cru (link longo em fonte minúscula) e rodapé no meio da tela.
- **Sugestões:** card de curso maior, com título, descrição curta e botão "Abrir material" (um único CTA); link longo escondido atrás do botão; layout preparado para mais cursos futuros (grid); rodapé ao fim da página.

### 3.7 /event
- **Manter:** cards com imagem do evento, ano como marcador lateral, datas.
- **Problemas:** os dois eventos exibem imagem 16:9 enorme (logos de congresso, sem relação visual com o site); texto de resumo ilegível (cinza em azul escuro); descrição da página usa "—" e um "·" decorativo.
- **Sugestões:** imagem em proporção menor ao lado do texto (2 colunas, texto prioritário), data e local em uma linha destacada, resumo com contraste correto; marcador de ano discreto.

### 3.8 /post (Divulgação)
- **Manter:** card com imagem em destaque, categoria, tempo de leitura, botão ler.
- **Problemas:** todos os cards iguais e com imagem de ~800px de altura de coluna (muita rolagem); lead da página longa e em corpo pequeno; metadados minúsculos.
- **Sugestões:** primeiro post em destaque (grande) e demais em grid de 2 colunas com imagem 16:9 menor; metadados com contraste; título em Playfair 1.25rem.

### 3.9 /opportunities
- **Manter:** conteúdo, estrutura (Por que fazer parte, Vagas Abertas), Regimento Interno (PDF em `static/files/`).
- **Problemas:** coluna estreita de texto centralizada em um bloco denso; cards de vaga com **emojis** e parágrafos em negrito misturados; hierarquia fraca entre requisitos e bolsa; sem CTA claro de candidatura repetido em cada vaga (a skill veta CTAs duplicados com mesma intenção, então um único rótulo).
- **Sugestões:** vagas como lista de cards com cabeçalho (programa), requisitos e bolsa em duas colunas, ícones Font Awesome no lugar de emoji, um único botão "Entre em contato" por vaga com o mesmo rótulo usado no menu ("Contato"); texto introdutório limitado a 65ch.

### 3.10 /contact
- **Manter:** e-mail, endereço, horário, links de perfil, mapa OpenStreetMap.
- **Problemas:** coluna estreita com ícones e linhas de texto minúsculas; mapa ocupa toda a largura sem relação com o texto; não há formulário (e não deve haver, para não introduzir dependências).
- **Sugestões:** 2 colunas no desktop (contatos à esquerda, mapa à direita; empilha no celular), ícones alinhados, links como botões ghost com contraste AA.

### 3.11 Navbar e rodapé
- **Manter:** navbar transparente sobre o hero e sólida depois, alternador claro/escuro, busca, logo/marca SABER-SE em ciano.
- **Problemas:** título longo da marca ("SABERSE-UFS — Grupo de Astrofísica da UFS") com em-dash; 9 itens ficam apertados entre 1024px e 1200px (risco de quebrar em 2 linhas, a confirmar); `!important` em excesso; rodapé com textos minúsculos (copyright, licença) em cinza de baixo contraste.
- **Sugestões:** marca = logo + "Saber-SE" (sem sufixo longo; o nome completo vai ao rodapé), altura ≤ 72px, itens com `font-size: .9rem` e `gap` consistente, hambúrguer a partir de 1100px; rodapé em 3 blocos (marca/descrição, links, contato/licença).

## 4. Itens comuns que **não** serão alterados
Menu e rótulos, URLs/slugs, estrutura de `content/`, `custom_js.html` (destaque de membros), `static/cursos/`, `static/files/`, logo, textos científicos e de posts, nomes de membros.

## 5. Plano de execução (commit por etapa, como você pediu)

1. **Fundamentos globais**: tokens (cores por papel, espaçamento, raio, superfícies), escala tipográfica fluida, `100vh→100dvh`, `:focus-visible`, `prefers-reduced-motion`.
2. **Navbar e rodapé**: marca, altura, breakpoints, rodapé em 3 blocos.
3. **Homepage**: hero, carrossel, métricas (classes em vez de inline), seções.
4. **Listagens**: publicações, trabalhos, eventos, divulgação.
5. **Membros**: `/people` e perfis.
6. **Pesquisa e projetos**.
7. **Oportunidades, cursos e contato**.

Após cada etapa: `hugo server` sem erros, conferência em modo claro e escuro e em ~380px, e commit `Redesign: [área]`. Verificação final conforme seu Passo 3, sem merge nem push.

## 6. Perguntas para aprovar

1. **Em-dash e "·"**: posso trocar nas strings de UI/config (marca da navbar, rodapé, descrições de página), deixando o conteúdo editorial intacto? (recomendado: sim)
2. **Emojis** em Oportunidades: trocar por ícones Font Awesome? (recomendado: sim)
3. **Métricas da home** (30+ publicações, 500+ citações, 15+ alunos): manter como estão ou você quer atualizar os números?
4. **Texto de manutenção** ("academic import") em `/publication`: posso removê-lo da vista pública?
5. Hero alinhado à esquerda em vez de centralizado: aprovado, ou prefere manter centralizado por ser a cara do site hoje?
