---
title: "Espectroscopia de Alta Resolução no Infravermelho"

summary: |
  Desenvolvimento e aplicação de técnicas espectroscópicas de alta resolução no infravermelho próximo para o estudo de estrelas frias e obscurecidas.

tags:
  - Espectroscopia
  - Infravermelho
  - Instrumentação
  - APOGEE

date: "2019-01-01T00:00:00Z"

authors:
  - admin

external_link: ""

image:
  caption: "Espectro estelar de HD 126587 com linhas de absorção de H, Ba, Nd e Sr identificadas — Crédito: NOAO/AURA/NSF"
  focal_point: Smart
  filename: research/spectroscopy.jpg

url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""

slides: ""
---

## Visão Geral

A **espectroscopia no infravermelho próximo** (NIR, ~1.5–1.7 μm) é uma ferramenta poderosa para o estudo de:
- Estrelas frias (anãs-M, T < 4000 K), cujo pico de emissão está no NIR
- Estrelas em regiões obscurecidas por poeira interestelar
- Estrelas no centro galáctico

Nesta linha, trabalhamos com dados do espectrôgrafo **APOGEE** (*Apache Point Observatory Galactic Evolution Experiment*), operando no telescópio de 2.5 m do Sloan Digital Sky Survey (SDSS) com resolução R ~ 22.500.

## Técnicas

- Síntese espectral linha a linha
- Análise de equivalente de largura (EW)
- Determinação de parâmetros via minimização de χ²
- Correções de pressão para linhas moleculares (OH, CO, H₂O)

## Infraestrutura computacional

O grupo utiliza principalmente **Python** (astropy, specutils, scipy) e **Fortran** (MOOG, SYNTHE) para processamento e análise de espectros. Todo o código desenvolvido é versionado e disponibilizado no GitHub.

## Perspectivas

Com a entrada em operação de novos instrumentos como o **CRIRES+** (VLT) e o futuro **MSE**, pretendemos expandir nossas análises para estrelas mais frias e sistemas em ambientes mais extremos.

---
*Imagem: Nebulosa do Caranguejo (Messier 1) · Crédito: NASA/ESA/Hubble Heritage Team · Domínio Público*
