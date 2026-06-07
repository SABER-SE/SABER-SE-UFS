---
# Deixe o título vazio para usar o título do site
title:
date: 2022-10-24
type: landing

sections:
  # ============================================================
  # HERO — Banner principal com campo estelar
  # ============================================================
  - block: hero
    content:
      title: |
        Saber-SE
      text: |
        **Stellar Abundances · Exoplanets · Red Giants & Stellar Evolution**

        Grupo de Astrofísica Estelar da Universidade Federal de Sergipe, Brasil.
        Investigamos estrelas, seus planetas e a evolução química da Galáxia
        por meio de espectroscopia de alta resolução no infravermelho.

        <p class="hero-cta-group">
          <a class="btn btn-saberse-primary btn-lg" href="./research/">
            Pesquisa
          </a>
          <a class="btn btn-saberse-outline btn-lg" href="./publication/">
            Publicações
          </a>
        </p>

        <p class="hero-image-credit">
          Imagem: Pilares da Criação · NASA/ESA/Hubble Heritage Team (STScI/AURA) · Domínio Público
        </p>
      cta:
        url: ''
        label: ''
    design:
      background:
        image:
          filename: hero-starfield.jpg
          filters:
            brightness: 0.38
          parallax: false
          position: center
          size: cover
        text_color_light: true

  # ============================================================
  # SLIDER — Linhas de pesquisa em destaque
  # ============================================================
  - block: slider
    content:
      slides:
      - title: "Bem-vindos ao Saber-SE"
        content: "Somos um grupo de astrofísica da Universidade Federal de Sergipe dedicado ao estudo de estrelas, exoplanetas e à evolução química da Galáxia. Utilizamos espectroscopia de alta resolução no infravermelho em colaboração com projetos internacionais como SDSS-V/APOGEE e PLATO."
        align: center
        background:
          image:
            filename: hero-starfield.jpg
            filters:
              brightness: 0.45
          position: center
          color: '#0a0f1e'
        link:
          icon: users
          icon_pack: fas
          text: Conheça o grupo
          url: ../people/

      - title: "Conexão Estrela-Planeta"
        content: "A interligação química entre estrelas e planetas revela segredos sobre formação planetária e evolução estelar. Ao decifrar assinaturas químicas como a relação carbono/oxigênio, mapeamos a origem dos planetas e os ambientes que moldaram sua composição."
        align: left
        background:
          image:
            filename: research/anas-m-exoplanetas.jpg
            filters:
              brightness: 0.5
          position: center
          color: '#1a2a4a'
        link:
          icon: telescope
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../research/

      - title: "Atmosferas Exoplanetárias"
        content: "Analisar espectros de luz transmitidos através das atmosferas exoplanetárias desvenda segredos sobre composição e condições climáticas de mundos distantes. A presença de moléculas como água e metano fornece pistas cruciais sobre habitabilidade."
        align: left
        background:
          image:
            filename: research/atmosferas-exoplanetarias.jpg
            filters:
              brightness: 0.5
          position: center
          color: '#1a2a4a'
        link:
          icon: globe
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../research/

      - title: "Campos Magnéticos Estelares"
        content: "Os campos magnéticos estelares moldam a atmosfera das estrelas e influenciam todo o ambiente circundante. Compreender esses campos amplia nossa visão sobre seu impacto em sistemas planetários e na habitabilidade de exoplanetas."
        align: left
        background:
          image:
            filename: research/campos-magneticos.jpg
            filters:
              brightness: 0.5
          position: center
          color: '#1a2a4a'
        link:
          icon: bolt
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../research/

      - title: "Inomogeneidades Químicas Estelares"
        content: "Variações na composição química das estrelas oferecem um relato detalhado das complexas interações estelares e processos nucleossintéticos ao longo de bilhões de anos."
        align: left
        background:
          image:
            filename: research/inomogeneidades-quimicas.jpg
            filters:
              brightness: 0.5
          position: center
          color: '#1a2a4a'
        link:
          icon: atom
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../research/

      - title: "Evolução Estelar e Arqueologia Galáctica"
        content: "Investigar a composição química das estrelas mais antigas desvenda os capítulos iniciais da história cósmica. Rastrear a evolução estelar permite compreender como as estrelas contribuíram para a formação de sistemas planetários."
        align: left
        background:
          image:
            filename: research/evolucao-galactica.jpg
            filters:
              brightness: 0.5
          position: center
          color: '#1a2a4a'
        link:
          icon: star
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../research/
    design:
      slide_height: ''
      is_fullscreen: true
      loop: true
      interval: 5000

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
        - Coordenador
        - Pós-Doutorandos
        - Doutorandos
        - Mestrandos
        - Graduandos
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
