// =====================================================================
// Módulos interativos do Capítulo 11 — Evolução Estelar com Trilhas MIST
// e Simulações MESA / Nucleossíntese
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  // ---------------- Constantes físicas (CGS) — ver comuns.js (CONST) ----------------
  var H = CONST.H;
  var HBAR = CONST.HBAR;
  var C = CONST.C;
  var KB = CONST.KB;
  var EV = 1.602176634e-12;
  var MEV = 1e6 * EV;
  var AMU_MEV = 931.494; // MeV/c^2 por unidade de massa atômica
  var NA = CONST.NA;

  function fmt(x, casas) {
    if (x === null || x === undefined || !isFinite(x)) return '—';
    var c = casas == null ? 2 : casas;
    return x.toFixed(c).replace('.', ',');
  }
  function fmtExp(x, casas) {
    if (x === null || x === undefined || !isFinite(x) || x === 0) return '—';
    var c = casas == null ? 2 : casas;
    var e = Math.floor(Math.log10(Math.abs(x)));
    var m = x / Math.pow(10, e);
    return m.toFixed(c).replace('.', ',') + '×10' + supNum(e);
  }
  function supNum(n) {
    var supDigits = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
    return String(n).split('').map(function (ch) { return supDigits[ch] || ch; }).join('');
  }
  function clampMin(x, eps) { return Math.max(x, eps == null ? 1e-300 : eps); }
  function setupRawCanvas(id, cssHeight) {
    var canvas = document.getElementById(id);
    if (!canvas) return null;
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.parentElement.clientWidth || canvas.clientWidth || 400;
    canvas.style.width = '100%';
    canvas.style.height = cssHeight + 'px';
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas: canvas, ctx: ctx, w: cssWidth, h: cssHeight, id: id, cssHeight: cssHeight };
  }

  // =====================================================================
  // Paleta categórica de processos de nucleossíntese (acessível, baseada
  // em Okabe & Ito 2008, estendida) — ver docs/assets/estilo.css.
  // =====================================================================
  var PROC = {
    primordial: { label: 'Nucleossíntese primordial', cor: '#0072B2' },
    spallation: { label: 'Espalação por raios cósmicos', cor: '#56B4E9' },
    hydro: { label: 'Queimas hidrostáticas / SNe II', cor: '#D55E00' },
    snia: { label: 'Supernovas tipo Ia', cor: '#A6321F' },
    sproc: { label: 'Processo-s (AGB / weak-s)', cor: '#009E73' },
    rproc: { label: 'Processo-r', cor: '#7F3FBF' },
    agb: { label: 'AGB / nebulosas planetárias', cor: '#1D9E75' },
    pproc: { label: 'Processos-p / γ', cor: '#B8971F' },
    rpproc: { label: 'rp-process (X-ray bursts)', cor: '#E69F00' },
    novae: { label: 'Novas', cor: '#CC79A7' },
    nuproc: { label: 'Processo-ν', cor: '#8C564B' },
    synthetic: { label: 'Sintéticos / laboratório', cor: '#8A8A8A' },
    mixed: { label: 'Contribuições mistas (Ga–Bi)', cor: '#C9C2E8' },
    unlisted: { label: 'Não listado no Apêndice B', cor: '#E5E5E5' }
  };
  window.PROC_CAP11 = PROC;

  // Dados: [Z, símbolo, nome, período, grupo, [processos], comentário]
  // Fonte: Apêndice B (tab:Amb_Elem_Quim) do capítulo, complementado pela
  // lista itemizada da Seção "Nucleossíntese" quando o Apêndice B remete
  // a ela explicitamente (faixa Ga–Bi, "contribuições mistas").
  var ELEMENTOS = [
    [1, 'H', 'Hidrogênio', 1, 1, ['primordial'], 'Sob a forma de prótons livres (¹H) e deutério (²H).'],
    [2, 'He', 'Hélio', 1, 18, ['primordial'], 'Principalmente ⁴He, mas também ³He.'],
    [3, 'Li', 'Lítio', 2, 1, ['primordial', 'spallation', 'agb', 'nuproc'], 'Traços de ⁷Li (e menos ⁶Li) primordiais; também produzido por espalação de raios cósmicos, pelo processo Cameron–Fowler em algumas AGB, e pelo processo-ν.'],
    [4, 'Be', 'Berílio', 2, 2, ['spallation', 'novae'], 'Produzido por fragmentação de núcleos mais pesados por raios cósmicos; ⁷Be também em novas (decai em ⁷Li).'],
    [5, 'B', 'Boro', 2, 13, ['spallation', 'nuproc'], 'Produzido por espalação de raios cósmicos; ¹¹B também pelo processo-ν.'],
    [6, 'C', 'Carbono', 2, 14, ['hydro', 'agb', 'novae'], 'He- e C-burning; dredge-ups na fase AGB (estrelas de carbono) e queima em estrelas massivas; também em novas.'],
    [7, 'N', 'Nitrogênio', 2, 15, ['hydro', 'agb', 'novae'], 'He- e C-burning; processamento CNO e dredge-up em AGB; também em novas.'],
    [8, 'O', 'Oxigênio', 2, 16, ['hydro', 'novae'], 'Produzido em AGBs e SNe de colapso de núcleo em estrelas massivas; também em novas.'],
    [9, 'F', 'Flúor', 2, 17, ['hydro', 'agb', 'nuproc'], 'Contribuição de AGB, processos-ν e algumas supernovas.'],
    [10, 'Ne', 'Neônio', 2, 18, ['hydro'], 'Produzido durante He-, C- e Ne-burning.'],
    [11, 'Na', 'Sódio', 3, 1, ['hydro', 'novae'], 'Produzido durante He-, C- e Ne-burning; também em novas.'],
    [12, 'Mg', 'Magnésio', 3, 2, ['hydro'], 'Elemento α, produzido em estrelas massivas nas fases antes do colapso do núcleo.'],
    [13, 'Al', 'Alumínio', 3, 13, ['hydro', 'novae'], 'Produzido durante He-, C- e Ne-burning; ²⁶Al (radioativo, observável em raios γ) também em novas.'],
    [14, 'Si', 'Silício', 3, 14, ['hydro', 'snia'], 'C- e Ne-burning (componente estática) e queima explosiva (dinâmica); elemento α dominante em estrelas massivas; camadas externas de SNe Ia.'],
    [15, 'P', 'Fósforo', 3, 15, ['hydro'], 'Produzido durante estágios avançados e queima explosiva.'],
    [16, 'S', 'Enxofre', 3, 16, ['hydro', 'snia'], 'Elemento α; O-burning e queima explosiva; camadas externas de SNe Ia.'],
    [17, 'Cl', 'Cloro', 3, 17, ['hydro'], 'Produzido durante estágios avançados e queima explosiva.'],
    [18, 'Ar', 'Argônio', 3, 18, ['hydro'], 'Produzido durante estágios avançados e queima explosiva.'],
    [19, 'K', 'Potássio', 4, 1, ['hydro', 'nuproc'], 'Queima explosiva e camadas pré-explosão; processo-ν em SNe de colapso de núcleo (II, Ib, Ic).'],
    [20, 'Ca', 'Cálcio', 4, 2, ['hydro', 'snia'], 'Elemento α; O- e Si-burning e queima explosiva; camadas externas de SNe Ia.'],
    [21, 'Sc', 'Escândio', 4, 3, ['hydro', 'nuproc'], 'Produções variáveis em SNe II e queima explosiva; processo-ν em SNe de colapso de núcleo.'],
    [22, 'Ti', 'Titânio', 4, 4, ['hydro'], 'Produções variáveis em SNe II e queima explosiva.'],
    [23, 'V', 'Vanádio', 4, 5, ['hydro', 'nuproc'], 'Produções variáveis em SNe II e queima explosiva; processo-ν em SNe de colapso de núcleo.'],
    [24, 'Cr', 'Cromo', 4, 6, ['hydro'], 'Produções variáveis em SNe II e queima explosiva.'],
    [25, 'Mn', 'Manganês', 4, 7, ['hydro'], 'Produções variáveis em SNe II e queima explosiva.'],
    [26, 'Fe', 'Ferro', 4, 8, ['hydro', 'snia'], 'Pico do ferro; ⁵⁶Ni produzido em explosão decai em ⁵⁶Fe; grandes quantidades em SNe Ia (enriquecimento galáctico dominante de Fe).'],
    [27, 'Co', 'Cobalto', 4, 9, ['hydro', 'snia'], 'Pico do ferro; produzido em SNe massivas e em SNe Ia.'],
    [28, 'Ni', 'Níquel', 4, 10, ['hydro', 'snia'], 'Pico do ferro; ⁵⁶Ni é o produto imediato da queima explosiva, decaindo em ⁵⁶Fe.'],
    [29, 'Cu', 'Cobre', 4, 11, ['hydro', 'sproc'], 'Queima explosiva, processo-α rico e componente weak-s.'],
    [30, 'Zn', 'Zinco', 4, 12, ['hydro', 'sproc'], 'Queima explosiva, processo-α rico e componente weak-s.'],
    [31, 'Ga', 'Gálio', 4, 13, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process gera isótopos até A~100 nesta região.'],
    [32, 'Ge', 'Germânio', 4, 14, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [33, 'As', 'Arsênio', 4, 15, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [34, 'Se', 'Selênio', 4, 16, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [35, 'Br', 'Bromo', 4, 17, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [36, 'Kr', 'Criptônio', 4, 18, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [37, 'Rb', 'Rubídio', 5, 1, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [38, 'Sr', 'Estrôncio', 5, 2, ['sproc', 'mixed', 'rpproc'], 'Primeiro pico do processo-s (N~50), componente main-s de AGB.'],
    [39, 'Y', 'Ítrio', 5, 3, ['sproc', 'mixed', 'rpproc'], 'Primeiro pico do processo-s (N~50), componente main-s de AGB.'],
    [40, 'Zr', 'Zircônio', 5, 4, ['sproc', 'mixed', 'rpproc'], 'Primeiro pico do processo-s (N~50), componente main-s de AGB.'],
    [41, 'Nb', 'Nióbio', 5, 5, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [42, 'Mo', 'Molibdênio', 5, 6, ['pproc', 'mixed', 'rpproc'], 'Isótopos-p, especialmente ⁹²Mo e ⁹⁴Mo, de processos-p/γ (fotodesintegração).'],
    [43, 'Tc', 'Tecnécio', 5, 7, ['mixed', 'rpproc'], 'Sem isótopos estáveis; faixa de contribuições mistas.'],
    [44, 'Ru', 'Rutênio', 5, 8, ['pproc', 'mixed', 'rpproc'], 'Isótopos-p, especialmente ⁹⁶Ru e ⁹⁸Ru, de processos-p/γ.'],
    [45, 'Rh', 'Ródio', 5, 9, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [46, 'Pd', 'Paládio', 5, 10, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [47, 'Ag', 'Prata', 5, 11, ['rproc', 'mixed', 'rpproc'], 'Metal pesado com contribuição importante do processo-r.'],
    [48, 'Cd', 'Cádmio', 5, 12, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [49, 'In', 'Índio', 5, 13, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); rp-process contribui nesta região.'],
    [50, 'Sn', 'Estanho', 5, 14, ['mixed', 'rpproc'], 'Faixa de contribuições mistas (Ga–Bi); limite superior citado para o rp-process (A~100).'],
    [51, 'Sb', 'Antimônio', 5, 15, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi): weak-s, processo-s em AGB, processamento explosivo em SNe e processos-p distribuídos.'],
    [52, 'Te', 'Telúrio', 5, 16, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [53, 'I', 'Iodo', 5, 17, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [54, 'Xe', 'Xenônio', 5, 18, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [55, 'Cs', 'Césio', 6, 1, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [56, 'Ba', 'Bário', 6, 2, ['sproc', 'mixed'], 'Segundo pico do processo-s (N~82), componente main-s de AGB.'],
    [57, 'La', 'Lantânio', 6, 3, ['sproc', 'rproc', 'nuproc'], 'Segundo pico do processo-s (N~82); lantanídeo com contribuição também do processo-r; ¹³⁸La citado no processo-ν.'],
    [58, 'Ce', 'Cério', 6, -1, ['sproc', 'rproc'], 'Segundo pico do processo-s (N~82); lantanídeo com contribuição também do processo-r.'],
    [59, 'Pr', 'Praseodímio', 6, -1, ['sproc', 'rproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [60, 'Nd', 'Neodímio', 6, -1, ['sproc', 'rproc'], 'Segundo pico do processo-s (N~82); lantanídeo com contribuição também do processo-r.'],
    [61, 'Pm', 'Promécio', 6, -1, ['sproc', 'rproc'], 'Radioativo, sem isótopos estáveis; lantanídeo (processo-s com contribuição r).'],
    [62, 'Sm', 'Samário', 6, -1, ['sproc', 'rproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [63, 'Eu', 'Európio', 6, -1, ['rproc', 'sproc'], 'Indicador clássico do processo-r; lantanídeo com contribuição também do processo-s.'],
    [64, 'Gd', 'Gadolínio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [65, 'Tb', 'Térbio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [66, 'Dy', 'Disprósio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [67, 'Ho', 'Hólmio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [68, 'Er', 'Érbio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [69, 'Tm', 'Túlio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [70, 'Yb', 'Itérbio', 6, -1, ['rproc', 'sproc'], 'Lantanídeo (Z=57–71): parte processo-s, com contribuição r significativa para muitos isótopos.'],
    [71, 'Lu', 'Lutécio', 6, -1, ['rproc', 'sproc'], 'Extremo superior da faixa de lantanídeos citada para o processo-r (Eu a Lu), com contribuição também do processo-s.'],
    [72, 'Hf', 'Háfnio', 6, 4, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [73, 'Ta', 'Tântalo', 6, 5, ['mixed', 'nuproc'], 'Faixa de contribuições mistas (Ga–Bi); ¹⁸⁰Ta citado no processo-ν.'],
    [74, 'W', 'Tungstênio', 6, 6, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [75, 'Re', 'Rênio', 6, 7, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [76, 'Os', 'Ósmio', 6, 8, ['rproc'], 'Contribuição importante do processo-r.'],
    [77, 'Ir', 'Irídio', 6, 9, ['rproc'], 'Contribuição importante do processo-r.'],
    [78, 'Pt', 'Platina', 6, 10, ['rproc'], 'Metal pesado produzido pelo processo-r.'],
    [79, 'Au', 'Ouro', 6, 11, ['rproc'], 'Metal pesado produzido pelo processo-r — o exemplo mais citado de nucleossíntese por captura rápida de nêutrons.'],
    [80, 'Hg', 'Mercúrio', 6, 12, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [81, 'Tl', 'Tálio', 6, 13, ['mixed'], 'Faixa de contribuições mistas (Ga–Bi).'],
    [82, 'Pb', 'Chumbo', 6, 14, ['sproc'], 'Produto final típico de processos-s em baixa metalicidade (terceiro pico).'],
    [83, 'Bi', 'Bismuto', 6, 15, ['sproc'], 'Limítrofe: maior núcleo estável tipicamente originado por processos-s, gerado em certas cadeias.'],
    [84, 'Po', 'Polônio', 6, 16, ['sproc'], 'Instável; gerado a partir do bismuto em certas cadeias do processo-s.'],
    [85, 'At', 'Astato', 6, 17, ['unlisted'], 'Não listado explicitamente no Apêndice B deste capítulo.'],
    [86, 'Rn', 'Radônio', 6, 18, ['unlisted'], 'Não listado explicitamente no Apêndice B deste capítulo.'],
    [87, 'Fr', 'Frâncio', 7, 1, ['unlisted'], 'Não listado explicitamente no Apêndice B deste capítulo.'],
    [88, 'Ra', 'Rádio', 7, 2, ['unlisted'], 'Não listado explicitamente no Apêndice B deste capítulo.'],
    [89, 'Ac', 'Actínio', 7, 3, ['unlisted'], 'Não listado explicitamente no Apêndice B deste capítulo.'],
    [90, 'Th', 'Tório', 7, -1, ['rproc'], 'Produzido pelo processo-r; usado como cronômetro cosmoquímico (junto com U) para datar eventos de nucleossíntese.'],
    [91, 'Pa', 'Protactínio', 7, -1, ['sproc'], 'Também associado ao processo-s (citado na lista de "elementos naturais mais pesados" do texto).'],
    [92, 'U', 'Urânio', 7, -1, ['rproc'], 'Produzido pelo processo-r; usado como cronômetro cosmoquímico (junto com Th).'],
    [93, 'Np', 'Netúnio', 7, -1, ['synthetic'], 'Instável, meia-vida curta; sintetizado em laboratório (reatores/aceleradores); não se acumula em abundâncias cósmicas significativas.'],
    [94, 'Pu', 'Plutônio', 7, -1, ['synthetic'], 'Instável, meia-vida curta; sintetizado em laboratório; não relevante como fonte estável no meio interestelar.'],
    [95, 'Am', 'Amerício', 7, -1, ['synthetic'], 'Instável, meia-vida curta; sintetizado em laboratório.'],
    [96, 'Cm', 'Cúrio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [97, 'Bk', 'Berquélio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [98, 'Cf', 'Califórnio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [99, 'Es', 'Einstênio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [100, 'Fm', 'Férmio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [101, 'Md', 'Mendelévio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [102, 'No', 'Nobélio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [103, 'Lr', 'Laurêncio', 7, -1, ['synthetic'], 'Transurânico sintetizado em laboratório; meia-vida curta.'],
    [104, 'Rf', 'Rutherfórdio', 7, 4, ['synthetic'], 'Elemento superpesado sintetizado em laboratório; não contribui para abundâncias cósmicas.'],
    [105, 'Db', 'Dúbnio', 7, 5, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [106, 'Sg', 'Seabórgio', 7, 6, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [107, 'Bh', 'Bóhrio', 7, 7, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [108, 'Hs', 'Hássio', 7, 8, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [109, 'Mt', 'Meitnério', 7, 9, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [110, 'Ds', 'Darmstádtio', 7, 10, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [111, 'Rg', 'Roentgênio', 7, 11, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [112, 'Cn', 'Copernício', 7, 12, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [113, 'Nh', 'Nihônio', 7, 13, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [114, 'Fl', 'Fleróvio', 7, 14, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [115, 'Mc', 'Moscóvio', 7, 15, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [116, 'Lv', 'Livermório', 7, 16, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [117, 'Ts', 'Tenessino', 7, 17, ['synthetic'], 'Elemento superpesado sintetizado em laboratório.'],
    [118, 'Og', 'Oganessônio', 7, 18, ['synthetic'], 'Elemento superpesado sintetizado em laboratório; não relevante como fonte estável no meio interestelar.']
  ];
  window.ELEMENTOS_CAP11 = ELEMENTOS;

  // ================= Módulo-estrela: Tabela periódica da origem cósmica =================
  (function () {
    var grid = document.getElementById('mtab-grid');
    if (!grid) return;
    var painel = document.getElementById('mtab-painel');
    var filtroSel = document.getElementById('mtab-filtro');
    var legenda = document.getElementById('mtab-legenda');

    // legenda / filtro (opções)
    Object.keys(PROC).forEach(function (key) {
      var opt = document.createElement('option');
      opt.value = key; opt.textContent = PROC[key].label;
      filtroSel.appendChild(opt);

      var item = document.createElement('div');
      item.className = 'mtab-legenda-item';
      item.innerHTML = '<span class="mtab-swatch" style="background:' + PROC[key].cor + '"></span>' + PROC[key].label;
      legenda.appendChild(item);
    });

    function corCelula(processos) {
      if (processos.length === 1) return PROC[processos[0]].cor;
      var cores = processos.map(function (p) { return PROC[p].cor; });
      var pct = (100 / cores.length);
      var stops = cores.map(function (c, i) { return c + ' ' + (i * pct) + '%, ' + c + ' ' + ((i + 1) * pct) + '%'; });
      return 'linear-gradient(135deg, ' + stops.join(', ') + ')';
    }

    ELEMENTOS.forEach(function (el) {
      var z = el[0], sym = el[1], nome = el[2], periodo = el[3], grupo = el[4], processos = el[5], comentario = el[6];
      var cel = document.createElement('div');
      cel.className = 'mtab-elemento';
      cel.dataset.z = z;
      cel.dataset.processos = processos.join(',');
      cel.style.background = corCelula(processos);
      cel.innerHTML = '<span class="mtab-z">' + z + '</span><span class="mtab-sym">' + sym + '</span>';
      cel.title = nome;
      // posicionamento: grupo -1 = bloco f (lantanídeos/actinídeos), linhas extras
      if (grupo === -1) {
        var linhaF = periodo === 6 ? 9 : 10;
        var colF = 4 + (z - (periodo === 6 ? 57 : 89));
        cel.style.gridRow = linhaF;
        cel.style.gridColumn = colF;
      } else {
        cel.style.gridRow = periodo;
        cel.style.gridColumn = grupo;
      }
      cel.addEventListener('click', function () {
        document.querySelectorAll('.mtab-elemento.selecionado').forEach(function (e) { e.classList.remove('selecionado'); });
        cel.classList.add('selecionado');
        var listaProc = processos.map(function (p) { return '<span class="mtab-badge" style="background:' + PROC[p].cor + '">' + PROC[p].label + '</span>'; }).join(' ');
        painel.innerHTML = '<h4>' + nome + ' (' + sym + ') — Z=' + z + '</h4><div class="mtab-badges">' + listaProc + '</div><p>' + comentario + '</p>';
      });
      grid.appendChild(cel);
    });

    filtroSel.addEventListener('change', function () {
      var alvo = filtroSel.value;
      document.querySelectorAll('.mtab-elemento').forEach(function (cel) {
        if (!alvo) { cel.classList.remove('esmaecido'); return; }
        var procs = cel.dataset.processos.split(',');
        if (procs.indexOf(alvo) === -1) cel.classList.add('esmaecido');
        else cel.classList.remove('esmaecido');
      });
    });
  })();

  // =====================================================================
  // Carta de nuclídeos: processo-s vs. processo-r (animação)
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mnucl-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mnucl-canvas', 420);
    var playBtn = document.getElementById('mnucl-play'), resetBtn = document.getElementById('mnucl-reset');
    var densS = document.getElementById('mnucl-nn');
    var densV = document.getElementById('mnucl-nn-valor'), regimeEl = document.getElementById('mnucl-regime');

    // Vale de estabilidade esquemático: Z_estavel(N) ~ N/(1.5+0.01N) invertido;
    // usamos aqui a forma usual N/Z cresce com A. Trabalhamos em coordenadas
    // relativas (N,Z) inteiras pequenas para caber no canvas, com "ilhas" que
    // representam os picos reais citados no texto (N~50, N~82, e a região dos
    // actinídeos), não uma carga de nuclídeos completa e real.
    function zEstavel(n) { return n / (1.15 + 0.011 * n); }

    var CAMINHO_S = []; // pontos (N,Z) do caminho tipo processo-s (ao longo do vale)
    (function () {
      var n = 20;
      while (n < 145) {
        var z = zEstavel(n);
        CAMINHO_S.push({ n: n, z: z });
        n += 3;
      }
    })();
    var PICOS_S = [{ n: 50, label: 'N~50 (Sr,Y,Zr)' }, { n: 82, label: 'N~82 (Ba,La,Ce,Nd)' }, { n: 126, label: 'Pb (3º pico)' }];

    function desenhaFrame(t, modo) {
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 46, padB = 34, padT = 16, padR = 14;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      var nMax = 150, zMax = 100;
      function px(n) { return padL + (n / nMax) * plotW; }
      function py(z) { return h - padB - (z / zMax) * plotH; }

      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('N (nêutrons)', padL + plotW / 2, h - 10);
      ctx.save(); ctx.translate(14, padT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('Z (prótons)', 0, 0); ctx.restore();

      // vale de estabilidade
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath();
      for (var n = 10; n <= nMax; n += 2) {
        var z = zEstavel(n);
        var x = px(n), y = py(z);
        if (n === 10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('vale de estabilidade', px(90) + 4, py(zEstavel(90)));

      // picos do processo-s
      PICOS_S.forEach(function (p) {
        var x = px(p.n);
        ctx.strokeStyle = CORES_GRAFICO.curva; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke(); ctx.setLineDash([]);
      });

      if (modo === 's') {
        var nEstados = Math.max(1, Math.round(t * CAMINHO_S.length));
        ctx.strokeStyle = CORES_GRAFICO.curva; ctx.fillStyle = CORES_GRAFICO.curva; ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (var i = 0; i < nEstados; i++) {
          var pt = CAMINHO_S[i];
          var x = px(pt.n), y = py(pt.z);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        var last = CAMINHO_S[nEstados - 1];
        ctx.beginPath(); ctx.arc(px(last.n), py(last.z), 5, 0, 2 * Math.PI); ctx.fill();
        regimeEl.textContent = 'Processo-s: captura de nêutron (N aumenta em 1) → espera → decaimento β⁻ (N-1, Z+1, sobe e volta ao vale) → repete. Caminho lento, sempre próximo ao vale de estabilidade, subindo pelos picos N~50, N~82 e até o Pb.';
      } else {
        // processo-r: salto abrupto para a direita (rico em nêutrons), depois cascata de decaimentos beta de volta
        var zBase = 40, nBase = 50;
        var fase1 = Math.min(1, t * 2); // salto rápido de capturas
        var fase2 = Math.max(0, Math.min(1, (t - 0.5) * 2)); // cascata beta de volta
        var nAtual = nBase + fase1 * 55;
        var zAtual = zBase + fase2 * 20;
        // trajetória de captura (horizontal, rica em nêutrons)
        ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(px(nBase), py(zBase)); ctx.lineTo(px(nBase + fase1 * 55), py(zBase)); ctx.stroke();
        if (fase2 > 0) {
          // cascata beta em degraus diagonais de volta ao vale
          ctx.strokeStyle = CORES_GRAFICO.extra; ctx.lineWidth = 2;
          ctx.beginPath();
          var nc = nBase + 55, zc = zBase;
          ctx.moveTo(px(nc), py(zc));
          var passos = Math.round(fase2 * 20);
          for (var k = 1; k <= passos; k++) {
            nc -= 1; zc += 1;
            ctx.lineTo(px(nc), py(zc));
          }
          ctx.stroke();
          nAtual = nc; zAtual = zc;
        }
        ctx.fillStyle = CORES_GRAFICO.marcador;
        ctx.beginPath(); ctx.arc(px(nAtual), py(zAtual), 5, 0, 2 * Math.PI); ctx.fill();
        regimeEl.textContent = fase2 < 0.02
          ? 'Processo-r: rajada de capturas rápidas de nêutron empurra o núcleo para longe do vale (região rica em nêutrons), sem tempo para decair entre capturas.'
          : 'Processo-r: após a rajada, cascata de decaimentos β⁻ traz os núcleos ricos em nêutrons de volta em direção ao vale de estabilidade — é essa cascata que produz os elementos pesados finais (lantanídeos, Au, Pt, Th, U).';
      }
    }

    var modoAtual = 's';
    var ctrl = createAnimController(playBtn, resetBtn, 5, function (t) { desenhaFrame(t, modoAtual); }, { play: function () { return modoAtual === 's' ? '▶ Animar processo-s' : '▶ Animar processo-r'; }, playing: '❚❚ Animando…' });
    document.getElementById('mnucl-modo-s').addEventListener('click', function () {
      modoAtual = 's'; if (!ctrl.isAnimando()) playBtn.textContent = '▶ Animar processo-s'; desenhaFrame(0, 's');
      document.getElementById('mnucl-modo-s').classList.add('ativo'); document.getElementById('mnucl-modo-r').classList.remove('ativo');
    });
    document.getElementById('mnucl-modo-r').addEventListener('click', function () {
      modoAtual = 'r'; if (!ctrl.isAnimando()) playBtn.textContent = '▶ Animar processo-r'; desenhaFrame(0, 'r');
      document.getElementById('mnucl-modo-r').classList.add('ativo'); document.getElementById('mnucl-modo-s').classList.remove('ativo');
    });
    densS.addEventListener('input', function () {
      var logn = Number(densS.value) / 100 * 24; // slider 0-100 -> expoente 0-24 (cobre s: ~10^10 e r: ~10^20)
      densV.textContent = fmtExp(Math.pow(10, logn), 1);
      var regimeTxt = document.getElementById('mnucl-regime-densidade');
      if (logn < 10) regimeTxt.textContent = 'n_n ≲ 10¹⁰ cm⁻³: regime do processo-s (AGB, weak-s).';
      else if (logn > 20) regimeTxt.textContent = 'n_n ≳ 10²⁰ cm⁻³: regime do processo-r (fusões de estrelas de nêutrons — sítio principal confirmado; supernovas magnetorrotacionais raras podem contribuir).';
      else regimeTxt.textContent = 'Regime intermediário — nem s nem r puros nesta densidade de referência.';
    });
    densS.value = 33; densS.dispatchEvent(new Event('input')); // ~10^8 cm^-3, regime-s (default)
    desenhaFrame(0, 's');
  })();

  // ================= Módulo: barreira coulombiana e tunelamento (animação) =================
  (function () {
    var canvas = document.getElementById('mbarreira-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mbarreira-canvas', 320);
    var z1z2S = document.getElementById('mbarreira-z1z2'), energiaS = document.getElementById('mbarreira-energia');
    var playBtn = document.getElementById('mbarreira-play'), resetBtn = document.getElementById('mbarreira-reset');
    var z1z2V = document.getElementById('mbarreira-z1z2-valor'), energiaV = document.getElementById('mbarreira-energia-valor');
    var ecEl = document.getElementById('mbarreira-Ec'), tEl = document.getElementById('mbarreira-T'), notaEl = document.getElementById('mbarreira-nota');
    var R0 = 1.4; // fm, raio nuclear efetivo de referência
    var E2_MEVFM = 1.44; // MeV*fm

    function Ec(z1z2) { return E2_MEVFM * z1z2 / R0; }
    function tempIgnicao(z1z2) {
      // T de referencia (K) tal que kT ~ Ec/20 (regra de bolso p/ ilustrar a escala, nao um calculo de taxa completo)
      var Ec_erg = Ec(z1z2) * MEV;
      return Ec_erg / (20 * KB);
    }
    function desenhaFrame(t) {
      var z1z2 = Number(z1z2S.value);
      var Efrac = Number(energiaS.value) / 1000; // fracao da barreira, 0-1
      z1z2V.textContent = z1z2;
      var E_C = Ec(z1z2);
      var E = Efrac * E_C * 1.3;
      energiaV.textContent = fmt(E, 3);
      ecEl.textContent = fmt(E_C, 2);
      tEl.textContent = fmtExp(tempIgnicao(z1z2), 2);

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 50, padB = 30, padT = 16, padR = 20;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      var rMax = 12; // fm
      function px(r) { return padL + (r / rMax) * plotW; }
      function Vr(r) { return r < R0 ? -10 : E2_MEVFM * z1z2 / r; }
      var Vmax = Math.max(E_C * 1.3, 5);
      function py(v) { return h - padB - ((v + 10) / (Vmax + 10)) * plotH; }

      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('r (fm)', padL + plotW / 2, h - 8);

      ctx.strokeStyle = '#1c4878'; ctx.lineWidth = 2.2; ctx.beginPath();
      for (var r = 0.3; r <= rMax; r += 0.1) {
        var x = px(r), y = py(Vr(r));
        if (r === 0.3) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // nivel de energia E
      ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(padL, py(E)); ctx.lineTo(w - padR, py(E)); ctx.stroke(); ctx.setLineDash([]);

      // ponto turning classico
      var rTurn = E > 0 ? E2_MEVFM * z1z2 / E : rMax;

      // particula se aproximando (animada por t): comeca longe, se aproxima; ao cruzar rTurn, "tunela" com opacidade reduzida ate R0
      var eta = Math.sqrt(E_C / clampMin(E)) * 0.75; // proxy adimensional da opacidade de tunelamento (nao a formula exata de Gamow)
      var probTun = Math.exp(-clampMin(eta, 0));
      var rParticula = rMax - t * (rMax - R0 * 0.9);
      var dentroBarreira = rParticula < rTurn;
      ctx.fillStyle = CORES_GRAFICO.curva;
      ctx.globalAlpha = dentroBarreira ? Math.max(0.08, Math.min(1, probTun)) : 1;
      ctx.beginPath(); ctx.arc(px(Math.max(R0 * 0.9, rParticula)), py(E), 6, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = 1;

      notaEl.textContent = dentroBarreira
        ? 'Dentro da barreira clássica (r < ' + fmt(rTurn, 2) + ' fm): a partícula só "atravessa" por tunelamento quântico — opacidade do marcador ∝ probabilidade de tunelamento.'
        : 'Fora do raio de retorno clássico — aproximação livre.';
    }
    createAnimController(playBtn, resetBtn, 4, desenhaFrame, { play: '▶ Aproximar núcleo', playing: '❚❚ Aproximando…' });
    z1z2S.addEventListener('input', function () { desenhaFrame(0); });
    energiaS.addEventListener('input', function () { desenhaFrame(0); });
    desenhaFrame(0);
  })();

  // ================= Módulo: pico de Gamow =================
  (function () {
    var TS = document.getElementById('mgamow-T'), z1z2S = document.getElementById('mgamow-z1z2');
    if (!TS) return;
    var TV = document.getElementById('mgamow-T-valor'), z1z2V = document.getElementById('mgamow-z1z2-valor');
    var E0el = document.getElementById('mgamow-E0');
    var chart = null;
    function desenha() {
      var T = Math.pow(10, Number(TS.value) / 100);
      var z1z2 = Number(z1z2S.value);
      TV.textContent = fmtExp(T, 2); z1z2V.textContent = z1z2;
      var mu = 1; // massa reduzida de referencia (~1 amu, p/ ilustrar a forma do pico)
      var EG = 986.6 * z1z2 * z1z2 * mu; // keV, formula de Iliadis
      var kT_keV = 0.08617333 * T / 1000; // keV (kB em keV/K * T)... kB=8.617333e-5 eV/K=8.617333e-8 keV/K
      kT_keV = 8.617333e-8 * T;
      var E0 = Math.pow(EG * kT_keV * kT_keV / 4, 1 / 3);
      E0el.textContent = fmt(E0, 2);
      var Es = linspace(0.01, Math.max(5 * E0, 1), 200);
      var maxwell = Es.map(function (E) { return Math.exp(-E / kT_keV); });
      var tunel = Es.map(function (E) { return Math.exp(-Math.sqrt(EG / E)); });
      var produto = Es.map(function (E, i) { return maxwell[i] * tunel[i]; });
      var maxProd = Math.max.apply(null, produto) || 1;
      var maxMax = Math.max.apply(null, maxwell) || 1;
      var maxTun = Math.max.apply(null, tunel) || 1;
      var ctx = document.getElementById('mgamow-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: Es.map(function (E, i) { return { x: E, y: maxwell[i] / maxMax }; }), borderColor: '#999', backgroundColor: 'transparent', borderWidth: 1.6, borderDash: [3, 3], pointRadius: 0, fill: false },
            { data: Es.map(function (E, i) { return { x: E, y: tunel[i] / maxTun }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'transparent', borderWidth: 1.6, borderDash: [3, 3], pointRadius: 0, fill: false },
            { data: Es.map(function (E, i) { return { x: E, y: produto[i] / maxProd }; }), borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador + '22', borderWidth: 2.6, pointRadius: 0, fill: true }
          ]
        },
        options: chartBaseOptions('E (keV)', 'amplitude normalizada', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    TS.addEventListener('input', desenha); z1z2S.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: energia de ligação por núcleon (SEMF) =================
  (function () {
    var chart = null;
    var canvas = document.getElementById('mligacao-canvas');
    if (!canvas) return;
    var aV = 15.75, aS = 17.8, aC = 0.711, aA = 23.7, aP = 11.18;
    function bindingTotal(A, Z) {
      var N = A - Z;
      var termoV = aV * A;
      var termoS = -aS * Math.pow(A, 2 / 3);
      var termoC = -aC * Z * (Z - 1) / Math.pow(A, 1 / 3);
      var termoA = -aA * Math.pow(A - 2 * Z, 2) / A;
      var par = (Z % 2 === 0) && (N % 2 === 0) ? 1 : ((Z % 2 !== 0) && (N % 2 !== 0) ? -1 : 0);
      var termoP = par * aP / Math.sqrt(A);
      return termoV + termoS + termoC + termoA + termoP;
    }
    function melhorZ(A) {
      var melhorB = -Infinity, melhorZv = 1;
      for (var Z = 1; Z < A; Z++) {
        var B = bindingTotal(A, Z);
        if (B > melhorB) { melhorB = B; melhorZv = Z; }
      }
      return { Z: melhorZv, B: melhorB };
    }
    var As = [];
    for (var A = 4; A <= 240; A += 2) As.push(A);
    var BAdata = As.map(function (A) { var r = melhorZ(A); return r.B / A; });
    var idxFe = As.indexOf(56);
    var ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          datasetCurva(As, BAdata, CORES_GRAFICO.curva),
          datasetMarcador(As, idxFe, BAdata, CORES_GRAFICO.marcador)
        ]
      },
      options: chartBaseOptions('A (número de massa)', 'B/A (MeV/núcleon)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
    });
    var el = document.getElementById('mligacao-fe56');
    if (el) el.textContent = fmt(BAdata[idxFe], 3);
  })();

  // ================= Módulo (animação): estrutura em cascas pré-colapso =================
  (function () {
    var canvas = document.getElementById('mcebola-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mcebola-canvas', 380);
    var playBtn = document.getElementById('mcebola-play'), resetBtn = document.getElementById('mcebola-reset');
    var CAMADAS = [
      { nome: 'núcleo de Fe', T: '~4×10⁹ K', cor: '#333333' },
      { nome: 'Si → Fe', T: '~3×10⁹ K', cor: '#8C564B' },
      { nome: 'O, Ne, Mg → Si', T: '~1,5×10⁹ K', cor: '#D55E00' },
      { nome: 'Ne → O, Mg', T: '~1,2×10⁹ K', cor: '#E69F00' },
      { nome: 'C → Ne, Na', T: '~6×10⁸ K', cor: '#B8971F' },
      { nome: 'He → C, O', T: '~2×10⁸ K', cor: '#009E73' },
      { nome: 'H → He (CNO)', T: '~4×10⁷ K', cor: '#0072B2' },
      { nome: 'envelope (H, He)', T: '~10⁴ K', cor: '#56B4E9' }
    ];
    function desenhaFrame(t) {
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var raioMax = Math.min(w, h) * 0.44;
      var nCamadas = Math.max(1, Math.round(t * CAMADAS.length));
      for (var i = CAMADAS.length - 1; i >= CAMADAS.length - nCamadas; i--) {
        var raio = raioMax * Math.sqrt((i + 1) / CAMADAS.length);
        ctx.fillStyle = CAMADAS[i].cor;
        ctx.beginPath(); ctx.arc(cx, cy, raio, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      for (var j = CAMADAS.length - 1; j >= CAMADAS.length - nCamadas; j--) {
        var r2 = raioMax * Math.sqrt((j + 1) / CAMADAS.length);
        ctx.beginPath(); ctx.arc(cx, cy, r2, 0, 2 * Math.PI); ctx.stroke();
      }
      // legenda lateral
      ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
      var legY = 14;
      for (var k = CAMADAS.length - nCamadas; k < CAMADAS.length; k++) {
        ctx.fillStyle = CAMADAS[k].cor;
        ctx.fillRect(8, legY, 10, 10);
        ctx.fillStyle = '#333';
        ctx.fillText(CAMADAS[k].nome + ' (' + CAMADAS[k].T + ')', 22, legY + 9);
        legY += 16;
      }
    }
    createAnimController(playBtn, resetBtn, 5, desenhaFrame, { play: '▶ Construir camadas', playing: '❚❚ Construindo…' });
    desenhaFrame(0.02);
  })();

  // ================= Módulo: painel da vida de uma estrela (dashboard) =================
  (function () {
    var presetSel = document.getElementById('mdash-preset'), playBtn = document.getElementById('mdash-play'), resetBtn = document.getElementById('mdash-reset');
    if (!presetSel) return;
    var faseV = document.getElementById('mdash-fase-valor');
    var TeffEl = document.getElementById('mdash-Teff'), LEl = document.getElementById('mdash-L'), REl = document.getElementById('mdash-R'), TcEl = document.getElementById('mdash-Tc'), rhocEl = document.getElementById('mdash-rhoc'), procEl = document.getElementById('mdash-processo'), notaEl = document.getElementById('mdash-nota');
    var chartHR = null;

    // Presets: dois pontos-âncora EXPLICITAMENTE citados no texto (início/fim);
    // a interpolação entre eles é esquemática (log-linear), não uma trilha real.
    var PRESETS = {
      m05: {
        nome: '0,5 M☉ (MIST)',
        nota: 'A trilha de 0,5 M☉ não atinge a TAMS na grade MIST (X_c mín ≈0,32); os dois pontos aqui são ambos próximos à ZAMS — praticamente sem evolução visível nesta grade.',
        p0: { Teff: 3800, logL: -1.40, R: 0.46, Tc: 9.06e6, rhoc: 85.6, proc: 'pp' },
        p1: { Teff: 3800, logL: -1.40, R: 0.46, Tc: 9.06e6, rhoc: 85.6, proc: 'pp' }
      },
      m1: {
        nome: '1,0 M☉ (MIST)',
        nota: 'Ponto final: R>300 R☉ e log Teff<3,5 (~3160 K) no topo do ramo das gigantes, valores citados explicitamente no texto; log L no ponto final foi obtido por Stefan–Boltzmann (L=4πR²σT⁴) a partir de R e Teff citados — não é um valor tabulado.',
        p0: { Teff: 5710, logL: -0.13, R: 0.88, Tc: 1.37e7, rhoc: 79.0, proc: 'pp' },
        p1: { Teff: 3160, logL: null, R: 300, Tc: 1e8, rhoc: null, proc: 'flash' }
      },
      m5: {
        nome: '5,0 M☉ (MIST)',
        nota: 'Ponto final: pulsos térmicos da fase TPAGB (~115,6 Myr), onde ρc≈1,25×10⁷ g/cm³ (valor citado explicitamente); T_c nessa fase específica não é dado com precisão no texto e por isso não é interpolado aqui — apenas ρc e o processo dominante (triplo-α) são mostrados no ponto final.',
        p0: { Teff: 17750, logL: 2.74, R: 2.47, Tc: 2.84e7, rhoc: 24.0, proc: 'CNO' },
        p1: { Teff: null, logL: null, R: null, Tc: null, rhoc: 1.25e7, proc: '3alfa' }
      },
      m25: {
        nome: '25,0 M☉ (MIST)',
        nota: 'Ponto final: raio máximo citado "mais de 1200 R☉" e densidade central final ~2,2×10⁵ g/cm³, ambos valores explícitos do texto (fase avançada, antes do colapso).',
        p0: { Teff: 38720, logL: 4.88, R: 6.13, Tc: 3.88e7, rhoc: 4.6, proc: 'CNO' },
        p1: { Teff: null, logL: null, R: 1200, Tc: null, rhoc: 2.2e5, proc: 'avancado' }
      },
      m50mesa: {
        nome: '50 M☉ (simulação MESA real, não MIST)',
        nota: 'Único preset com AMBOS os pontos vindos diretamente da simulação MESA real deste capítulo (history.data, 1 a 5,24 Myr) — não uma reconstrução. Ainda assim, o caminho intermediário mostrado é apenas uma interpolação simples entre os dois extremos simulados, não os 333 modelos reais.',
        p0: { Teff: Math.pow(10, 4.66), logL: 5.56, R: 9.7, Tc: null, rhoc: null, proc: 'CNO' },
        p1: { Teff: Math.pow(10, 3.86), logL: 5.79, R: 497, Tc: null, rhoc: null, proc: 'CNO' }
      }
    };

    function interp(a, b, t) {
      if (a == null || b == null) return null;
      if (a <= 0 || b <= 0) return a + (b - a) * t;
      return Math.pow(10, Math.log10(a) + (Math.log10(b) - Math.log10(a)) * t);
    }
    function processoLabel(code) {
      return { pp: 'cadeia pp', CNO: 'ciclo CNO', flash: 'flash do hélio (transição pp/CNO → 3α)', '3alfa': 'processo triplo-α', avancado: 'queima avançada (He→Si)' }[code] || '—';
    }

    function desenha(t) {
      var preset = PRESETS[presetSel.value];
      faseV.textContent = fmt(t, 2);
      var Teff = interp(preset.p0.Teff, preset.p1.Teff, t);
      var L = preset.p0.logL != null && preset.p1.logL != null ? preset.p0.logL + (preset.p1.logL - preset.p0.logL) * t : (preset.p0.logL != null ? preset.p0.logL : preset.p1.logL);
      var R = interp(preset.p0.R, preset.p1.R, t);
      // se faltar log L mas tivermos R e Teff (caso 1 Msun final), deriva por Stefan-Boltzmann
      if (L == null && R != null && Teff != null) {
        var Lsun_equiv = Math.pow(R, 2) * Math.pow(Teff / 5772, 4);
        L = Math.log10(Lsun_equiv);
      }
      var Tc = interp(preset.p0.Tc, preset.p1.Tc, t);
      var rhoc = interp(preset.p0.rhoc, preset.p1.rhoc, t);
      var proc = t < 0.5 ? preset.p0.proc : preset.p1.proc;

      TeffEl.textContent = Teff != null ? fmt(Teff, 0) : '—';
      LEl.textContent = L != null ? fmt(L, 2) : '—';
      REl.textContent = R != null ? fmt(R, 2) : '—';
      TcEl.textContent = Tc != null ? fmtExp(Tc, 2) : '—';
      rhocEl.textContent = rhoc != null ? fmtExp(rhoc, 2) : '—';
      procEl.textContent = processoLabel(proc);
      notaEl.textContent = preset.nota;

      var logTeff = Teff != null ? Math.log10(Teff) : null;
      var d0 = [{ x: Math.log10(preset.p0.Teff), y: preset.p0.logL }];
      var d1 = preset.p1.Teff != null && preset.p1.logL != null ? [{ x: Math.log10(preset.p1.Teff), y: preset.p1.logL }] : [];
      var dAtual = logTeff != null && L != null ? [{ x: logTeff, y: L }] : [];
      if (!chartHR) {
        var ctx = document.getElementById('mdash-canvas').getContext('2d');
        chartHR = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              { data: d0, borderColor: '#999', backgroundColor: '#999', pointRadius: 5 },
              { data: d1, borderColor: '#999', backgroundColor: '#999', pointRadius: 5 },
              { data: dAtual, borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 8 }
            ]
          },
          options: chartBaseOptions('log₁₀(T_eff) [eixo invertido]', 'log₁₀(L/L_☉)', { xScale: { type: 'linear', reverse: true }, yScale: { type: 'linear' } })
        });
      } else {
        chartHR.data.datasets[0].data = d0;
        chartHR.data.datasets[1].data = d1;
        chartHR.data.datasets[2].data = dAtual;
        chartHR.update('none');
      }
    }
    var ctrl = createAnimController(playBtn, resetBtn, 5, desenha, { play: '▶ Evoluir estrela', playing: '❚❚ Evoluindo…' });
    presetSel.addEventListener('change', function () { desenha(0); });
    desenha(0);
  })();

  // ================= Módulo: isócronas esquemáticas (sem dados MIST locais) =================
  (function () {
    var idadeS = document.getElementById('miso-idade');
    if (!idadeS) return;
    var idadeV = document.getElementById('miso-idade-valor');
    var chart = null;
    function trilhaEsquematica(massaRel, idadeGyr, idadeVidaGyr) {
      // Curva puramente ilustrativa: sequencia principal + turn-off quando idade
      // se aproxima da "idade de vida" (~ idadeVidaGyr) daquela massa relativa.
      var fracVida = Math.min(1, idadeGyr / idadeVidaGyr);
      var logTeffSP = 3.5 + 0.35 * Math.log10(massaRel + 0.3);
      var logLSP = 3.2 * Math.log10(massaRel + 0.2);
      if (fracVida < 0.97) return { x: logTeffSP, y: logLSP, ativa: true };
      // pos-turn-off: sobe em L, esfria (ramo das gigantes esquemático)
      var frac2 = (fracVida - 0.97) / 0.03;
      return { x: logTeffSP - 0.25 * Math.min(1, frac2), y: logLSP + 1.4 * Math.min(1, frac2), ativa: true };
    }
    function desenha() {
      var idade = Number(idadeS.value) / 100;
      idadeV.textContent = fmt(idade, 2);
      var massas = linspace(0.4, 3.0, 60);
      var pontos = massas.map(function (m) {
        var idadeVidaGyr = 10 * Math.pow(m, -2.7); // relaçao esquemática t~M^-2.7 normalizada ao Sol=10 Gyr
        return trilhaEsquematica(m, idade, idadeVidaGyr);
      });
      // turn-off: maior massa ainda "ativa" (fracVida<0.97)
      var massaTurnoff = null;
      for (var i = massas.length - 1; i >= 0; i--) {
        var idadeVidaGyr = 10 * Math.pow(massas[i], -2.7);
        if (idade / idadeVidaGyr < 0.97) { massaTurnoff = massas[i]; break; }
      }
      var elTO = document.getElementById('miso-turnoff');
      if (elTO) elTO.textContent = massaTurnoff ? fmt(massaTurnoff, 2) : '< 0,4';
      var ctx = document.getElementById('miso-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [{ data: pontos.map(function (p) { return { x: p.x, y: p.y }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.4, pointRadius: 0, fill: false, tension: 0.2 }] },
        options: chartBaseOptions('log₁₀(T_eff) [esquemático, eixo invertido]', 'log₁₀(L/L_☉) [esquemático]', { xScale: { type: 'linear', reverse: true }, yScale: { type: 'linear' } })
      });
    }
    idadeS.addEventListener('input', desenha);
    desenha();
  })();

  // ---------------- Apêndice A: botão de copiar inlist ----------------
  (function () {
    var botao = document.getElementById('apA-copiar');
    var codigo = document.getElementById('apA-codigo');
    if (!botao || !codigo) return;
    botao.addEventListener('click', function () {
      var texto = codigo.textContent;
      function marcarCopiado() {
        var original = botao.textContent;
        botao.textContent = 'Copiado!';
        botao.classList.add('copiado');
        setTimeout(function () { botao.textContent = original; botao.classList.remove('copiado'); }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(marcarCopiado, function () {});
      } else {
        var area = document.createElement('textarea');
        area.value = texto;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); marcarCopiado(); } catch (e) {}
        document.body.removeChild(area);
      }
    });
  })();

})();
