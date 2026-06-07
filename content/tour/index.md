---
title: Pesquisa
date: 2022-10-24

type: landing

sections:
  # Slider de apresentação das linhas de pesquisa
  - block: slider
    content:
      slides:
      - title: "Estrelas Anãs-M e Exoplanetas"
        content: "Investigamos a composição química de estrelas frias e seus sistemas planetários usando espectroscopia de alta resolução no infravermelho."
        align: center
        background:
          image:
            filename: welcome.jpg
            filters:
              brightness: 0.5
          position: center
          color: '#1a1a2e'
        link:
          icon: telescope
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../project/estrelas-anas-m-exoplanetas/

      - title: "Abundâncias Químicas Estelares"
        content: "Medimos as concentrações de dezenas de elementos em estrelas de diferentes tipos, populações e ambientes galácticos."
        align: left
        background:
          image:
            filename: coders.jpg
            filters:
              brightness: 0.4
          position: center
          color: '#16213e'
        link:
          icon: flask
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../project/abundancias-quimicas-estelares/

      - title: "Evolução Química da Galáxia"
        content: "Reconstruímos a história química da Via Láctea combinando observações de grandes levantamentos com modelos de síntese evolutiva."
        align: right
        background:
          image:
            filename: contact.jpg
            filters:
              brightness: 0.4
          position: center
          color: '#0f3460'
        link:
          icon: star
          icon_pack: fas
          text: Ver linha de pesquisa
          url: ../project/evolucao-quimica-galaxia/

      - title: "Faça parte do SABERS-DFI"
        content: "Estamos em busca de estudantes motivados para IC, Mestrado e Doutorado em Astrofísica."
        align: center
        background:
          image:
            filename: welcome.jpg
            filters:
              brightness: 0.3
          position: center
          color: '#533483'
        link:
          icon: graduation-cap
          icon_pack: fas
          text: Ver oportunidades
          url: ../opportunities/
    design:
      slide_height: ''
      is_fullscreen: true
      loop: true
      interval: 5000

  # Linhas de pesquisa em cards
  - block: collection
    content:
      title: Linhas de Pesquisa
      subtitle: "Nossas áreas de investigação ativas"
      text: ""
      count: 4
      filters:
        folders:
          - project
      offset: 0
      order: asc
    design:
      view: card
      columns: '2'

  # Publicações de destaque
  - block: collection
    content:
      title: Publicações de Destaque
      subtitle: ""
      text: ""
      count: 3
      filters:
        folders:
          - publication
        featured_only: true
      order: desc
    design:
      view: citation
      columns: '1'

  # CTA para ver todas as publicações
  - block: markdown
    content:
      title:
      subtitle:
      text: |
        {{% cta cta_link="../publication/" cta_text="Ver todas as publicações →" %}}
    design:
      columns: '1'
---
