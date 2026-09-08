// =====================================================================
// Módulos interativos do Capítulo 4 — Processos Radiativos
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  var SIGMA = CONST.SIGMA; // erg / (s cm^2 K^4), Stefan-Boltzmann (CGS) — ver comuns.js

  function fmt(x, casas) {
    if (!isFinite(x)) return '—';
    return x.toFixed(casas == null ? 2 : casas).replace('.', ',');
  }

  function setupRawCanvas(id, cssHeight) {
    var canvas = document.getElementById(id);
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.parentElement.clientWidth || canvas.clientWidth || 400;
    canvas.style.width = '100%';
    canvas.style.height = cssHeight + 'px';
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas: canvas, ctx: ctx, w: cssWidth, h: cssHeight };
  }

  // ================= Módulo 1: ângulo sólido e projeção cos θ =========
  var m1ThetaSlider = document.getElementById('m1-theta');
  var m1DomegaSlider = document.getElementById('m1-domega');
  var m1ThetaValor = document.getElementById('m1-theta-valor');
  var m1DomegaValor = document.getElementById('m1-domega-valor');
  var m1Projetada = document.getElementById('m1-projetada');
  var m1State = setupRawCanvas('m1-canvas', 360);

  function desenhaM1() {
    var thetaDeg = Number(m1ThetaSlider.value);
    var domegaDeg = Number(m1DomegaSlider.value);
    var theta = thetaDeg * Math.PI / 180;
    var domega = domegaDeg * Math.PI / 180;
    var ctx = m1State.ctx, w = m1State.w, h = m1State.h;
    ctx.clearRect(0, 0, w, h);

    var cx = w * 0.5, cy = h * 0.74;
    var L = Math.min(w, h) * 0.30;
    var H = h * 0.56;
    var bx = Math.sin(theta), by = Math.cos(theta); // direção de propagação do feixe
    var px = Math.cos(theta), py = -Math.sin(theta); // perpendicular ao feixe

    // elemento de área dA (segmento horizontal fixo)
    ctx.strokeStyle = CORES_GRAFICO.curva;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - L, cy); ctx.lineTo(cx + L, cy); ctx.stroke();
    ctx.fillStyle = CORES_GRAFICO.curva;
    ctx.font = '13px -apple-system, sans-serif';
    ctx.fillText('dA', cx - L - 8, cy + 5);

    // normal tracejada
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - H); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#666';
    ctx.fillText('n̂ (normal)', cx + 6, cy - H + 4);

    // feixe paralelo (3 raios) atingindo dA
    ctx.strokeStyle = CORES_GRAFICO.marcador;
    ctx.lineWidth = 2;
    var offsets = [-0.7, 0, 0.7];
    var topx = 0, topy = 0;
    for (var i = 0; i < offsets.length; i++) {
      var x0 = cx + offsets[i] * L;
      var sx = x0 - bx * H, sy = cy - by * H;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x0, cy); ctx.stroke();
      // seta simples na chegada
      var ang = Math.atan2(cy - sy, x0 - sx);
      ctx.beginPath();
      ctx.moveTo(x0, cy);
      ctx.lineTo(x0 - 7 * Math.cos(ang - 0.4), cy - 7 * Math.sin(ang - 0.4));
      ctx.lineTo(x0 - 7 * Math.cos(ang + 0.4), cy - 7 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fillStyle = CORES_GRAFICO.marcador; ctx.fill();
      if (i === 1) { topx = sx; topy = sy; }
    }
    ctx.fillStyle = CORES_GRAFICO.marcador;
    ctx.fillText('I_ν', topx + 8, topy + 14);

    // indicador angular de Δω (ilustrativo) perto da origem do raio central
    var r = 18;
    ctx.strokeStyle = CORES_GRAFICO.extra;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(topx + Math.sin(theta - domega / 2) * r, topy + Math.cos(theta - domega / 2) * r);
    ctx.lineTo(topx, topy);
    ctx.lineTo(topx + Math.sin(theta + domega / 2) * r, topy + Math.cos(theta + domega / 2) * r);
    ctx.stroke();
    ctx.fillStyle = CORES_GRAFICO.extra;
    ctx.fillText('Δω', topx - 28, topy - 4);

    // arco do ângulo θ entre a normal e o raio central
    ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, -Math.PI / 2, -Math.PI / 2 + theta);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.fillText('θ', cx + 32 * Math.sin(theta / 2), cy - 32 * Math.cos(theta / 2));

    // segmento projetado (dA cos θ), deslocado ao longo de -b
    var gap = H * 0.42;
    var c2x = cx - bx * gap, c2y = cy - by * gap;
    var half = L * Math.cos(theta);
    ctx.strokeStyle = CORES_GRAFICO.marcador;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(c2x - px * half, c2y - py * half);
    ctx.lineTo(c2x + px * half, c2y + py * half);
    ctx.stroke();
    ctx.fillStyle = CORES_GRAFICO.marcador;
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.fillText('dA·cos θ', c2x + px * half + 6, c2y + py * half);

    m1ThetaValor.textContent = thetaDeg.toFixed(0) + '°';
    m1DomegaValor.textContent = domegaDeg.toFixed(0) + '°';
    m1Projetada.textContent = Math.cos(theta).toFixed(3).replace('.', ',');
  }

  m1ThetaSlider.addEventListener('input', desenhaM1);
  m1DomegaSlider.addEventListener('input', desenhaM1);
  window.addEventListener('resize', function () {
    m1State = setupRawCanvas('m1-canvas', 360);
    desenhaM1();
  });
  desenhaM1();

  // ================= Módulo 2: geometria plano-paralela ===============
  var m2RatioSlider = document.getElementById('m2-ratio');
  var m2RatioValor = document.getElementById('m2-ratio-valor');
  var m2RatioTexto = document.getElementById('m2-ratio-texto');
  var m2Sagita = document.getElementById('m2-sagita');
  var m2Preset = document.getElementById('m2-preset-sol');
  var m2Svg = document.getElementById('m2-svg');

  var M2_LOGMIN = -4, M2_LOGMAX = 0; // ratio de 1e-4 a 1
  var M2_RATIO_SOLAR = 300 / 700000; // ≈ 4,3e-4

  function fmtCientifico(x) {
    if (x <= 0 || !isFinite(x)) return '0';
    var exp = Math.floor(Math.log10(x));
    var mant = x / Math.pow(10, exp);
    var expStr = String(exp).split('').map(function (c) {
      var map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
      return map[c] || c;
    }).join('');
    return mant.toFixed(1).replace('.', ',') + '×10' + expStr;
  }

  function desenhaM2() {
    var t = Number(m2RatioSlider.value) / 1000;
    var ratio = logSlider(t, M2_LOGMIN, M2_LOGMAX);
    ratio = Math.min(1, Math.max(1e-4, ratio));

    var Rs = 85;
    var tPx = Math.max(3, Math.min(Rs * 0.9, ratio * Rs * 6)); // exagero visual, com piso de legibilidade
    var outer = Rs + tPx;

    // curvatura ilustrada (exagerada) no painel direito
    var curvaturaVisual = Math.min(80, 220 * Math.pow(ratio, 0.3));
    var sagitaReal = ratio / 8;

    var svgNs = 'http://www.w3.org/2000/svg';
    var partes = [];
    partes.push('<circle cx="130" cy="150" r="' + Rs + '" fill="#f0ede2" stroke="#bbb" stroke-width="1"/>');
    partes.push('<circle cx="130" cy="150" r="' + (Rs + tPx / 2) + '" fill="none" stroke="#1D9E75" stroke-width="' + tPx + '" opacity="0.55"/>');
    partes.push('<text x="130" y="154" text-anchor="middle" font-size="12" fill="#555" font-family="-apple-system,sans-serif">interior</text>');
    partes.push('<text x="130" y="' + (150 - outer - 8) + '" text-anchor="middle" font-size="11" fill="#17805f" font-family="-apple-system,sans-serif">atmosfera</text>');

    // painel direito: zoom com camadas planas
    var rx = 300, ry = 40, rw = 230, rh = 220;
    partes.push('<rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" fill="#fff" stroke="#ccc"/>');
    for (var i = 1; i <= 5; i++) {
      var ly = ry + (rh * i) / 6;
      partes.push('<line x1="' + rx + '" y1="' + ly + '" x2="' + (rx + rw) + '" y2="' + ly + '" stroke="#ddd8cc" stroke-width="1.5"/>');
    }
    // referência plana (topo, tracejada) vs curvatura real (exagerada)
    var flatY = ry + 18;
    partes.push('<line x1="' + rx + '" y1="' + flatY + '" x2="' + (rx + rw) + '" y2="' + flatY + '" stroke="#999" stroke-width="1" stroke-dasharray="4,3"/>');
    var midX = rx + rw / 2;
    var curveY = flatY + curvaturaVisual;
    partes.push('<path d="M ' + rx + ' ' + flatY + ' Q ' + midX + ' ' + curveY + ' ' + (rx + rw) + ' ' + flatY + '" fill="none" stroke="#D85A30" stroke-width="2.5"/>');
    partes.push('<text x="' + (rx + rw / 2) + '" y="' + (ry + rh + 22) + '" text-anchor="middle" font-size="11" fill="#555" font-family="-apple-system,sans-serif">zoom da atmosfera — camadas planas (aprox. PP) vs. curvatura real (exagerada)</text>');

    m2Svg.setAttribute('viewBox', '0 0 560 300');
    m2Svg.innerHTML = partes.join('');

    m2RatioValor.textContent = fmtCientifico(ratio);
    m2RatioTexto.textContent = fmtCientifico(ratio);
    m2Sagita.textContent = fmtCientifico(sagitaReal);
  }

  m2RatioSlider.addEventListener('input', desenhaM2);
  m2Preset.addEventListener('click', function () {
    var t = invLogSlider(M2_RATIO_SOLAR, M2_LOGMIN, M2_LOGMAX);
    m2RatioSlider.value = Math.round(t * 1000);
    desenhaM2();
  });
  window.addEventListener('resize', desenhaM2);
  desenhaM2();

  // ================= Módulo 3: momentos J, H, K =========================
  var m3ASlider = document.getElementById('m3-a');
  var m3AValor = document.getElementById('m3-a-valor');
  var m3J = document.getElementById('m3-J');
  var m3H = document.getElementById('m3-H');
  var m3K = document.getElementById('m3-K');
  var m3Canvas = document.getElementById('m3-grafico');

  var m3Mus = linspace(-1, 1, 81);
  var I0_M3 = 1;

  var m3Chart = new Chart(m3Canvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [datasetCurva(m3Mus, m3Mus.map(function (mu) { return I0_M3; }), CORES_GRAFICO.curva)] },
    options: chartBaseOptions('μ = cos θ', 'I_ν(μ)', { xScale: { type: 'linear', min: -1, max: 1 }, yScale: { min: 0, max: 2.2 } })
  });

  function desenhaM3() {
    var a = Number(m3ASlider.value);
    var ys = m3Mus.map(function (mu) { return I0_M3 * (1 + a * mu); });
    m3Chart.data.datasets[0].data = m3Mus.map(function (mu, i) { return { x: mu, y: ys[i] }; });
    m3Chart.update('none');

    var J = I0_M3;
    var H = I0_M3 * a / 3;
    var K = I0_M3 / 3;

    m3AValor.textContent = fmt(a, 2);
    m3J.textContent = fmt(J, 3);
    m3H.textContent = fmt(H, 3);
    m3K.textContent = fmt(K, 3);
  }

  m3ASlider.addEventListener('input', desenhaM3);
  desenhaM3();

  // ================= Módulo 4: as quatro soluções ========================
  var m4Radios = document.getElementsByName('m4-caso');
  var m4I0Slider = document.getElementById('m4-I0');
  var m4MuSlider = document.getElementById('m4-mu');
  var m4S0Slider = document.getElementById('m4-S0');
  var m4I0Valor = document.getElementById('m4-I0-valor');
  var m4MuValor = document.getElementById('m4-mu-valor');
  var m4S0Valor = document.getElementById('m4-S0-valor');
  var m4Legenda = document.getElementById('m4-legenda');
  var m4Canvas = document.getElementById('m4-grafico');

  var m4Xs = linspace(0, 8, 161);

  var m4Chart = new Chart(m4Canvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [datasetCurva(m4Xs, m4Xs.map(function () { return 1; }), CORES_GRAFICO.curva)] },
    options: chartBaseOptions('τ (ou percurso s, se χ_ν=0)', 'I_ν', { xScale: { type: 'linear', min: 0, max: 8 }, yScale: { min: 0 } })
  });

  var M4_LEGENDAS = {
    '1': 'Caso 1 (vácuo): χ_ν=η_ν=0, logo I_ν≡constante — nenhuma atenuação nem ganho, mesmo a grandes distâncias (é o fluxo que cai com 1/r², não a intensidade específica).',
    '2': 'Caso 2 (só emissão, χ_ν=0): I_ν(x)=I_ν(0)+(η_ν/μ)·x — o feixe ganha energia ao atravessar o meio (nebulosas planetárias, regiões HII). Aqui o slider "S₀" desempenha o papel de η_ν/μ (taxa de ganho por unidade de percurso).',
    '3': 'Caso 3 (só absorção, η_ν=0): I_ν(τ)=I_ν(0)·e^{−τ/μ} — atenuação pura, sem função fonte. Em τ=μ, o feixe caiu por um fator 1/e.',
    '4': 'Caso 4 (geral): com S_ν=S₀ constante, I_ν(τ)=I_ν(0)e^{−τ/μ}+S₀(1−e^{−τ/μ}) — a intensidade decai (ou cresce) exponencialmente até saturar exatamente na função fonte S₀, recuperando o Caso 3 quando S₀=0.'
  };
  var M4_NOTA = ' <strong>Nota sobre o eixo</strong>: nos Casos 1 e 2, χ_ν=0 e a profundidade ótica não está definida (τ≡0 sempre); o eixo horizontal representa, nesses dois casos, o percurso s ao longo do feixe, não uma verdadeira profundidade ótica — a mesma distinção feita no texto original.';

  function casoAtual() {
    for (var i = 0; i < m4Radios.length; i++) if (m4Radios[i].checked) return m4Radios[i].value;
    return '1';
  }

  function desenhaM4() {
    var caso = casoAtual();
    var I0 = Number(m4I0Slider.value);
    var mu = Math.max(0.02, Number(m4MuSlider.value));
    var S0 = Number(m4S0Slider.value);
    var ys;
    if (caso === '1') {
      ys = m4Xs.map(function () { return I0; });
    } else if (caso === '2') {
      ys = m4Xs.map(function (x) { return I0 + S0 * x; });
    } else if (caso === '3') {
      ys = m4Xs.map(function (x) { return I0 * Math.exp(-x / mu); });
    } else {
      ys = m4Xs.map(function (x) { return I0 * Math.exp(-x / mu) + S0 * (1 - Math.exp(-x / mu)); });
    }
    m4Chart.data.datasets[0].data = m4Xs.map(function (x, i) { return { x: x, y: ys[i] }; });
    var maxY = Math.max.apply(null, ys.filter(isFinite));
    m4Chart.options.scales.y.max = Math.max(1, maxY * 1.15);
    m4Chart.update('none');

    m4I0Valor.textContent = fmt(I0, 2);
    m4MuValor.textContent = fmt(mu, 2);
    m4S0Valor.textContent = fmt(S0, 2);
    m4Legenda.innerHTML = M4_LEGENDAS[caso] + M4_NOTA;
  }

  for (var ri = 0; ri < m4Radios.length; ri++) m4Radios[ri].addEventListener('change', desenhaM4);
  m4I0Slider.addEventListener('input', desenhaM4);
  m4MuSlider.addEventListener('input', desenhaM4);
  m4S0Slider.addEventListener('input', desenhaM4);
  desenhaM4();

  // ================= Módulo 5: τ fino vs. espesso =========================
  var m5TauSlider = document.getElementById('m5-tau');
  var m5MuSlider = document.getElementById('m5-mu');
  var m5TauValor = document.getElementById('m5-tau-valor');
  var m5MuValor = document.getElementById('m5-mu-valor');
  var m5Atenuacao = document.getElementById('m5-atenuacao');
  var m5Classificacao = document.getElementById('m5-classificacao');
  var m5Camada = document.getElementById('m5-camada');
  var m5Canvas = document.getElementById('m5-grafico');

  var M5_LOGMIN = -3, M5_LOGMAX = 3;
  var m5TauLog = (function () {
    var arr = [];
    for (var i = 0; i < 121; i++) arr.push(logSlider(i / 120, M5_LOGMIN, M5_LOGMAX));
    return arr;
  })();

  var m5Chart = new Chart(m5Canvas.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        datasetCurva(m5TauLog, m5TauLog.map(function () { return 1; }), CORES_GRAFICO.curva),
        {
          data: [{ x: 1, y: 0 }, { x: 1, y: 1 }],
          borderColor: '#999', borderWidth: 1.5, borderDash: [5, 4],
          pointRadius: 0, fill: false, showLine: true
        }
      ]
    },
    options: chartBaseOptions('τ (escala log)', 'e^(−τ/μ)', {
      xScale: { type: 'logarithmic', min: Math.pow(10, M5_LOGMIN), max: Math.pow(10, M5_LOGMAX) },
      yScale: { min: 0, max: 1 }
    })
  });

  function desenhaM5() {
    var t = Number(m5TauSlider.value) / 1000;
    var tau = logSlider(t, M5_LOGMIN, M5_LOGMAX);
    var mu = Math.max(0.02, Number(m5MuSlider.value));
    var ys = m5TauLog.map(function (x) { return Math.exp(-x / mu); });
    m5Chart.data.datasets[0].data = m5TauLog.map(function (x, i) { return { x: x, y: ys[i] }; });
    m5Chart.update('none');

    var atenuacao = Math.exp(-tau / mu);
    m5TauValor.textContent = fmtCientifico(tau);
    m5MuValor.textContent = fmt(mu, 2);
    m5Atenuacao.textContent = fmt(atenuacao, 4);

    var alpha = Math.min(1, 1 - Math.exp(-tau));
    m5Camada.style.background = 'rgba(29,158,117,' + alpha.toFixed(3) + ')';

    var classe;
    if (tau < 0.05) classe = 'opticamente <strong>muito fino</strong> (τ≪1): radiação viaja quase livremente';
    else if (tau < 0.9) classe = 'opticamente <strong>fino</strong> (τ&lt;1)';
    else if (tau < 1.2) classe = '<strong>τ≈1</strong>: a fronteira convencional entre fino e espesso';
    else if (tau < 20) classe = 'opticamente <strong>espesso</strong> (τ&gt;1)';
    else classe = 'opticamente <strong>muito espesso</strong> (τ≫1): praticamente opaco';
    m5Classificacao.innerHTML = classe;
  }

  m5TauSlider.addEventListener('input', desenhaM5);
  m5MuSlider.addEventListener('input', desenhaM5);
  desenhaM5();

  // ================= Módulo 6: Eddington-Barbier e limb darkening ========
  var m6ASlider = document.getElementById('m6-a');
  var m6BSlider = document.getElementById('m6-b');
  var m6AValor = document.getElementById('m6-a-valor');
  var m6BValor = document.getElementById('m6-b-valor');
  var m6Preset = document.getElementById('m6-preset');
  var m6Centro = document.getElementById('m6-centro');
  var m6Limbo = document.getElementById('m6-limbo');
  var m6Razao = document.getElementById('m6-razao');
  var m6CurvaCanvas = document.getElementById('m6-curva');
  var m6DiscoState = setupRawCanvas('m6-disco', 280);

  var m6Mus = linspace(0, 1, 41);
  var m6Chart = new Chart(m6CurvaCanvas.getContext('2d'), {
    type: 'line',
    data: { datasets: [datasetCurva(m6Mus, m6Mus.map(function () { return 1; }), CORES_GRAFICO.curva)] },
    options: chartBaseOptions('μ = cos θ (0 = limbo, 1 = centro)', 'I(0,μ) = a + bμ', { xScale: { type: 'linear', min: 0, max: 1 }, yScale: { min: 0 } })
  });

  function desenhaM6Disco(a, b) {
    var ctx = m6DiscoState.ctx, w = m6DiscoState.w, h = m6DiscoState.h;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    var R = Math.min(w, h) / 2 - 6;
    var denom = Math.max(a + b, 1e-6);
    for (var r = R; r >= 0; r -= 1) {
      var mu = Math.sqrt(Math.max(0, 1 - (r * r) / (R * R)));
      var I = a + b * mu;
      var norm = Math.max(0, Math.min(1, I / denom));
      var g = Math.round(255 * norm);
      ctx.strokeStyle = 'rgb(' + g + ',' + g + ',' + g + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
  }

  function desenhaM6() {
    var a = Number(m6ASlider.value);
    var b = Number(m6BSlider.value);
    var ys = m6Mus.map(function (mu) { return a + b * mu; });
    m6Chart.data.datasets[0].data = m6Mus.map(function (mu, i) { return { x: mu, y: ys[i] }; });
    m6Chart.options.scales.y.max = Math.max(1, (a + b) * 1.15);
    m6Chart.update('none');
    desenhaM6Disco(a, b);

    m6AValor.textContent = fmt(a, 2);
    m6BValor.textContent = fmt(b, 2);
    m6Centro.textContent = fmt(a + b, 3);
    m6Limbo.textContent = fmt(a, 3);
    m6Razao.textContent = fmt(a / Math.max(a + b, 1e-6), 3);
  }

  m6ASlider.addEventListener('input', desenhaM6);
  m6BSlider.addEventListener('input', desenhaM6);
  m6Preset.addEventListener('click', function () {
    m6ASlider.value = 0.44;
    m6BSlider.value = 0.56;
    desenhaM6();
  });
  window.addEventListener('resize', function () {
    m6DiscoState = setupRawCanvas('m6-disco', 280);
    desenhaM6();
  });
  desenhaM6();

  // ================= Módulo 7: random walk radiativo ======================
  var m7LSlider = document.getElementById('m7-l');
  var m7LValor = document.getElementById('m7-l-valor');
  var m7Play = document.getElementById('m7-play');
  var m7Reset = document.getElementById('m7-reset');
  var m7Passos = document.getElementById('m7-passos');
  var m7Nesp = document.getElementById('m7-nesp');
  var m7State = setupRawCanvas('m7-canvas', 340);

  var m7R = Math.min(m7State.w, m7State.h) * 0.42;
  var m7Pos = { x: 0, y: 0 };
  var m7Passo = 0;
  var m7Rodando = false;
  var m7Escapou = false;
  var m7FrameCount = 0;
  var m7RafId = null;
  var m7Visivel = true;

  function m7Centro() { return { x: m7State.w / 2, y: m7State.h / 2 }; }

  function desenhaM7Base() {
    var ctx = m7State.ctx, w = m7State.w, h = m7State.h;
    ctx.clearRect(0, 0, w, h);
    var c = m7Centro();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(c.x, c.y, m7R, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('interior estelar (raio R)', c.x - 55, c.y - m7R - 8);
    ctx.fillStyle = CORES_GRAFICO.marcador;
    ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, 2 * Math.PI); ctx.fill();
  }

  function m7Reiniciar() {
    m7Rodando = false;
    m7RafId && cancelAnimationFrame(m7RafId);
    m7Play.textContent = '▶ Iniciar';
    var c = m7Centro();
    m7Pos = { x: c.x, y: c.y };
    m7Passo = 0;
    m7Escapou = false;
    desenhaM7Base();
    m7Passos.textContent = '0';
    atualizaM7Nesp();
  }

  function atualizaM7Nesp() {
    var l = Number(m7LSlider.value);
    m7LValor.textContent = l;
    var n = Math.round(Math.pow(m7R / l, 2));
    m7Nesp.textContent = n;
  }

  function m7Passar() {
    if (m7Escapou) { m7Rodando = false; m7Play.textContent = '▶ Iniciar'; return; }
    var l = Number(m7LSlider.value);
    var ang = Math.random() * 2 * Math.PI;
    var novo = { x: m7Pos.x + l * Math.cos(ang), y: m7Pos.y + l * Math.sin(ang) };
    var ctx = m7State.ctx;
    ctx.strokeStyle = CORES_GRAFICO.extra;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(m7Pos.x, m7Pos.y); ctx.lineTo(novo.x, novo.y); ctx.stroke();
    m7Pos = novo;
    m7Passo++;
    m7Passos.textContent = m7Passo;

    var c = m7Centro();
    var dist = Math.hypot(m7Pos.x - c.x, m7Pos.y - c.y);
    if (dist >= m7R || m7Passo > 20000) {
      m7Escapou = true;
      ctx.fillStyle = CORES_GRAFICO.marcador;
      ctx.beginPath(); ctx.arc(m7Pos.x, m7Pos.y, 4, 0, 2 * Math.PI); ctx.fill();
    }
  }

  function m7Loop() {
    if (!m7Rodando) return;
    m7FrameCount++;
    if (m7Visivel && m7FrameCount % 2 === 0) m7Passar();
    if (!m7Escapou) { m7RafId = requestAnimationFrame(m7Loop); }
    else { m7Rodando = false; m7Play.textContent = '▶ Iniciar'; }
  }

  m7LSlider.addEventListener('input', atualizaM7Nesp);
  m7Reset.addEventListener('click', m7Reiniciar);
  m7Play.addEventListener('click', function () {
    if (m7Escapou) m7Reiniciar();
    m7Rodando = !m7Rodando;
    m7Play.textContent = m7Rodando ? '⏸ Pausar' : '▶ Continuar';
    if (m7Rodando) m7RafId = requestAnimationFrame(m7Loop);
  });

  if ('IntersectionObserver' in window) {
    var m7Observer = new IntersectionObserver(function (entries) {
      m7Visivel = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    m7Observer.observe(m7State.canvas);
  }

  window.addEventListener('resize', function () {
    m7State = setupRawCanvas('m7-canvas', 340);
    m7R = Math.min(m7State.w, m7State.h) * 0.42;
    m7Reiniciar();
  });

  m7Reiniciar();

  // ================= Módulo 8: fluxo de Rosseland =========================
  var m8TSlider = document.getElementById('m8-T');
  var m8KappaSlider = document.getElementById('m8-kappa');
  var m8RhoSlider = document.getElementById('m8-rho');
  var m8GradSlider = document.getElementById('m8-grad');
  var m8TValor = document.getElementById('m8-T-valor');
  var m8KappaValor = document.getElementById('m8-kappa-valor');
  var m8RhoValor = document.getElementById('m8-rho-valor');
  var m8GradValor = document.getElementById('m8-grad-valor');
  var m8FSpan = document.getElementById('m8-F');
  var m8Canvas = document.getElementById('m8-grafico');

  var M8_T_LOGMIN = 6, M8_T_LOGMAX = 8; // 1e6 a 1e8 K
  var M8_G_LOGMIN = -6, M8_G_LOGMAX = 0; // 1e-6 a 1 K/cm
  var m8Ts = (function () {
    var arr = [];
    for (var i = 0; i < 101; i++) arr.push(logSlider(i / 100, M8_T_LOGMIN, M8_T_LOGMAX));
    return arr;
  })();

  function rosseland(T, kappa, rho, grad) {
    return (16 * SIGMA * Math.pow(T, 3) / (3 * Math.max(kappa, 1e-6) * Math.max(rho, 1e-6))) * grad;
  }

  var m8Chart = new Chart(m8Canvas.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        datasetCurva(m8Ts, m8Ts.map(function () { return 1; }), CORES_GRAFICO.curva),
        datasetMarcador(m8Ts, 0, m8Ts.map(function () { return 1; }), CORES_GRAFICO.marcador)
      ]
    },
    options: chartBaseOptions('T (K, escala log)', 'F (erg s⁻¹ cm⁻², escala log)', {
      xScale: { type: 'logarithmic', min: Math.pow(10, M8_T_LOGMIN), max: Math.pow(10, M8_T_LOGMAX) },
      yScale: { type: 'logarithmic' }
    })
  });

  function desenhaM8() {
    var t = Number(m8TSlider.value) / 1000;
    var T = logSlider(t, M8_T_LOGMIN, M8_T_LOGMAX);
    var kappa = Number(m8KappaSlider.value);
    var rho = Number(m8RhoSlider.value);
    var tg = Number(m8GradSlider.value) / 600;
    var grad = logSlider(tg, M8_G_LOGMIN, M8_G_LOGMAX);

    var ys = m8Ts.map(function (Ti) { return rosseland(Ti, kappa, rho, grad); });
    m8Chart.data.datasets[0].data = m8Ts.map(function (Ti, i) { return { x: Ti, y: ys[i] }; });
    var idx = nearestIdx(m8Ts, T);
    var Fatual = rosseland(T, kappa, rho, grad);
    var marc = m8Chart.data.datasets[1];
    marc.data = m8Ts.map(function (Ti, i) { return { x: Ti, y: i === idx ? ys[i] : null }; });
    marc.pointRadius = marc.data.map(function (p) { return p.y === null ? 0 : 6; });
    m8Chart.update('none');

    m8TValor.textContent = fmtCientifico(T) + ' K';
    m8KappaValor.textContent = fmt(kappa, 2);
    m8RhoValor.textContent = fmt(rho, 2);
    m8GradValor.textContent = fmtCientifico(grad);
    m8FSpan.textContent = Fatual.toExponential(3).replace('.', ',').replace('e', '×10^').replace('+', '');
  }

  m8TSlider.addEventListener('input', desenhaM8);
  m8KappaSlider.addEventListener('input', desenhaM8);
  m8RhoSlider.addEventListener('input', desenhaM8);
  m8GradSlider.addEventListener('input', desenhaM8);
  desenhaM8();

  // ================= Módulo 9: luminosidade de Eddington ==================
  var m9MSlider = document.getElementById('m9-M');
  var m9MValor = document.getElementById('m9-M-valor');
  var m9LSpan = document.getElementById('m9-L');
  var m9MTexto = document.getElementById('m9-Mtexto');
  var m9Canvas = document.getElementById('m9-grafico');

  var ALPHA_EDD = 3.3e4;
  var M9_LOGMIN = -1, M9_LOGMAX = 7; // 0,1 a 1e7 Msol
  var m9Ms = (function () {
    var arr = [];
    for (var i = 0; i < 101; i++) arr.push(logSlider(i / 100, M9_LOGMIN, M9_LOGMAX));
    return arr;
  })();

  var M_ETACAR = 100, M_ULX = 1.4, L_ULX_FATOR = 100;

  var m9Chart = new Chart(m9Canvas.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        datasetCurva(m9Ms, m9Ms.map(function (M) { return ALPHA_EDD * M; }), CORES_GRAFICO.curva),
        datasetMarcador(m9Ms, 0, m9Ms.map(function (M) { return ALPHA_EDD * M; }), CORES_GRAFICO.marcador),
        {
          data: [
            { x: M_ETACAR, y: ALPHA_EDD * M_ETACAR },
            { x: M_ULX, y: ALPHA_EDD * M_ULX },
            { x: M_ULX, y: ALPHA_EDD * M_ULX * L_ULX_FATOR }
          ],
          borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra,
          pointRadius: 6, borderWidth: 0, showLine: false
        }
      ]
    },
    options: chartBaseOptions('M / M_☉ (escala log)', 'L_Edd / L_☉ (escala log)', {
      xScale: { type: 'logarithmic', min: Math.pow(10, M9_LOGMIN), max: Math.pow(10, M9_LOGMAX) },
      yScale: { type: 'logarithmic' }
    })
  });

  function desenhaM9() {
    var t = Number(m9MSlider.value) / 1000;
    var M = logSlider(t, M9_LOGMIN, M9_LOGMAX);
    var L = ALPHA_EDD * M;
    var idx = nearestIdx(m9Ms, M);
    var marc = m9Chart.data.datasets[1];
    marc.data = m9Ms.map(function (Mi, i) { return { x: Mi, y: i === idx ? ALPHA_EDD * Mi : null }; });
    marc.pointRadius = marc.data.map(function (p) { return p.y === null ? 0 : 6; });
    m9Chart.update('none');

    m9MValor.textContent = fmtCientifico(M);
    m9MTexto.textContent = fmtCientifico(M);
    m9LSpan.textContent = fmtCientifico(L);
  }

  m9MSlider.addEventListener('input', desenhaM9);
  desenhaM9();

})();
