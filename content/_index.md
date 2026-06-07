---
# Deixe o título vazio para usar o título do site
title:
date: 2022-10-24
type: landing

sections:
  # ============================================================
  # HERO — Banner principal
  # ============================================================
  - block: hero
    content:
      title: |
        SABERS-DFI
        Grupo de Astrofísica
      image:
        filename: welcome.jpg
      text: |
        <br>

        Investigamos a natureza das **estrelas**, seus planetas e a **evolução química da Galáxia** por meio de espectroscopia de alta resolução e modelagem atmosférica. Somos parte do **Departamento de Física** da **Universidade Federal de Sergipe**.

        <a class="btn btn-primary btn-lg" href="./tour/">
          🔭 Conheça nossa pesquisa
        </a>
        &nbsp;
        <a class="btn btn-outline-light btn-lg" href="./people/">
          👥 Conheça a equipe
        </a>

  # ============================================================
  # MÉTRICAS — Contadores (usando markdown com HTML)
  # ============================================================
  - block: markdown
    content:
      title:
      subtitle:
      text: |
        <div style="display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;padding:2rem 0;text-align:center;">
          <div><div style="font-size:2.5rem;font-weight:700;">30+</div><div style="opacity:.7;">Publicações<br>científicas</div></div>
          <div><div style="font-size:2.5rem;font-weight:700;">500+</div><div style="opacity:.7;">Citações<br>(Google Scholar)</div></div>
          <div><div style="font-size:2.5rem;font-weight:700;">6</div><div style="opacity:.7;">Membros<br>ativos</div></div>
          <div><div style="font-size:2.5rem;font-weight:700;">2019</div><div style="opacity:.7;">Ano de<br>fundação</div></div>
        </div>
    design:
      columns: '1'

  # ============================================================
  # ÚLTIMAS PUBLICAÇÕES
  # ============================================================
  - block: collection
    content:
      title: Publicações Recentes
      subtitle: ''
      text: ''
      count: 3
      filters:
        folders:
          - publication
        publication_type: ''
      offset: 0
      order: desc
    design:
      view: citation
      columns: '1'

  # ============================================================
  # LINHAS DE PESQUISA
  # ============================================================
  - block: collection
    content:
      title: Linhas de Pesquisa
      subtitle: 'Nossas áreas de investigação ativas'
      text: ''
      count: 4
      filters:
        folders:
          - project
      offset: 0
      order: desc
    design:
      view: card
      columns: '2'

  # ============================================================
  # MEMBROS DO GRUPO
  # ============================================================
  - block: people
    content:
      title: Nossa Equipe
      user_groups:
        - Investigador Principal
        - Doutorandos
        - Mestrandos
        - Iniciação Científica
      sort_by: Params.last_name
      sort_ascending: true
    design:
      show_interests: true
      show_role: true
      show_social: true

  # ============================================================
  # NOTÍCIAS
  # ============================================================
  - block: collection
    content:
      title: Notícias Recentes
      subtitle: ''
      text: ''
      count: 3
      filters:
        author: ''
        category: ''
        exclude_featured: false
        publication_type: ''
        tag: ''
      offset: 0
      order: desc
      page_type: post
    design:
      view: card
      columns: '1'

  # ============================================================
  # CALL TO ACTION
  # ============================================================
  - block: markdown
    content:
      title:
      subtitle:
      text: |
        {{% cta cta_link="./opportunities/" cta_text="Quer fazer parte do grupo? Veja as oportunidades →" %}}
    design:
      columns: '1'
---
