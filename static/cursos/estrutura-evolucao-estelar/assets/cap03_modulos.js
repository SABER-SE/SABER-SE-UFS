// =====================================================================
// Módulos interativos do Capítulo 3 — Termodinâmica
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// Externalizado do HTML (Sessão 4 da auditoria) para o mesmo padrão de
// arquivo dos Caps. 4-11 — Cap. 3 já usava Chart.js, nenhuma mudança de
// lógica ou biblioteca aqui, só reorganização de arquivo.
// =====================================================================
(function () {
  var R_GAS = 8.314e7; // erg / (g.K) por unidade de mu

  function alturaFixa(canvasId, px) {
    var el = document.getElementById(canvasId);
    el.parentElement.style.height = px + 'px';
    return el;
  }

  // ---------- Módulo 1: diagrama P-V e trabalho (área) ----------
  var m1PSlider = document.getElementById('m1-p');
  var m1DvSlider = document.getElementById('m1-dv');
  var m1PValor = document.getElementById('m1-p-valor');
  var m1DvValor = document.getElementById('m1-dv-valor');
  var m1WSpan = document.getElementById('m1-w');
  var m1Canvas = alturaFixa('m1-grafico', 360);

  var V0 = 5;
  var m1Chart = new Chart(m1Canvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [{
      data: [{ x: V0, y: 5 }, { x: V0 + 2, y: 5 }],
      borderColor: CORES_GRAFICO.marcador,
      backgroundColor: CORES_GRAFICO.curva + '40', // ~25% de opacidade
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: CORES_GRAFICO.marcador,
      fill: 'origin',
      tension: 0
    }] },
    options: chartBaseOptions('V (volume, unid. arbitrárias)', 'P (pressão, unid. arbitrárias)', {
      xScale: { type: 'linear', min: 0, max: 10 },
      yScale: { min: 0, max: 11 }
    })
  });

  function desenhaPV() {
    var P = Number(m1PSlider.value);
    var dV = Number(m1DvSlider.value);
    var V1 = V0, V2 = V0 + dV;
    var W = P * dV;

    var ds = m1Chart.data.datasets[0];
    ds.data = [{ x: V1, y: P }, { x: V2, y: P }];
    ds.backgroundColor = (dV >= 0 ? CORES_GRAFICO.curva : CORES_GRAFICO.marcador) + '40';
    m1Chart.update('none');

    m1PValor.textContent = P.toFixed(1).replace('.', ',');
    m1DvValor.textContent = (dV >= 0 ? '+' : '') + dV.toFixed(1).replace('.', ',');
    m1WSpan.textContent = W.toFixed(1).replace('.', ',').replace('-', '−');
  }

  m1PSlider.addEventListener('input', desenhaPV);
  m1DvSlider.addEventListener('input', desenhaPV);
  desenhaPV();

  // ---------- Módulo 2: C_P vs C_V (barras empilhadas) ----------
  var m2DtSlider = document.getElementById('m2-dt');
  var m2DtValor = document.getElementById('m2-dt-valor');
  var m2QvSpan = document.getElementById('m2-qv');
  var m2QpSpan = document.getElementById('m2-qp');
  var m2ExtraSpan = document.getElementById('m2-extra');
  var m2Canvas = alturaFixa('m2-grafico', 340);

  var MU_M2 = 0.6;
  var CV_M2 = 1.5 * R_GAS / MU_M2;
  var EXTRA_M2 = R_GAS / MU_M2;

  var m2Options = chartBaseOptions(null, 'calor (erg/g)');
  m2Options.plugins.legend.display = true;
  m2Options.plugins.legend.position = 'bottom';
  m2Options.plugins.legend.labels = { font: { size: 11 }, boxWidth: 12 };
  m2Options.scales.x.stacked = true;
  m2Options.scales.y.stacked = true;

  var m2Chart = new Chart(m2Canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['a υ constante (C_V)', 'a P constante (C_P)'],
      datasets: [
        { label: 'aumento de U', data: [0, 0], backgroundColor: CORES_GRAFICO.curva, borderRadius: 4 },
        { label: 'trabalho de expansão (P dV)', data: [0, 0], backgroundColor: CORES_GRAFICO.marcador, borderRadius: 4 }
      ]
    },
    options: m2Options
  });

  function desenhaCPCV() {
    var dT = Number(m2DtSlider.value);
    var qv = CV_M2 * dT;
    var extra = EXTRA_M2 * dT;
    var qp = qv + extra;

    m2Chart.data.datasets[0].data = [qv, qv];
    m2Chart.data.datasets[1].data = [0, extra];
    m2Chart.update('none');

    m2DtValor.textContent = Math.round(dT) + ' K';
    m2QvSpan.textContent = qv.toExponential(2);
    m2QpSpan.textContent = qp.toExponential(2);
    m2ExtraSpan.textContent = extra.toExponential(2);
  }

  m2DtSlider.addEventListener('input', desenhaCPCV);
  desenhaCPCV();

  // ---------- Módulo 3: alpha, delta -> fator delta^2/alpha (curva + marcador) ----------
  var m3AlphaSlider = document.getElementById('m3-alpha');
  var m3DeltaSlider = document.getElementById('m3-delta');
  var m3AlphaValor = document.getElementById('m3-alpha-valor');
  var m3DeltaValor = document.getElementById('m3-delta-valor');
  var m3FatorSpan = document.getElementById('m3-fator');
  var m3Fator2Span = document.getElementById('m3-fator2');
  var m3Canvas = alturaFixa('m3-grafico', 340);

  var m3Xs = linspace(0, 3, 151);

  var m3Chart = new Chart(m3Canvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [
      datasetCurva(m3Xs, m3Xs.map(function (d) { return d * d; }), CORES_GRAFICO.curva),
      datasetMarcador(m3Xs, 0, m3Xs.map(function (d) { return d * d; }), CORES_GRAFICO.marcador)
    ] },
    options: chartBaseOptions('δ', 'δ² / α', { xScale: { type: 'linear', min: 0, max: 3 }, yScale: { min: 0 } })
  });

  function desenhaAlphaDelta() {
    var alpha = Number(m3AlphaSlider.value);
    var delta = Number(m3DeltaSlider.value);
    var fator = (delta * delta) / alpha;

    var ys = m3Xs.map(function (d) { return (d * d) / alpha; });
    var idx = nearestIdx(m3Xs, delta);

    m3Chart.data.datasets[0].data = m3Xs.map(function (x, i) { return { x: x, y: ys[i] }; });
    var marc = m3Chart.data.datasets[1];
    marc.data = m3Xs.map(function (x, i) { return { x: x, y: i === idx ? ys[i] : null }; });
    marc.pointRadius = marc.data.map(function (p) { return p.y === null ? 0 : 6; });
    m3Chart.options.scales.y.max = Math.max(3, fator * 1.2);
    m3Chart.update('none');

    m3AlphaValor.textContent = alpha.toFixed(2).replace('.', ',');
    m3DeltaValor.textContent = delta.toFixed(2).replace('.', ',');
    m3FatorSpan.textContent = fator.toFixed(3).replace('.', ',');
    m3Fator2Span.textContent = fator.toFixed(3).replace('.', ',');
  }

  m3AlphaSlider.addEventListener('input', desenhaAlphaDelta);
  m3DeltaSlider.addEventListener('input', desenhaAlphaDelta);
  desenhaAlphaDelta();

  // ---------- Módulo 3b: decomposição de dρ/ρ (barras) ----------
  var m3bDppSlider = document.getElementById('m3b-dpp');
  var m3bDttSlider = document.getElementById('m3b-dtt');
  var m3bDppValor = document.getElementById('m3b-dpp-valor');
  var m3bDttValor = document.getElementById('m3b-dtt-valor');
  var m3bTermoP = document.getElementById('m3b-termo-p');
  var m3bTermoT = document.getElementById('m3b-termo-t');
  var m3bTotal = document.getElementById('m3b-total');
  var m3bCanvas = alturaFixa('m3b-grafico', 320);

  function formataSinal(x) {
    var s = x.toFixed(3).replace('.', ',');
    return (x >= 0 ? '+' : '') + s;
  }

  var m3bChart = new Chart(m3bCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['α·dP/P', '−δ·dT/T', 'dρ/ρ (soma)'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador, CORES_GRAFICO.extra],
        borderRadius: 4
      }]
    },
    options: chartBaseOptions(null, 'variação relativa')
  });

  function desenhaDrho() {
    var dpp = Number(m3bDppSlider.value);
    var dtt = Number(m3bDttSlider.value);
    var termoP = dpp;       // alpha = 1
    var termoT = -dtt;      // -delta * dT/T, delta = 1
    var total = termoP + termoT;

    m3bChart.data.datasets[0].data = [termoP, termoT, total];
    m3bChart.update('none');

    m3bDppValor.textContent = formataSinal(dpp);
    m3bDttValor.textContent = formataSinal(dtt);
    m3bTermoP.textContent = formataSinal(termoP);
    m3bTermoT.textContent = formataSinal(termoT);
    m3bTotal.textContent = formataSinal(total);
  }

  m3bDppSlider.addEventListener('input', desenhaDrho);
  m3bDttSlider.addEventListener('input', desenhaDrho);
  desenhaDrho();

  // ---------- Módulo 4: gás ideal, mu -> R/mu (curva + marcador + referências) ----------
  var m4MuSlider = document.getElementById('m4-mu');
  var m4MuValor = document.getElementById('m4-mu-valor');
  var m4ValorSpan = document.getElementById('m4-valor');
  var m4Canvas = alturaFixa('m4-grafico', 340);

  var m4Xs = linspace(0.4, 2, 161);
  var referenciasMu = [0.5, 0.6, 1.0]; // H ionizado, núcleo solar, H neutro

  function m4Ys() { return m4Xs.map(function (m) { return R_GAS / m; }); }

  var m4RefData = m4Xs.map(function (x, i) {
    var y = null;
    for (var k = 0; k < referenciasMu.length; k++) {
      if (i === nearestIdx(m4Xs, referenciasMu[k])) { y = R_GAS / x; break; }
    }
    return { x: x, y: y };
  });

  var m4Chart = new Chart(m4Canvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [
      datasetCurva(m4Xs, m4Ys(), CORES_GRAFICO.curva),
      { data: m4RefData, borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra,
        pointRadius: m4RefData.map(function (p) { return p.y === null ? 0 : 5; }), borderWidth: 0, showLine: false },
      datasetMarcador(m4Xs, 0, m4Ys(), CORES_GRAFICO.marcador)
    ] },
    options: chartBaseOptions('μ (peso molecular médio)', 'C_P − C_V (erg g⁻¹ K⁻¹)', { xScale: { type: 'linear', min: 0.4, max: 2 } })
  });

  function desenhaMu() {
    var mu = Number(m4MuSlider.value);
    var valor = R_GAS / mu;
    var idx = nearestIdx(m4Xs, mu);

    var marc = m4Chart.data.datasets[2];
    marc.data = m4Xs.map(function (x, i) { return { x: x, y: i === idx ? R_GAS / x : null }; });
    marc.pointRadius = marc.data.map(function (p) { return p.y === null ? 0 : 6; });
    m4Chart.update('none');

    m4MuValor.textContent = mu.toFixed(2).replace('.', ',');
    m4ValorSpan.textContent = valor.toExponential(3).replace('.', ',');
  }

  m4MuSlider.addEventListener('input', desenhaMu);
  desenhaMu();

  // ---------- Módulo 5: gamma -> nabla_ad (curva + marcador + referências) ----------
  var m5GammaSlider = document.getElementById('m5-gamma');
  var m5GammaValor = document.getElementById('m5-gamma-valor');
  var m5NablaSpan = document.getElementById('m5-nabla');
  var m5Canvas = alturaFixa('m5-grafico', 340);

  var m5Xs = linspace(1.05, 2, 191);
  var referenciasGamma = [4 / 3, 5 / 3];

  function m5Ys() { return m5Xs.map(function (g) { return (g - 1) / g; }); }

  var m5RefData = m5Xs.map(function (x, i) {
    var y = null;
    for (var k = 0; k < referenciasGamma.length; k++) {
      if (i === nearestIdx(m5Xs, referenciasGamma[k])) { y = (x - 1) / x; break; }
    }
    return { x: x, y: y };
  });

  var m5Chart = new Chart(m5Canvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [
      datasetCurva(m5Xs, m5Ys(), CORES_GRAFICO.curva),
      { data: m5RefData, borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra,
        pointRadius: m5RefData.map(function (p) { return p.y === null ? 0 : 5; }), borderWidth: 0, showLine: false },
      datasetMarcador(m5Xs, 0, m5Ys(), CORES_GRAFICO.marcador)
    ] },
    options: chartBaseOptions('γ (índice adiabático)', '∇_ad = (γ−1)/γ', { xScale: { type: 'linear', min: 1.05, max: 2 }, yScale: { min: 0, max: 0.6 } })
  });

  function desenhaGamma() {
    var gamma = Number(m5GammaSlider.value);
    var nabla = (gamma - 1) / gamma;
    var idx = nearestIdx(m5Xs, gamma);

    var marc = m5Chart.data.datasets[2];
    marc.data = m5Xs.map(function (x, i) { return { x: x, y: i === idx ? (x - 1) / x : null }; });
    marc.pointRadius = marc.data.map(function (p) { return p.y === null ? 0 : 6; });
    m5Chart.update('none');

    m5GammaValor.textContent = gamma.toFixed(3).replace('.', ',');
    m5NablaSpan.textContent = nabla.toFixed(3).replace('.', ',');
  }

  m5GammaSlider.addEventListener('input', desenhaGamma);
  desenhaGamma();

  // ---------- Módulo novo (Sessão 4): pistão adiabático vs. isotérmico ----------
  (function () {
    var gammaS = document.getElementById('mpist-gamma');
    if (!gammaS) return;
    var razaoS = document.getElementById('mpist-razao');
    var gammaV = document.getElementById('mpist-gamma-valor'), razaoV = document.getElementById('mpist-razao-valor');
    var playBtn = document.getElementById('mpist-play'), resetBtn = document.getElementById('mpist-reset');
    var adTEl = document.getElementById('mpist-ad-T'), adWEl = document.getElementById('mpist-ad-W');
    var isoWEl = document.getElementById('mpist-iso-W'), isoQEl = document.getElementById('mpist-iso-Q');

    function setupRawCanvas(id, cssHeight) {
      var canvas = document.getElementById(id);
      var dpr = window.devicePixelRatio || 1;
      var cssWidth = canvas.parentElement.clientWidth || canvas.clientWidth || 400;
      canvas.style.width = '100%'; canvas.style.height = cssHeight + 'px';
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx: ctx, w: cssWidth, h: cssHeight };
    }

    var P0 = 1, V0p = 1; // unidades arbitrárias
    var cilState = setupRawCanvas('mpist-cilindros', 260);
    var pvCtx = document.getElementById('mpist-pv').getContext('2d');
    var pvChart = null;

    function razaoFinal() { return Number(razaoS.value) / 100; }
    function gamma() { return Number(gammaS.value); }

    // P(V), T/T0(V), W(V) [trabalho realizado PELO gás, V0->V] para cada processo.
    function isoP(V) { return P0 * V0p / V; }
    function isoW(V) { return P0 * V0p * Math.log(V / V0p); }
    function adP(V, g) { return P0 * Math.pow(V0p, g) / Math.pow(V, g); }
    function adW(V, g) { var P = adP(V, g); return (P * V - P0 * V0p) / (1 - g); }
    function adTrelativa(V, g) { return (adP(V, g) * V) / (P0 * V0p); }

    function desenhaCilindros(fracV, g, Tad) {
      var ctx = cilState.ctx, w = cilState.w, h = cilState.h;
      ctx.clearRect(0, 0, w, h);
      function painel(cx, Vfrac, corPistao, rotulo) {
        var baseY = h - 20, topoY = 20, larg = 70;
        var alturaGasMax = baseY - topoY;
        var alturaGas = alturaGasMax * Vfrac;
        var pistaoY = baseY - alturaGas;
        // cilindro (contorno)
        ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - larg / 2, topoY, larg, alturaGasMax);
        // gás
        ctx.fillStyle = corPistao;
        ctx.fillRect(cx - larg / 2 + 1.5, pistaoY, larg - 3, alturaGas - 1.5);
        // pistão
        ctx.fillStyle = '#555';
        ctx.fillRect(cx - larg / 2 - 4, pistaoY - 6, larg + 8, 6);
        ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(rotulo, cx, h - 4);
      }
      var corAd = corTemperatura((Tad - 1) / 2); // 0=frio(esverdeado)..1=quente(avermelhado), mapeado por T/T0-1
      painel(w * 0.28, fracV, corAd, 'adiabático');
      painel(w * 0.72, fracV, 'rgba(29,158,117,0.35)', 'isotérmico (T fixo)');
    }
    function corTemperatura(t) {
      t = Math.max(0, Math.min(1, t));
      var r = Math.round(29 + t * (216 - 29)), g = Math.round(158 + t * (90 - 158)), b = Math.round(117 + t * (48 - 117));
      return 'rgba(' + r + ',' + g + ',' + b + ',0.45)';
    }

    function desenhaPV(g) {
      var Vmin = V0p * Math.min(razaoFinal(), 0.1);
      var Vs = linspace(Vmin, V0p, 80);
      var isoYs = Vs.map(isoP);
      var adYs = Vs.map(function (V) { return adP(V, g); });
      var datasets = [
        datasetCurva(Vs, isoYs, CORES_GRAFICO.curva),
        datasetCurva(Vs, adYs, CORES_GRAFICO.extra)
      ];
      if (pvChart) pvChart.destroy();
      pvChart = new Chart(pvCtx, {
        type: 'line',
        data: { datasets: datasets },
        options: Object.assign(
          chartBaseOptions('V/V₀', 'P/P₀', { xScale: { type: 'linear' }, yScale: { type: 'linear' } }),
          { plugins: { legend: { display: false } } }
        )
      });
    }

    function marcaPV(V, g) {
      if (!pvChart) return;
      var isoMarc = { data: [{ x: V, y: isoP(V) }], borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva, pointRadius: 6, showLine: false };
      var adMarc = { data: [{ x: V, y: adP(V, g) }], borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra, pointRadius: 6, showLine: false };
      pvChart.data.datasets = pvChart.data.datasets.slice(0, 2).concat([isoMarc, adMarc]);
      pvChart.update('none');
    }

    function atualiza(t) {
      var g = gamma();
      var rFinal = razaoFinal();
      var V = V0p * (1 - t * (1 - rFinal)); // V0 -> V0*rFinal conforme t: 0->1
      var fracV = V / V0p;
      var Tad = adTrelativa(V, g);

      desenhaCilindros(fracV, g, Tad);
      desenhaPV(g);
      marcaPV(V, g);

      var Wad = adW(V, g);
      var Wiso = isoW(V);
      var Qiso = Wiso; // isotérmico ideal: dU=0 => Q=W (convenção dU=dQ-PdV deste capítulo)

      adTEl.textContent = fmt3(Tad);
      adWEl.textContent = fmt3(Wad);
      isoWEl.textContent = fmt3(Wiso);
      isoQEl.textContent = fmt3(Qiso);
    }
    function fmt3(x) { return x.toFixed(3).replace('.', ','); }

    gammaS.addEventListener('input', function () {
      gammaV.textContent = gamma().toFixed(3).replace('.', ',');
      atualiza(0);
    });
    razaoS.addEventListener('input', function () {
      razaoV.textContent = (razaoFinal()).toFixed(2).replace('.', ',');
      atualiza(0);
    });

    createAnimController(playBtn, resetBtn, 6, function (t) { atualiza(t); }, { play: '▶ Comprimir', playing: '❚❚ Comprimindo…' });

    gammaV.textContent = gamma().toFixed(3).replace('.', ',');
    razaoV.textContent = razaoFinal().toFixed(2).replace('.', ',');
    atualiza(0);
  })();

  // Chart.js já observa o redimensionamento do container internamente
  // (responsive: true usa ResizeObserver) — diferente do Plotly, não é
  // necessário nenhum listener de 'resize' manual aqui.
})();
