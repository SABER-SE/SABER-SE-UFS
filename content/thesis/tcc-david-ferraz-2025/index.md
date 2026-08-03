---
title: "Caracterização Físico-química de Estrelas Frias com Dados do SDSS/APOGEE: Uma Abordagem com Inteligência Artificial"
authors:
  - david-ferraz
date: "2025-01-01"
publishDate: "2025-01-01"
thesis_type: "TCC"
supervisor: "Prof. Dr. Diogo Souto"
institution: "Universidade Federal de Sergipe (UFS) — Departamento de Computação"
tags: ["Estrelas Frias", "APOGEE", "SDSS", "Aprendizado de Máquina", "PCA", "LightGBM", "Abundâncias Químicas", "Parâmetros Atmosféricos"]
featured: false
summary: "Abordagem orientada a dados combinando PCA e LightGBM para estimar 12 parâmetros físico-químicos de 36.559 estrelas frias do APOGEE DR19 sem síntese espectral, atingindo R² > 0,85 em todos os parâmetros."
links:
  - name: "Baixar PDF"
    url: "https://www.dropbox.com/scl/fi/osw55fjfk83lakvxh4usf/TCC_David.pdf?rlkey=7rdmmjzlinopm4t5wvpwetjck&dl=0"
    icon_pack: fas
    icon: file-pdf
---

## Resumo

A caracterização físico-química de estrelas frias das classes K e M é fundamental para os estudos de evolução química e dinâmica da Via Láctea, mas é dificultada pela complexidade de seus espectros densos em linhas atômicas e bandas moleculares. Este trabalho investiga a viabilidade de estimar parâmetros estelares diretamente a partir dos espectros brutos no infravermelho próximo do levantamento SDSS/APOGEE (DR19), sem recorrer à síntese espectral, por meio de uma abordagem orientada a dados.

A partir do catálogo ASPCAP, foi selecionada uma amostra de 36.559 estrelas frias, com temperatura efetiva entre 2100 e 5000 K e relação sinal-ruído superior a 200. Cada espectro da banda H foi comprimido por Análise de Componentes Principais (PCA) em 50 componentes, que retêm 89,2% da variância, empregados como atributos para treinar doze regressores LightGBM independentes — um para cada parâmetro: temperatura efetiva, gravidade superficial e abundâncias de dez elementos químicos.

O desempenho foi avaliado por validação cruzada de cinco partições e por um conjunto de teste reservado de 20%, com as métricas MAE, RMSE e R², complementadas por análises estratificadas por faixas de temperatura e metalicidade, verificações de estabilidade e robustez a ruído, e comparação com um baseline de regressão linear.

Os doze parâmetros foram recuperados com R² superior a 0,85, com destaque para a gravidade superficial (0,975), a temperatura efetiva (0,974) e a metalicidade (0,970). O LightGBM reduziu o erro absoluto médio entre 33% e 65% em relação ao baseline linear. Os resultados demonstram que uma combinação simples e interpretável de redução de dimensionalidade e árvores com gradient boosting é capaz de caracterizar estrelas frias de forma rápida e precisa, constituindo uma alternativa eficiente às técnicas baseadas em síntese espectral e redes neurais profundas.

**Palavras-chave:** Estrelas frias; SDSS/APOGEE; Aprendizado de máquina; Análise de componentes principais; LightGBM; Abundâncias químicas.
