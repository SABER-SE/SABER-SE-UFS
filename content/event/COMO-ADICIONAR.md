---
draft: true
---

# Como adicionar um novo evento

## 1. Crie a pasta do evento

```bash
mkdir content/event/NOME-DO-EVENTO-ANO/
```

Exemplo de slugs: `aas-248-2026`, `sab-2026`, `iau-simp-350-2026`

## 2. Crie o arquivo index.md

Copie o template abaixo para `content/event/NOME/index.md`:

```yaml
---
title: "Título completo do evento"

event: Nome oficial do evento
event_url: https://link-do-evento.org

location: Cidade, Estado, País

summary: >
  Uma ou duas frases resumindo a participação do grupo.

abstract: >
  Parágrafo mais longo descrevendo o evento e a participação (aparece na
  página individual do evento).

# Data e hora de início (UTC — ajuste -3h para horário de Brasília)
date: 'AAAA-MM-DDTHH:MM:00Z'
date_end: 'AAAA-MM-DDTHH:MM:00Z'
all_day: true    # true = evento de dia inteiro (sem mostrar horário)

publishDate: 'AAAA-MM-DDT00:00:00Z'

authors:
  - admin        # perfil do coordenador (sempre inclua)

tags:
  - Conferência  # ou: Escola, Workshop, Seminário, Colóquio

featured: false  # true = aparece em destaque na homepage

image:
  caption: ''
  focal_point: Center

url_code: ''
url_pdf: ''
url_slides: 'link-para-slides.pdf'  # opcional
url_video: ''

slides: ''
projects: []
---

<!-- Badge de tipo (escolha um): -->
<span class="event-badge event-badge--conference">Conferência</span>
<span class="event-badge event-badge--school">Escola</span>
<span class="event-badge event-badge--workshop">Workshop</span>
<span class="event-badge event-badge--seminar">Seminário</span>

## Sobre o evento

Descrição do evento em português.

## Participação do Saber-SE

Listar palestras, pôsteres, contribuições específicas dos membros.
```

## 3. Adicione imagem de capa (opcional)

Copie um arquivo `featured.jpg` para a pasta do evento.
Resolução recomendada: 800×400 px.

## 4. Tipos de eventos e badges CSS

| Tag           | Badge CSS                        | Cor     |
|---------------|----------------------------------|---------|
| Conferência   | `event-badge--conference`        | Ciano   |
| Escola        | `event-badge--school`            | Verde   |
| Workshop      | `event-badge--workshop`          | Laranja |
| Seminário     | `event-badge--seminar`           | Roxo    |

## 5. Eventos futuros vs passados

O Hugo/HugoBlox ordena automaticamente os eventos por data. Eventos futuros
aparecem no topo (agrupados pelo ano corrente), eventos passados abaixo.
Use `featured: true` apenas para o próximo evento mais importante.
