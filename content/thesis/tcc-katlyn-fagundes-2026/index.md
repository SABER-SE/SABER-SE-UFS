---
title: "Aprimoramento de Modelo de Inteligência Artificial para Análise de Origem, Evolução de Estrelas e Formação Planetária Baseada em Espectros do APOGEE"
authors:
  - katlyn-fagundes
date: "2026-01-01"
publishDate: "2026-01-01"
thesis_type: "TCC"
supervisor: "Prof. Dr. Diogo Souto"
institution: "Universidade Federal de Sergipe (UFS)"
tags: ["Aprendizado de Máquina", "APOGEE", "Parâmetros Atmosféricos", "Espectroscopia Estelar", "Pipeline Computacional", "Astrofísica Computacional"]
featured: false
summary: "Desenvolvimento da StellarPipelineUnified, pipeline baseada em Random Forest e XGBoost para determinação automática de parâmetros atmosféricos (Teff, logg, [Fe/H]) em espectros do APOGEE DR17."
links:
  - name: "Baixar PDF"
    url: "https://www.dropbox.com/scl/fi/upwk3tuz5m6xhabjga0jd/TCC_Katlyn.pdf?rlkey=iruir9hgi3uj3gs3fdeof6xim&dl=0"
    icon_pack: fas
    icon: file-pdf
---

## Resumo

O presente trabalho apresenta o desenvolvimento e a aplicação de um modelo computacional baseado em aprendizado de máquina para a análise automatizada de espectros estelares provenientes do levantamento APOGEE DR17. A pesquisa propõe a criação da StellarPipelineUnified, uma pipeline unificada capaz de processar arquivos espectrais nos formatos .fits e .txt, realizando a leitura, tratamento, extração de atributos e previsão de parâmetros atmosféricos fundamentais — temperatura efetiva (Teff), gravidade superficial (logg) e metalicidade ([Fe/H]).

O modelo foi aprimorado a partir de uma iniciação científica anterior intitulada "Aplicação de Técnicas de Inteligência Artificial na Exploração de Grandes Conjuntos de Dados em Astrofísica", desenvolvida entre 2022 e 2023, e integrou técnicas de aprendizado supervisionado, com ênfase nos algoritmos Random Forest Regressor e XGBoost.

Foram analisados 25 espectros no formato .fits e 46 espectros no formato .txt, abrangendo estrelas do disco galáctico. Os resultados demonstraram coerência física e estabilidade estatística nas previsões, apresentando erros relativos médios de 0,20 para temperatura efetiva, 0,035 para gravidade superficial e 0,88 para metalicidade.

A pipeline apresentou eficiência computacional satisfatória e potencial de aplicação em grandes catálogos espectroscópicos. Os resultados reforçam o potencial da integração entre astrofísica e ciência de dados, especialmente no contexto da astrofísica computacional, fornecendo uma ferramenta escalável e adaptável para análises futuras sobre a evolução estelar, a composição química e possíveis zonas habitáveis em sistemas estelares.

**Palavras-chave:** astrofísica estelar; aprendizado de máquina; espectros estelares; parâmetros atmosféricos; APOGEE; pipeline computacional.
