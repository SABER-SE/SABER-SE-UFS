// =====================================================================
// Módulos interativos do Capítulo 5 — Equações de Estrutura Estelar
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  // ---------------- Constantes físicas (CGS) — ver comuns.js (CONST) ----------------
  var G = CONST.G;
  var MSUN = CONST.MSUN;
  var RSUN = CONST.RSUN;
  var LSUN = CONST.LSUN;
  var C = CONST.C; // era 2.998e10 (4 alg.) antes da centralização — agora usa o valor exato, consistente com os demais capítulos
  var A_RAD = CONST.A_RAD; // constante de radiação, erg/(cm^3 K^4)
  var K_B = CONST.KB;
  var M_H = CONST.MH;
  var PHI_PP = 0.007;

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
  function setupSVGViewBox(id, w, h) {
    var svg = document.getElementById(id);
    if (!svg) return null;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    return svg;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // Perfil de densidade politrópico ilustrativo, usado nos módulos 1,2,4,5,7:
  // rho(x) = rhoc*(1-x^2), x=r/R. Normalizado para reproduzir M dada M,R.
  function rhoc_de(M, R) { return 15 * M / (8 * Math.PI * Math.pow(R, 3)); }
  function rho_perfil(x, rhoc) { return rhoc * (1 - x * x); }
  function massaFracao(x) { return 2.5 * Math.pow(x, 3) - 1.5 * Math.pow(x, 5); } // m(x)/M
  function m_de(x, M) { return massaFracao(Math.min(x, 1)) * M; }

  // ================= Módulo 1: casca esférica =================
  (function () {
    var rSlider = document.getElementById('m1-r'), drSlider = document.getElementById('m1-dr');
    var rValor = document.getElementById('m1-r-valor'), drValor = document.getElementById('m1-dr-valor');
    var massaEl = document.getElementById('m1-massa'), dmEl = document.getElementById('m1-dm');
    if (!rSlider) return;
    function desenha() {
      var x = rSlider.value / 100, dx = drSlider.value / 100;
      rValor.textContent = fmt(x, 2);
      drValor.textContent = fmt(dx, 2);
      var svg = setupSVGViewBox('m1-svg', 400, 320);
      var cx = 200, cy = 160, Rpx = 130;
      svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: Rpx, fill: 'none', stroke: '#999', 'stroke-width': 1.5, 'stroke-dasharray': '4,4' }));
      var r1 = Math.max(2, x * Rpx), r2 = Math.min(Rpx, (x + dx) * Rpx);
      svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r2, fill: CORES_GRAFICO.marcador, 'fill-opacity': 0.18, stroke: CORES_GRAFICO.marcador, 'stroke-width': 2 }));
      svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r1, fill: '#fff', stroke: CORES_GRAFICO.curva, 'stroke-width': 2 }));
      svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: 3, fill: '#333' }));
      var t1 = svgEl('text', { x: cx + r1 * 0.5, y: cy - 6, 'font-size': 13, fill: CORES_GRAFICO.curva }); t1.textContent = 'm (r)'; svg.appendChild(t1);
      var t2 = svgEl('text', { x: cx + r2 * 0.62, y: cy + r2 * 0.62, 'font-size': 13, fill: CORES_GRAFICO.marcador }); t2.textContent = 'm+dm (r+dr)'; svg.appendChild(t2);
      var xf = massaFracao(x), xf2 = massaFracao(Math.min(1, x + dx));
      massaEl.textContent = fmt(xf, 4);
      dmEl.textContent = fmt(xf2 - xf, 4);
    }
    rSlider.addEventListener('input', desenha); drSlider.addEventListener('input', desenha);
    window.addEventListener('resize', desenha);
    desenha();
  })();

  // ================= Módulo 2: aplicação dm/dr =================
  (function () {
    var Ms = document.getElementById('m2-M'), Rs = document.getElementById('m2-R'), rs = document.getElementById('m2-r');
    if (!Ms) return;
    var MV = document.getElementById('m2-M-valor'), RV = document.getElementById('m2-R-valor'), rV = document.getElementById('m2-r-valor');
    var rTexto = document.getElementById('m2-r-texto'), dmdrEl = document.getElementById('m2-dmdr'), macumEl = document.getElementById('m2-macum'), macumGEl = document.getElementById('m2-macum-g');
    var chart = null;
    function desenha() {
      var M = (Ms.value / 100) * MSUN, R = (Rs.value / 100) * RSUN, x = rs.value / 100;
      MV.textContent = fmt(Ms.value / 100, 2); RV.textContent = fmt(Rs.value / 100, 2); rV.textContent = fmt(x, 2);
      var rhoc = rhoc_de(M, R);
      var xs = linspace(0.01, 1, 80);
      var ys = xs.map(function (xx) { var r = xx * R; return 4 * Math.PI * r * r * rho_perfil(xx, rhoc); });
      var idx = nearestIdx(xs, x);
      var ctx = document.getElementById('m2-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [datasetCurva(xs, ys), datasetMarcador(xs, idx, ys)] },
        options: chartBaseOptions('r/R⋆', 'dm/dr (g/cm)', { xScale: { type: 'linear' } })
      });
      rTexto.textContent = fmt(x, 2);
      dmdrEl.textContent = fmtExp(ys[idx], 2);
      var frac = massaFracao(x);
      macumEl.textContent = fmt(frac, 3);
      macumGEl.textContent = fmtExp(frac * M, 2);
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); rs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 3: massa de Jeans =================
  (function () {
    var Ts = document.getElementById('m3-T'), ns = document.getElementById('m3-n'), mus = document.getElementById('m3-mu');
    if (!Ts) return;
    var TV = document.getElementById('m3-T-valor'), nV = document.getElementById('m3-n-valor'), muV = document.getElementById('m3-mu-valor');
    var Ttxt = document.getElementById('m3-T-texto'), ntxt = document.getElementById('m3-n-texto'), mutxt = document.getElementById('m3-mu-texto'), MJel = document.getElementById('m3-MJ');
    var chart = null;
    Ts.value = 10;
    function MJ(T, n, mu) {
      var rho = n * mu * M_H;
      return Math.pow(5 * K_B * T / (G * mu * M_H), 1.5) * Math.pow(3 / (4 * Math.PI * clampMin(rho)), 0.5);
    }
    function desenha() {
      var T = clampMin(Number(Ts.value), 0.1), logn = ns.value / 10, mu = mus.value / 100;
      TV.textContent = fmt(T, 0); nV.textContent = fmt(logn, 1); muV.textContent = fmt(mu, 2);
      var n = Math.pow(10, logn);
      var lognArr = linspace(0, 6, 60);
      var ys = lognArr.map(function (ln) { return MJ(T, Math.pow(10, ln), mu) / MSUN; });
      var idx = nearestIdx(lognArr, logn);
      var ctx = document.getElementById('m3-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [datasetCurva(lognArr, ys), datasetMarcador(lognArr, idx, ys)] },
        options: chartBaseOptions('log10(n / cm⁻³)', 'M_J / M_☉', { xScale: { type: 'linear' }, yScale: { type: 'logarithmic' } })
      });
      Ttxt.textContent = fmt(T, 0); ntxt.textContent = fmtExp(n, 1); mutxt.textContent = fmt(mu, 2);
      MJel.textContent = fmt(MJ(T, n, mu) / MSUN, 1);
    }
    Ts.addEventListener('input', desenha); ns.addEventListener('input', desenha); mus.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 4: elemento cilíndrico =================
  (function () {
    var rs = document.getElementById('m4-r'), drs = document.getElementById('m4-dr');
    if (!rs) return;
    var rV = document.getElementById('m4-r-valor'), drV = document.getElementById('m4-dr-valor');
    var rTxt = document.getElementById('m4-r-texto'), gEl = document.getElementById('m4-g'), Pel = document.getElementById('m4-P'), FgEl = document.getElementById('m4-Fg'), dPel = document.getElementById('m4-dP');
    var state = setupRawCanvas('m4-canvas', 420);
    var M = MSUN, R = RSUN;
    // Integra P(r) numericamente a partir da superfície (P=0) usando o perfil de referência.
    function construirPerfil() {
      var N = 400, rhoc = rhoc_de(M, R);
      var xs = linspace(0, 1, N + 1);
      var P = new Array(N + 1); P[N] = 0;
      for (var i = N; i > 0; i--) {
        var r1 = xs[i] * R, r0 = xs[i - 1] * R;
        var m1v = m_de(xs[i], M), m0v = m_de(xs[i - 1], M);
        var rho1 = rho_perfil(xs[i], rhoc), rho0 = rho_perfil(xs[i - 1], rhoc);
        var dPdr1 = -G * m1v * rho1 / clampMin(r1 * r1);
        var dPdr0 = -G * m0v * rho0 / clampMin(r0 * r0, 1);
        var dP = 0.5 * (dPdr1 + (i === 1 ? dPdr1 : dPdr0)) * (r1 - r0);
        P[i - 1] = P[i] - dP;
      }
      return { xs: xs, P: P, rhoc: rhoc };
    }
    var perfil = construirPerfil();
    function Pinterp(x) {
      var N = perfil.xs.length - 1;
      var idx = Math.min(N - 1, Math.max(0, Math.floor(x * N)));
      var t = x * N - idx;
      return perfil.P[idx] * (1 - t) + perfil.P[idx + 1] * t;
    }
    // F_g/A = integral de g(r')*rho(r') dr' sobre a casca [x, x+dx] — mesma
    // quadratura (trapezoidal, subdividida) usada para P(r), garantindo que
    // F_g e dP coincidam numericamente (o próprio conteúdo físico do
    // equilíbrio hidrostático, não uma coincidência de arredondamento).
    function FgDe(x, dx) {
      var xEnd = Math.min(1, x + dx);
      var NS = 20, Fg = 0, xPrev = x;
      var r0 = xPrev * R, m0 = m_de(xPrev, M);
      var gPrev = (G * m0 / clampMin(r0 * r0)) * rho_perfil(xPrev, perfil.rhoc);
      for (var si = 1; si <= NS; si++) {
        var xs2 = x + (xEnd - x) * si / NS;
        var r2v = xs2 * R, m2v = m_de(xs2, M);
        var g2 = G * m2v / clampMin(r2v * r2v);
        var rho2 = rho_perfil(xs2, perfil.rhoc);
        var gRho2 = g2 * rho2;
        Fg += 0.5 * (gPrev + gRho2) * ((xs2 - xPrev) * R);
        xPrev = xs2; gPrev = gRho2;
      }
      return Fg;
    }
    // Referências para normalizar visualmente o comprimento das setas em
    // escala log — sem isso, como F_g e dP são sempre iguais entre si (o
    // próprio conteúdo físico do equilíbrio hidrostático), a razão Fg/dP
    // usada ingenuamente para escalar as setas seria sempre 1, e as setas
    // nunca mudariam de tamanho ao mover os sliders. Os extremos são
    // obtidos varrendo o próprio perfil (dr=0,04 de referência) em vez de
    // supor onde g(r)ρ(r) é máximo/mínimo — para este perfil, g(r) não é
    // maior no centro (onde g→0) nem na superfície, mas em torno de
    // r/R⋆≈0,75, então uma escolha ingênua dos extremos (x=0,02 e x=0,90)
    // deixava o valor de referência de "máximo" menor que valores típicos
    // do meio da estrela, saturando as setas sempre no comprimento máximo.
    var FG_REF_MAX = 0, FG_REF_MIN = Infinity;
    for (var fi = 1; fi < 50; fi++) {
      var xfi = fi / 50;
      var FgScan = FgDe(xfi, 0.04);
      if (FgScan > FG_REF_MAX) FG_REF_MAX = FgScan;
      if (FgScan < FG_REF_MIN) FG_REF_MIN = FgScan;
    }
    function desenha() {
      var x = rs.value / 100, dx = drs.value / 100;
      rV.textContent = fmt(x, 2); drV.textContent = fmt(dx, 2);
      var r = x * R, m = m_de(x, M);
      var g = G * m / clampMin(r * r);
      var rho = rho_perfil(x, perfil.rhoc);
      var P = Pinterp(x);
      var xEnd = Math.min(1, x + dx);
      var Fg = FgDe(x, dx);
      var dP = Pinterp(x) - Pinterp(xEnd);
      rTxt.textContent = fmt(x, 2);
      gEl.textContent = fmtExp(g, 2);
      Pel.textContent = fmtExp(P, 2);
      FgEl.textContent = fmtExp(Fg, 2);
      dPel.textContent = fmtExp(dP, 2);

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w * 0.5, cy = h * 0.55, cylW = Math.min(w, h) * 0.28, cylH = Math.min(h * 0.4, 140);
      // cilindro
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
      ctx.strokeRect(cx - cylW / 2, cy - cylH / 2, cylW, cylH);
      ctx.fillStyle = '#f2f1ea'; ctx.fillRect(cx - cylW / 2, cy - cylH / 2, cylW, cylH);
      ctx.strokeRect(cx - cylW / 2, cy - cylH / 2, cylW, cylH);
      // Escala (log) do comprimento das setas pela magnitude física real de
      // F_g (=dP), relativa às referências centro/superfície — assim as
      // setas de fato encolhem/crescem ao mover r e dr, em vez de ficarem
      // presas em ~85px (o que ocorreria comparando apenas Fg com dP, que
      // são sempre iguais por construção).
      var logFg = Math.log10(clampMin(Fg, 1e-30));
      var logMax = Math.log10(clampMin(FG_REF_MAX, 1e-30)), logMin = Math.log10(clampMin(FG_REF_MIN, 1e-30));
      var t = (logFg - logMin) / clampMin(logMax - logMin, 1e-6);
      t = Math.max(0, Math.min(1, t));
      var arrowLen = 15 + 75 * t;
      function seta(x0, y0, x1, y1, cor, largura) {
        ctx.strokeStyle = cor; ctx.lineWidth = largura || 3;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        var ang = Math.atan2(y1 - y0, x1 - x0);
        ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 9 * Math.cos(ang - 0.4), y1 - 9 * Math.sin(ang - 0.4));
        ctx.lineTo(x1 - 9 * Math.cos(ang + 0.4), y1 - 9 * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fillStyle = cor; ctx.fill();
      }
      // Fg: seta para baixo no topo
      seta(cx - cylW * 0.22, cy - cylH / 2 - 10, cx - cylW * 0.22, cy - cylH / 2 - 10 + arrowLen, CORES_GRAFICO.marcador);
      ctx.fillStyle = CORES_GRAFICO.marcador; ctx.font = '13px sans-serif';
      ctx.fillText('F_g', cx - cylW * 0.22 - 30, cy - cylH / 2 - 12);
      // Fp,top: seta para baixo no topo (deslocada)
      seta(cx + cylW * 0.22, cy - cylH / 2 - 10, cx + cylW * 0.22, cy - cylH / 2 - 10 + arrowLen, CORES_GRAFICO.curva);
      ctx.fillStyle = CORES_GRAFICO.curva;
      ctx.fillText('F_p,top', cx + cylW * 0.22 + 8, cy - cylH / 2 - 12);
      // Fp,bottom: seta para cima na base
      seta(cx, cy + cylH / 2 + 10, cx, cy + cylH / 2 + 10 - arrowLen, CORES_GRAFICO.curva);
      ctx.fillText('F_p,bottom', cx + 8, cy + cylH / 2 + 14);
      // laterais: setas iguais e opostas, destacadas e depois "anuladas" (tracejadas + X)
      ctx.save(); ctx.setLineDash([4, 4]);
      seta(cx - cylW / 2 - 45, cy, cx - cylW / 2 - 5, cy, CORES_GRAFICO.extra, 2);
      seta(cx + cylW / 2 + 45, cy, cx + cylW / 2 + 5, cy, CORES_GRAFICO.extra, 2);
      ctx.restore();
      ctx.fillStyle = CORES_GRAFICO.extra;
      ctx.fillText('F_p (lateral, cancela)', cx - cylW / 2 - 130, cy - 8);
      ctx.font = '12px sans-serif'; ctx.fillStyle = '#888';
      ctx.fillText('(Teorema de Stevin: as duas setas laterais se anulam)', cx - cylW * 0.9, cy + cylH / 2 + 45);
      ctx.fillText('r/R⋆ = ' + fmt(x, 2), 10, 18);
    }
    rs.addEventListener('input', desenha); drs.addEventListener('input', desenha);
    window.addEventListener('resize', function () { state = setupRawCanvas('m4-canvas', 420); desenha(); });
    desenha();
  })();

  // ================= Módulo 5: aplicação dP/dr, dP/dm =================
  (function () {
    var Ms = document.getElementById('m5-M'), Rs = document.getElementById('m5-R'), rs = document.getElementById('m5-r');
    if (!Ms) return;
    var MV = document.getElementById('m5-M-valor'), RV = document.getElementById('m5-R-valor'), rV = document.getElementById('m5-r-valor');
    var rTxt = document.getElementById('m5-r-texto'), dPdrEl = document.getElementById('m5-dPdr'), dPdmEl = document.getElementById('m5-dPdm');
    var chart = null;
    function desenha() {
      var M = (Ms.value / 10) * MSUN, R = (Rs.value / 10) * RSUN, x = rs.value / 100;
      MV.textContent = fmt(Ms.value / 10, 1); RV.textContent = fmt(Rs.value / 10, 1); rV.textContent = fmt(x, 2);
      var rhoc = rhoc_de(M, R);
      var xs = linspace(0.02, 1, 80);
      var ys = xs.map(function (xx) { var r = xx * R, m = m_de(xx, M); return -G * m * rho_perfil(xx, rhoc) / (r * r); });
      var idx = nearestIdx(xs, x);
      var ctx = document.getElementById('m5-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, { type: 'line', data: { datasets: [datasetCurva(xs, ys), datasetMarcador(xs, idx, ys)] }, options: chartBaseOptions('r/R⋆', 'dP/dr (dyn/cm³)', { xScale: { type: 'linear' } }) });
      var r = x * R, m = m_de(x, M);
      rTxt.textContent = fmt(x, 2);
      dPdrEl.textContent = fmtExp(ys[idx], 2);
      dPdmEl.textContent = fmtExp(-G * m / (4 * Math.PI * Math.pow(clampMin(r), 4)), 2);
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); rs.addEventListener('input', desenha);
    desenha();
  })();

  // Pc(M,R): apenas hidrostática + equação da massa [Equação (5.27)] — não
  // usa nenhuma equação de estado, por isso funciona bem para qualquer
  // corpo autogravitante (estrela ou planeta).
  function Pc_de(M, R) { return 2 * G * M * M / (Math.PI * Math.pow(clampMin(R), 4)); }
  // Tc(M,R,mu): impõe ADICIONALMENTE gás ideal, Tc=mu*Pc/(rhobar*Rgas)
  // [Equação (5.29), com rhobar no lugar de rhoc como no Eq. (5.32)] —
  // implementado via Tc = mu*m_H*Pc/(rhobar*k_B), a forma cgs equivalente
  // (mu*m_H/k_B = mu/Rgas_específico) que evita qualquer mistura de
  // unidades SI/cgs. BUG anterior: a fórmula tinha um fator extra de 1/R
  // (dividia por R duas vezes em vez de uma), o que subestimava Tc por um
  // fator ~R (dezenas de bilhões), produzindo T_c~10^-4 em vez de ~10^7 K.
  function Tc_de(M, R, mu) {
    var Pc = Pc_de(M, R);
    var rhobar = 3 * M / (4 * Math.PI * Math.pow(clampMin(R), 3));
    return mu * M_H * Pc / (clampMin(rhobar) * K_B);
  }

  // ================= Módulo 6a: Pc calculadora =================
  (function () {
    var Ms = document.getElementById('m6a-M'), Rs = document.getElementById('m6a-R');
    if (!Ms) return;
    var MV = document.getElementById('m6a-M-valor'), RV = document.getElementById('m6a-R-valor');
    var PcEl = document.getElementById('m6a-Pc'), razaoPEl = document.getElementById('m6a-razaoP');
    var chart = null;
    function desenha() {
      var M = (Ms.value / 100) * MSUN, R = (Rs.value / 100) * RSUN;
      MV.textContent = fmt(Ms.value / 100, 2); RV.textContent = fmt(Rs.value / 100, 2);
      var Pc = Pc_de(M, R);
      PcEl.textContent = fmtExp(Pc, 2);
      var PcReal = 2.4e17;
      razaoPEl.textContent = fmt(PcReal / Pc, 1);
      var ctx = document.getElementById('m6a-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['P_c estimado', 'P_c real (MSP)'], datasets: [{ data: [Pc, PcReal], backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador] }] },
        options: chartBaseOptions('', 'P_c (dyn/cm²)', { yScale: { type: 'logarithmic' } })
      });
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 6b: Tc calculadora =================
  (function () {
    var Ms = document.getElementById('m6b-M'), Rs = document.getElementById('m6b-R'), mus = document.getElementById('m6b-mu');
    if (!Ms) return;
    var MV = document.getElementById('m6b-M-valor'), RV = document.getElementById('m6b-R-valor'), muV = document.getElementById('m6b-mu-valor');
    var TcEl = document.getElementById('m6b-Tc'), razaoTEl = document.getElementById('m6b-razaoT');
    var chart = null;
    function desenha() {
      var M = (Ms.value / 100) * MSUN, R = (Rs.value / 100) * RSUN, mu = mus.value / 100;
      MV.textContent = fmt(Ms.value / 100, 2); RV.textContent = fmt(Rs.value / 100, 2); muV.textContent = fmt(mu, 2);
      var Tc = Tc_de(M, R, mu);
      TcEl.textContent = fmtExp(Tc, 2);
      var TcReal = 1.57e7;
      razaoTEl.textContent = fmt(TcReal / Tc, 2);
      var ctx = document.getElementById('m6b-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['T_c estimado', 'T_c real (MSP)'], datasets: [{ data: [Tc, TcReal], backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador] }] },
        options: chartBaseOptions('', 'T_c (K)', { yScale: { type: 'logarithmic' } })
      });
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); mus.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 7: exoplanetas — Pc funciona, Tc falha =================
  (function () {
    var sel = document.getElementById('m7exo-objeto');
    if (!sel) return;
    var Ms = document.getElementById('m7exo-M'), Rs = document.getElementById('m7exo-R'), mus = document.getElementById('m7exo-mu');
    var MV = document.getElementById('m7exo-M-valor'), RV = document.getElementById('m7exo-R-valor'), muV = document.getElementById('m7exo-mu-valor');
    var PcEstEl = document.getElementById('m7exo-Pc-est'), PcRealEl = document.getElementById('m7exo-Pc-real');
    var TcEstEl = document.getElementById('m7exo-Tc-est'), TcRealEl = document.getElementById('m7exo-Tc-real');
    var chartP = null, chartT = null;
    // Presets: M (Msun), R (Rsun), mu, Pc_real (dyn/cm2, ou null), Tc_real (K, ou null).
    // Fontes: Sol — Vinyoles et al. (2017); Júpiter — Militzer et al. (2016),
    // faixa 50-100 Mbar e Tc~2-2,5x10^4 K (usado o ponto médio); Terra —
    // Pc de Dziewonski & Anderson (1981, PREM, 360 GPa) e Tc de Anzellini
    // et al. (2013, fusão do ferro no limite do núcleo interno, ~6230 K,
    // usado como valor representativo do núcleo); anã marrom — sem valor
    // numérico único e confiável de Pc/Tc central encontrado na literatura
    // consultada nesta sessão (Chabrier & Baraffe 2000 discutem a física
    // qualitativamente), por isso os campos "real" ficam em branco — não
    // inventamos um número.
    var PRESETS = {
      sol: { M: 1, R: 1, mu: 0.50, PcReal: 2.4e17, TcReal: 1.57e7 },
      jupiter: { M: 9.546e-4, R: 0.10045, mu: 2.3, PcReal: 7.5e13, TcReal: 2.25e4 },
      terra: { M: 3.003e-6, R: 9.168e-3, mu: 22, PcReal: 3.6e12, TcReal: 6.0e3 },
      ana_marrom: { M: 0.0477, R: 0.10, mu: 1.0, PcReal: null, TcReal: null },
      custom: null
    };
    function aplicarPreset(nome) {
      var p = PRESETS[nome];
      var custom = (nome === 'custom');
      Ms.disabled = !custom; Rs.disabled = !custom; mus.disabled = !custom;
      if (p) {
        Ms.value = Math.round(Math.log10(p.M) * 100);
        Rs.value = Math.round(Math.log10(p.R) * 100);
        mus.value = Math.round(p.mu * 10);
      }
      desenha();
    }
    function desenha() {
      var M = Math.pow(10, Number(Ms.value) / 100), R = Math.pow(10, Number(Rs.value) / 100), mu = Number(mus.value) / 10;
      MV.textContent = fmtExp(M, 2); RV.textContent = fmtExp(R, 2); muV.textContent = fmt(mu, 2);
      var Pc = Pc_de(M * MSUN, R * RSUN);
      var Tc = Tc_de(M * MSUN, R * RSUN, mu);
      var preset = PRESETS[sel.value];
      var PcReal = preset ? preset.PcReal : null;
      var TcReal = preset ? preset.TcReal : null;
      PcEstEl.textContent = fmtExp(Pc, 2);
      PcRealEl.textContent = PcReal == null ? 'sem valor de referência confiável' : fmtExp(PcReal, 2);
      TcEstEl.textContent = fmtExp(Tc, 2);
      TcRealEl.textContent = TcReal == null ? 'sem valor de referência confiável' : fmtExp(TcReal, 2);

      var ctxP = document.getElementById('m7exo-canvas-P').getContext('2d');
      if (chartP) chartP.destroy();
      var dadosP = PcReal == null ? [Pc] : [Pc, PcReal];
      var labelsP = PcReal == null ? ['P_c estimado'] : ['P_c estimado', 'P_c real'];
      chartP = new Chart(ctxP, {
        type: 'bar',
        data: { labels: labelsP, datasets: [{ data: dadosP, backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador] }] },
        options: chartBaseOptions('', 'P_c (dyn/cm²)', { yScale: { type: 'logarithmic' } })
      });

      var ctxT = document.getElementById('m7exo-canvas-T').getContext('2d');
      if (chartT) chartT.destroy();
      var dadosT = TcReal == null ? [Tc] : [Tc, TcReal];
      var labelsT = TcReal == null ? ['T_c estimado (gás ideal)'] : ['T_c estimado (gás ideal)', 'T_c real'];
      chartT = new Chart(ctxT, {
        type: 'bar',
        data: { labels: labelsT, datasets: [{ data: dadosT, backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador] }] },
        options: chartBaseOptions('', 'T_c (K)', { yScale: { type: 'logarithmic' } })
      });
    }
    sel.addEventListener('change', function () { aplicarPreset(sel.value); });
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); mus.addEventListener('input', desenha);
    aplicarPreset('jupiter');
  })();

  // ================= Módulo 7: perfis P(r), m(r), rho(r) =================
  (function () {
    var Ms = document.getElementById('m7-M'), Rs = document.getElementById('m7-R');
    if (!Ms) return;
    var MV = document.getElementById('m7-M-valor'), RV = document.getElementById('m7-R-valor'), PmeioEl = document.getElementById('m7-Pmeio');
    var chart = null;
    function desenha() {
      var M = (Ms.value / 100) * MSUN, R = (Rs.value / 100) * RSUN;
      MV.textContent = fmt(Ms.value / 100, 2); RV.textContent = fmt(Rs.value / 100, 2);
      var rhoc = rhoc_de(M, R);
      var N = 200; var xs = linspace(0, 1, N + 1);
      var P = new Array(N + 1); P[N] = 0;
      for (var i = N; i > 0; i--) {
        var r1 = xs[i] * R, r0 = xs[i - 1] * R;
        var dPdr1 = -G * m_de(xs[i], M) * rho_perfil(xs[i], rhoc) / clampMin(r1 * r1);
        P[i - 1] = P[i] - dPdr1 * (r1 - r0);
      }
      var Pc = P[0];
      var Pnorm = P.map(function (p) { return p / Pc; });
      var mnorm = xs.map(massaFracao);
      var rhonorm = xs.map(function (x) { return rho_perfil(x, rhoc) / rhoc; });
      // O formato normalizado (P/Pc, m/M, rho/rhoc) é, por construção
      // matemática, o mesmo para qualquer M e R (perfil homólogo) — por
      // isso plotamos os valores físicos reais (escala log), que DEPENDEM
      // de M e R (Pc~M²/R⁴, rhoc~M/R³, m(r) em gramas), tornando os
      // sliders de massa e raio visivelmente efetivos no gráfico.
      var Pfis = P;
      var mfis = xs.map(function (x) { return massaFracao(x) * M; });
      var rhofis = xs.map(function (x) { return rho_perfil(x, rhoc); });
      var ctx = document.getElementById('m7-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            Object.assign(datasetCurva(xs, Pfis, CORES_GRAFICO.curva), { label: 'P(r) [dyn/cm²]' }),
            Object.assign(datasetCurva(xs, mfis, CORES_GRAFICO.marcador), { label: 'm(r) [g]' }),
            Object.assign(datasetCurva(xs, rhofis, CORES_GRAFICO.extra), { label: 'ρ(r) [g/cm³]' })
          ]
        },
        options: Object.assign(chartBaseOptions('r/R⋆', 'valor físico (escala log, cgs)', { xScale: { type: 'linear' }, yScale: { type: 'logarithmic' } }), { plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: false } } })
      });
      var idxMeio = nearestIdx(mnorm, 0.5);
      PmeioEl.textContent = fmt(Pnorm[idxMeio], 3);
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 8: queda livre animada =================
  (function () {
    var Ms = document.getElementById('m8-M'), Rs = document.getElementById('m8-R');
    if (!Ms) return;
    var MV = document.getElementById('m8-M-valor'), RV = document.getElementById('m8-R-valor');
    var tffEl = document.getElementById('m8-tff'), tffMinEl = document.getElementById('m8-tff-min');
    var playBtn = document.getElementById('m8-play'), resetBtn = document.getElementById('m8-reset');
    var state = setupRawCanvas('m8-canvas', 340);
    var animando = false, tAnim = 0, rafId = null, lastTs = null;
    function calcs() {
      var M = (Ms.value / 100) * MSUN, R = (Rs.value / 100) * RSUN;
      var g = G * M / (R * R);
      var tff = Math.sqrt(R / g);
      return { M: M, R: R, g: g, tff: tff };
    }
    function desenhaEstatico() {
      var c = calcs();
      MV.textContent = fmt(Ms.value / 100, 2); RV.textContent = fmt(Rs.value / 100, 2);
      tffEl.textContent = fmt(c.tff, 0); tffMinEl.textContent = fmt(c.tff / 60, 1);
      desenhaFrame(0);
    }
    function desenhaFrame(fracaoTempo) {
      var c = calcs();
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var raioMax = Math.min(w, h) * 0.38;
      // raio de queda livre aproximado: r(t) ~ R*(1-t/tff)^(2/3) (ordem de grandeza, colapso acelerado)
      var t = Math.min(1, fracaoTempo);
      var escala = Math.pow(Math.max(0.02, 1 - t), 2 / 3);
      ctx.strokeStyle = '#999'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, raioMax, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = CORES_GRAFICO.curva + '33'; ctx.strokeStyle = CORES_GRAFICO.curva; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, raioMax * escala, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#444'; ctx.font = '13px sans-serif';
      ctx.fillText('t = ' + fmt(t * c.tff, 0) + ' s  (t_ff = ' + fmt(c.tff, 0) + ' s)', 10, 20);
      if (t >= 0.999) { ctx.fillStyle = CORES_GRAFICO.marcador; ctx.fillText('colapso completo (ordem de grandeza)', 10, 40); }
    }
    function tick(ts) {
      if (lastTs == null) lastTs = ts;
      var dt = (ts - lastTs) / 1000; lastTs = ts;
      var c = calcs();
      tAnim += dt / Math.min(6, Math.max(1.2, c.tff > 0 ? 3 : 3)); // completa animação em ~3s visuais
      if (tAnim >= 1) { tAnim = 1; desenhaFrame(tAnim); animando = false; playBtn.textContent = '▶ Iniciar colapso'; return; }
      desenhaFrame(tAnim);
      rafId = requestAnimationFrame(tick);
    }
    playBtn.addEventListener('click', function () {
      if (animando) { animando = false; cancelAnimationFrame(rafId); playBtn.textContent = '▶ Iniciar colapso'; return; }
      animando = true; lastTs = null; tAnim = 0; playBtn.textContent = '❚❚ Colapsando…';
      rafId = requestAnimationFrame(tick);
    });
    resetBtn.addEventListener('click', function () {
      animando = false; if (rafId) cancelAnimationFrame(rafId); tAnim = 0; playBtn.textContent = '▶ Iniciar colapso'; desenhaEstatico();
    });
    Ms.addEventListener('input', desenhaEstatico); Rs.addEventListener('input', desenhaEstatico);
    window.addEventListener('resize', function () { state = setupRawCanvas('m8-canvas', 340); desenhaEstatico(); });
    desenhaEstatico();
  })();

  // ================= Módulo 9: contração e Teorema do Virial =================
  (function () {
    var Ris = document.getElementById('m9-Ri'), Rfs = document.getElementById('m9-Rf'), Ms = document.getElementById('m9-M');
    if (!Ris) return;
    var RiV = document.getElementById('m9-Ri-valor'), RfV = document.getElementById('m9-Rf-valor'), MV = document.getElementById('m9-M-valor');
    var EgiEl = document.getElementById('m9-Egi'), EgfEl = document.getElementById('m9-Egf'), dEgEl = document.getElementById('m9-dEg'), dEiEl = document.getElementById('m9-dEi');
    var playBtn = document.getElementById('m9-play'), resetBtn = document.getElementById('m9-reset');
    var chart = null, frac = 1;
    function calcs() {
      var Ri = (Ris.value / 100) * RSUN, Rf = (Rfs.value / 100) * RSUN, M = (Ms.value / 100) * MSUN;
      var Egi = -G * M * M / Ri, Egf = -G * M * M / Rf;
      return { Ri: Ri, Rf: Rf, M: M, Egi: Egi, Egf: Egf, dEg: Egf - Egi, dEi: -(Egf - Egi) / 2 };
    }
    function desenha() {
      RiV.textContent = fmt(Ris.value / 100, 2); RfV.textContent = fmt(Rfs.value / 100, 2); MV.textContent = fmt(Ms.value / 100, 2);
      var c = calcs();
      var Rcur = c.Ri + (c.Rf - c.Ri) * frac;
      var Rs2 = linspace(Math.min(c.Ri, c.Rf) * 0.6, Math.max(c.Ri, c.Rf) * 1.3, 80);
      var phis = Rs2.map(function (r) { return -G * c.M * c.M / r; });
      var idxCur = nearestIdx(Rs2, Rcur);
      var d0 = datasetCurva(Rs2, phis), d1 = datasetMarcador(Rs2, idxCur, phis);
      if (!chart) {
        var ctx = document.getElementById('m9-canvas').getContext('2d');
        chart = new Chart(ctx, {
          type: 'line',
          data: { datasets: [d0, d1] },
          options: chartBaseOptions('r (cm)', 'E_g ≈ -GM²/r (erg)', { xScale: { type: 'linear' } })
        });
      } else {
        chart.data.datasets[0].data = d0.data;
        chart.data.datasets[1].data = d1.data;
        chart.data.datasets[1].pointRadius = d1.pointRadius;
        chart.update('none');
      }
      EgiEl.textContent = fmtExp(c.Egi, 2); EgfEl.textContent = fmtExp(c.Egf, 2);
      dEgEl.textContent = fmtExp(c.dEg, 2); dEiEl.textContent = fmtExp(c.dEi, 2);
    }
    createAnimController(playBtn, resetBtn, 2.5, function (t) { frac = 1 - t; desenha(); }, { play: '▶ Animar contração', playing: '❚❚ Contraindo…' });
    Ris.addEventListener('input', function () { frac = 1; desenha(); });
    Rfs.addEventListener('input', function () { frac = 1; desenha(); });
    Ms.addEventListener('input', function () { frac = 1; desenha(); });
    desenha();
  })();

  // ================= Módulo 10: tau_KH aplicação =================
  (function () {
    var Ms = document.getElementById('m10-M'), Rs = document.getElementById('m10-R'), Ls = document.getElementById('m10-L');
    if (!Ms) return;
    var MV = document.getElementById('m10-M-valor'), RV = document.getElementById('m10-R-valor'), LV = document.getElementById('m10-L-valor');
    var tauEl = document.getElementById('m10-tauKH'), exEl = document.getElementById('m10-exemplo');
    var chart = null;
    var ANO = 3.156e7;
    function valorSlider(s) { return Math.pow(10, s.value / 100); }
    function desenha() {
      var M = valorSlider(Ms), R = valorSlider(Rs), L = valorSlider(Ls);
      MV.textContent = fmt(M, 2); RV.textContent = fmt(R, 2); LV.textContent = fmt(L, 2);
      var tauKH = 1.5e7 * M * M / R / L;
      tauEl.textContent = fmtExp(tauKH, 2);
      var tau10 = 1.5e7 * 100 / 4 / 1e4;
      exEl.textContent = fmtExp(tau10, 1);
      var ctx = document.getElementById('m10-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['τ_KH (parâmetros atuais)', 'τ_KH,☉ (referência)'], datasets: [{ data: [tauKH, 1.57e7], backgroundColor: [CORES_GRAFICO.marcador, CORES_GRAFICO.curva] }] },
        options: Object.assign(chartBaseOptions('anos', '', { xScale: { type: 'logarithmic' } }), { indexAxis: 'y' })
      });
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); Ls.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 11: comparador de 4 escalas de tempo =================
  (function () {
    var Ms = document.getElementById('m11-M'), Rs = document.getElementById('m11-R'), Ls = document.getElementById('m11-L');
    if (!Ms) return;
    var MV = document.getElementById('m11-M-valor'), RV = document.getElementById('m11-R-valor'), LV = document.getElementById('m11-L-valor');
    var tdinEl = document.getElementById('m11-tdin'), tmixEl = document.getElementById('m11-tmix'), tkhEl = document.getElementById('m11-tkh'), tnucEl = document.getElementById('m11-tnuc');
    var chart = null;
    function desenha() {
      var M = Ms.value / 10, R = Rs.value / 10, L = Math.pow(10, Ls.value / 100);
      MV.textContent = fmt(M, 1); RV.textContent = fmt(R, 1); LV.textContent = fmt(L, 2);
      var Mcgs = M * MSUN, Rcgs = R * RSUN, Lcgs = L * LSUN;
      var rhobar = 3 * Mcgs / (4 * Math.PI * Math.pow(Rcgs, 3));
      var tdin = 1 / (2 * Math.sqrt(G * rhobar));
      // tau_mix ~ R/v_B; aproximando v_B por uma escala fraca em M,R (ilustrativo,
      // consistente com o Módulo 20) — depende de R para não ficar "congelado".
      var tmix = 3e7 * (Rcgs / RSUN) * Math.sqrt(MSUN / Mcgs);
      var tauKH = 1.5e7 * M * M / R / L; // anos
      var tauNuc = 1e10 * M / L; // anos
      tdinEl.textContent = fmtExp(tdin, 2);
      tmixEl.textContent = fmtExp(tmix, 2);
      tkhEl.textContent = fmtExp(tauKH, 2);
      tnucEl.textContent = fmtExp(tauNuc, 2);
      var ANO = 3.156e7;
      var dados = [tdin, tmix, tauKH * ANO, tauNuc * ANO];
      var ctx = document.getElementById('m11-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['t_din (queda livre)', 'τ_mix (mistura convectiva)', 'τ_KH (Kelvin–Helmholtz)', 'τ_nuc (nuclear)'],
          datasets: [{ data: dados, backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.extra, CORES_GRAFICO.marcador, '#555'] }]
        },
        options: Object.assign(chartBaseOptions('tempo (s)', '', { xScale: { type: 'logarithmic' } }), { indexAxis: 'y' })
      });
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); Ls.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 12: dl/dm = eps =================
  (function () {
    var Ls = document.getElementById('m12-L'), fs = document.getElementById('m12-fnuc');
    if (!Ls) return;
    var LV = document.getElementById('m12-L-valor'), fV = document.getElementById('m12-fnuc-valor'), epsEl = document.getElementById('m12-eps');
    var chart = null;
    function desenha() {
      var L = Ls.value * LSUN / 100, fnuc = fs.value / 100;
      LV.textContent = fmt(Ls.value / 100, 2); fV.textContent = fmt(fnuc, 2);
      var Mnuc = fnuc * MSUN;
      var eps = L / Mnuc;
      epsEl.textContent = fmtExp(eps, 2);
      var xs = linspace(0, 1, 100);
      var ys = xs.map(function (x) { return x < fnuc ? (x / fnuc) * L : L; });
      var ctx = document.getElementById('m12-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, { type: 'line', data: { datasets: [datasetCurva(xs, ys)] }, options: chartBaseOptions('m/M', 'l (erg/s)', { xScale: { type: 'linear' } }) });
    }
    Ls.addEventListener('input', desenha); fs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 13: diagrama de zonas de transporte =================
  (function () {
    var Ms = document.getElementById('m13-M');
    if (!Ms) return;
    var MV = document.getElementById('m13-M-valor'), regimeEl = document.getElementById('m13-regime');
    var state = setupRawCanvas('m13-canvas', 380);
    function zonas(M) {
      // fração de raio: retorna [raioNucleo, raioZonaInterna] com significado dependente do regime
      if (M < 0.35) return { tipo: 'total', nucleo: 0, meio: 1.0 };
      if (M <= 1.3) {
        // interpola linearmente a espessura da zona convectiva externa entre 0 (M=1.3) e ~1 (M=0.35)
        var t = (1.3 - M) / (1.3 - 0.35);
        var raioConv = 0.3 + 0.5 * t; // fração externa convectiva
        return { tipo: 'sol', radBase: 1 - raioConv };
      }
      var t2 = Math.min(1, (M - 1.3) / 20);
      var raioNucleoConv = 0.15 + 0.25 * Math.min(1, t2 * 3);
      return { tipo: 'massiva', nucleoConv: raioNucleoConv };
    }
    function desenha() {
      var M = Ms.value / 10;
      MV.textContent = fmt(M, 1);
      var z = zonas(M);
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, Rpx = Math.min(w, h) * 0.4;
      function anel(rIn, rOut, cor) {
        ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, 2 * Math.PI); ctx.fillStyle = cor; ctx.fill();
      }
      if (z.tipo === 'total') {
        anel(0, Rpx, CORES_GRAFICO.extra);
        ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('totalmente convectiva', cx, cy);
        regimeEl.textContent = 'totalmente convectiva (M<0,35 M☉)';
      } else if (z.tipo === 'sol') {
        anel(0, Rpx, CORES_GRAFICO.extra);
        anel(0, Rpx * z.radBase, '#d8622f22');
        ctx.beginPath(); ctx.arc(cx, cy, Rpx * z.radBase, 0, 2 * Math.PI); ctx.fillStyle = '#f4a26933'; ctx.fill();
        ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#333'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('núcleo + zona radiativa', cx, cy);
        ctx.fillStyle = '#333'; ctx.fillText('zona convectiva', cx, cy - Rpx * (z.radBase + 1) / 2 + 4);
        regimeEl.textContent = 'tipo solar: núcleo radiativo, envelope convectivo (0,35–1,3 M☉)';
      } else {
        anel(0, Rpx, '#f4a26955');
        ctx.beginPath(); ctx.arc(cx, cy, Rpx * z.nucleoConv, 0, 2 * Math.PI); ctx.fillStyle = CORES_GRAFICO.extra; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('núcleo convectivo (CNO)', cx, cy);
        ctx.fillStyle = '#333';
        ctx.fillText('envelope radiativo', cx, cy - Rpx * (z.nucleoConv + 1) / 2 + 4);
        regimeEl.textContent = 'massiva: núcleo convectivo, envelope radiativo (M>1,3 M☉)';
      }
      ctx.textAlign = 'left';
    }
    Ms.addEventListener('input', desenha);
    window.addEventListener('resize', function () { state = setupRawCanvas('m13-canvas', 380); desenha(); });
    desenha();
  })();

  // ================= Módulo 14: transporte radiativo calculadora =================
  (function () {
    var ks = document.getElementById('m14-kappa'), ls = document.getElementById('m14-l'), Ts = document.getElementById('m14-T'), rs = document.getElementById('m14-r');
    if (!ks) return;
    var kV = document.getElementById('m14-kappa-valor'), lV = document.getElementById('m14-l-valor'), TV = document.getElementById('m14-T-valor'), rV = document.getElementById('m14-r-valor');
    var dTdrEl = document.getElementById('m14-dTdr'), dTdPEl = document.getElementById('m14-dTdP');
    var chart = null;
    function desenha() {
      var kappa = Number(ks.value), l = ls.value / 100 * LSUN, T = Ts.value / 10 * 1e6, r = rs.value / 100 * RSUN, m = MSUN * (rs.value / 100);
      kV.textContent = fmt(kappa, 0); lV.textContent = fmt(ls.value / 100, 2); TV.textContent = fmt(T / 1e6, 1); rV.textContent = fmt(rs.value / 100, 2);
      var dTdr = -3 * kappa * (m / (4 / 3 * Math.PI * r * r * r)) * l / (16 * Math.PI * A_RAD * C * r * r * Math.pow(T, 3));
      var dTdP = 3 / (16 * Math.PI * A_RAD * C * G) * kappa * l / (m * Math.pow(T, 3));
      dTdrEl.textContent = fmtExp(dTdr, 2);
      dTdPEl.textContent = fmtExp(dTdP, 2);
      var ctx = document.getElementById('m14-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['|dT/dr| (K/cm)', 'dT/dP (K·cm²/dyn)'], datasets: [{ data: [Math.abs(dTdr), dTdP], backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador] }] },
        options: Object.assign(chartBaseOptions('', '', { xScale: { type: 'logarithmic' } }), { indexAxis: 'y' })
      });
    }
    ks.addEventListener('input', desenha); ls.addEventListener('input', desenha); Ts.addEventListener('input', desenha); rs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 15: média harmônica de opacidades =================
  (function () {
    var krs = document.getElementById('m15-krad'), kcs = document.getElementById('m15-kcond');
    if (!krs) return;
    var krV = document.getElementById('m15-krad-valor'), kcV = document.getElementById('m15-kcond-valor'), kTEl = document.getElementById('m15-kT');
    var chart = null;
    function valorSlider(s) { return Math.pow(10, s.value / 100); }
    function desenha() {
      var krad = valorSlider(krs), kcond = valorSlider(kcs);
      krV.textContent = fmtExp(krad, 2); kcV.textContent = fmtExp(kcond, 2);
      var kT = 1 / (1 / krad + 1 / kcond);
      var somaDireta = krad + kcond;
      kTEl.textContent = fmtExp(kT, 2);
      var ctx = document.getElementById('m15-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['κ_rad', 'κ_cond', 'κ_T (média harmônica, correta)', 'soma direta (incorreta)'], datasets: [{ data: [krad, kcond, kT, somaDireta], backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.extra, CORES_GRAFICO.marcador, '#999'] }] },
        options: Object.assign(chartBaseOptions('cm²/g', '', { xScale: { type: 'logarithmic' } }), { indexAxis: 'y' })
      });
    }
    krs.addEventListener('input', desenha); kcs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 16: bolha sobe/afunda + T vs z =================
  (function () {
    var nrs = document.getElementById('m16-nablarad'), nas = document.getElementById('m16-nablaad');
    if (!nrs) return;
    var nrV = document.getElementById('m16-nablarad-valor'), naV = document.getElementById('m16-nablaad-valor');
    var nrTxt = document.getElementById('m16-nablarad-texto'), naTxt = document.getElementById('m16-nablaad-texto'), veredito = document.getElementById('m16-veredito');
    var playBtn = document.getElementById('m16-play'), resetBtn = document.getElementById('m16-reset');
    var stateBolha = setupRawCanvas('m16-canvas-bolha', 320);
    var stateTz = setupRawCanvas('m16-canvas-tz', 320);
    var frac = 0;
    function valores() { return { nrad: nrs.value / 100, nad: nas.value / 100 }; }
    function desenhaBolha() {
      var v = valores(); var instavel = v.nad < v.nrad;
      var ctx = stateBolha.ctx, w = stateBolha.w, h = stateBolha.h;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, h - 20); ctx.lineTo(w - 20, h - 20); ctx.stroke();
      var yPos = instavel ? (h - 40) - frac * (h - 80) : (h - 40) + frac * (h - 80) * 0.5;
      yPos = Math.max(20, Math.min(h - 40, yPos));
      var x0 = w / 2;
      ctx.beginPath(); ctx.arc(x0, yPos, 22, 0, 2 * Math.PI);
      ctx.fillStyle = instavel ? CORES_GRAFICO.marcador + '55' : CORES_GRAFICO.curva + '55';
      ctx.fill(); ctx.strokeStyle = instavel ? CORES_GRAFICO.marcador : CORES_GRAFICO.curva; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#333'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('bolha', x0, yPos + 4);
      ctx.fillText('ambiente', x0, h - 6);
      ctx.textAlign = 'left';
    }
    function desenhaTz() {
      var v = valores();
      var ctx = stateTz.ctx, w = stateTz.w, h = stateTz.h;
      ctx.clearRect(0, 0, w, h);
      var x0 = 40, x1 = w - 20, y0 = h - 30, y1 = 20;
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      ctx.fillStyle = '#666'; ctx.font = '11px sans-serif';
      ctx.fillText('z', x1 - 8, y0 - 6); ctx.fillText('T', x0 + 4, y1 + 4);
      var Tstart = 0.85;
      function linha(nabla, cor, label) {
        var yEnd = Tstart - nabla * 0.9;
        var ys0 = y0 - Tstart * (y0 - y1), ys1 = y0 - Math.max(0.02, yEnd) * (y0 - y1);
        ctx.strokeStyle = cor; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x0 + 10, ys0); ctx.lineTo(x1 - 10, ys1); ctx.stroke();
        ctx.fillStyle = cor; ctx.fillText(label, x1 - 60, ys1 - 6);
      }
      linha(v.nad, CORES_GRAFICO.marcador, 'bolha (∇_ad)');
      linha(v.nrad, CORES_GRAFICO.curva, 'ambiente (∇_rad)');
      ctx.fillStyle = '#888'; ctx.fillText('int', x0 + 6, y0 + 14); ctx.fillText('ext', x1 - 20, y0 + 14);
    }
    function desenha() {
      var v = valores();
      nrV.textContent = fmt(v.nrad, 2); naV.textContent = fmt(v.nad, 2);
      nrTxt.textContent = fmt(v.nrad, 2); naTxt.textContent = fmt(v.nad, 2);
      veredito.textContent = v.nad < v.nrad ? 'instável — a bolha sobe (convecção)' : 'estável — a bolha afunda de volta (sem convecção)';
      desenhaBolha(); desenhaTz();
    }
    createAnimController(playBtn, resetBtn, 2, function (t) { frac = t; desenha(); }, { play: '▶ Soltar a bolha', playing: '❚❚ Em movimento…' });
    nrs.addEventListener('input', function () { frac = 0; desenha(); });
    nas.addEventListener('input', function () { frac = 0; desenha(); });
    window.addEventListener('resize', function () {
      stateBolha = setupRawCanvas('m16-canvas-bolha', 320); stateTz = setupRawCanvas('m16-canvas-tz', 320); desenha();
    });
    desenha();
  })();

  // ================= Módulo 17: nabla_ad(gamma) =================
  (function () {
    var gs = document.getElementById('m17-gamma');
    if (!gs) return;
    var gV = document.getElementById('m17-gamma-valor'), gTxt = document.getElementById('m17-gamma-texto'), naEl = document.getElementById('m17-nablaad');
    var chart = null;
    function desenha() {
      var gamma = gs.value / 100;
      gV.textContent = fmt(gamma, 3); gTxt.textContent = fmt(gamma, 3);
      var nablaad = (gamma - 1) / gamma;
      naEl.textContent = fmt(nablaad, 4);
      var gammas = linspace(1.02, 2.0, 80);
      var ys = gammas.map(function (g) { return (g - 1) / g; });
      var idx = nearestIdx(gammas, gamma);
      var ctx = document.getElementById('m17-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, { type: 'line', data: { datasets: [datasetCurva(gammas, ys), datasetMarcador(gammas, idx, ys)] }, options: chartBaseOptions('γ', '∇_ad = (γ-1)/γ', { xScale: { type: 'linear' } }) });
    }
    gs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 18: fluxo convectivo MLT =================
  (function () {
    var las = document.getElementById('m18-lmHp'), exs = document.getElementById('m18-excesso');
    if (!las) return;
    var laV = document.getElementById('m18-lmHp-valor'), exV = document.getElementById('m18-excesso-valor'), vBEl = document.getElementById('m18-vB'), FconvEl = document.getElementById('m18-Fconv');
    var chart = null;
    var rhoB = 2e-7, Cp = 3.5e8, Tref = 2e6, gref = G * MSUN / (RSUN * RSUN * 0.5), Hpref = 5e9;
    function desenha() {
      var alphaMLT = las.value / 100;
      var logExc = exs.value / 100;
      var excesso = Math.pow(10, logExc);
      laV.textContent = fmt(alphaMLT, 2);
      exV.textContent = fmtExp(excesso, 1);
      var vB = Math.sqrt(Math.max(0, alphaMLT * alphaMLT * Hpref * Hpref * gref / (2 * Hpref) * excesso));
      var Fconv = rhoB * Cp * Tref * alphaMLT * alphaMLT * Math.sqrt(0.5 * gref * Hpref) * Math.pow(excesso, 1.5);
      vBEl.textContent = fmtExp(vB, 2); FconvEl.textContent = fmtExp(Fconv, 2);
      // Domínio do eixo x cobre exatamente o intervalo permitido pelo slider
      // m18-excesso (min=-1200,max=0 -> logExc de -12 a 0), para o marcador
      // nunca "grudar" numa borda do gráfico com valores fora do domínio.
      var excs = linspace(-12, 0, 60);
      var ys = excs.map(function (le) { var e = Math.pow(10, le); return rhoB * Cp * Tref * alphaMLT * alphaMLT * Math.sqrt(0.5 * gref * Hpref) * Math.pow(e, 1.5); });
      var idx = nearestIdx(excs, logExc);
      var ctx = document.getElementById('m18-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, { type: 'line', data: { datasets: [datasetCurva(excs, ys), datasetMarcador(excs, idx, ys)] }, options: chartBaseOptions('log10(∇-∇_ad)', 'F_conv (erg s⁻¹ cm⁻²)', { xScale: { type: 'linear' }, yScale: { type: 'logarithmic' } }) });
    }
    las.addEventListener('input', desenha); exs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 19: nabla-nablaad ~ 1e-8 =================
  (function () {
    var Ms = document.getElementById('m19-M'), Rs = document.getElementById('m19-R'), Ls = document.getElementById('m19-L');
    if (!Ms) return;
    var MV = document.getElementById('m19-M-valor'), RV = document.getElementById('m19-R-valor'), LV = document.getElementById('m19-L-valor'), valorEl = document.getElementById('m19-valor');
    var chart = null;
    function desenha() {
      var M = Ms.value / 100, R = Rs.value / 100, L = Ls.value / 100;
      MV.textContent = fmt(M, 2); RV.textContent = fmt(R, 2); LV.textContent = fmt(L, 2);
      var Mcgs = M * MSUN, Rcgs = R * RSUN, Lcgs = L * LSUN;
      var termo = Math.pow((Lcgs * Rcgs) / Mcgs, 2 / 3) * Rcgs / (G * Mcgs);
      valorEl.textContent = fmtExp(termo, 2);
      var ctx = document.getElementById('m19-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['∇-∇_ad calculado', 'referência 10⁻⁸'], datasets: [{ data: [termo, 1e-8], backgroundColor: [CORES_GRAFICO.marcador, CORES_GRAFICO.curva] }] },
        options: Object.assign(chartBaseOptions('', '', { xScale: { type: 'logarithmic' } }), { indexAxis: 'y' })
      });
    }
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); Ls.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 20: tau_mix =================
  (function () {
    var qs = document.getElementById('m20-q'), Rs = document.getElementById('m20-R'), vs = document.getElementById('m20-vB');
    if (!qs) return;
    var presetSel = document.getElementById('m20-preset');
    var PRESETS_M20 = {
      massiva: { q: 20, R: 450, vB: 2000 },
      sol: { q: 30, R: 100, vB: 5000 }
    };
    var qV = document.getElementById('m20-q-valor'), RV = document.getElementById('m20-R-valor'), vV = document.getElementById('m20-vB-valor');
    var dEl = document.getElementById('m20-d'), tEl = document.getElementById('m20-taumix');
    var chart = null;
    function aplicaPreset() {
      var p = PRESETS_M20[presetSel.value];
      if (!p) return; // "custom": mantém os sliders como estão
      qs.value = p.q; Rs.value = p.R; vs.value = p.vB;
      desenha();
    }
    function desenha() {
      var q = qs.value / 100, R = Rs.value / 100 * RSUN, vB = Number(vs.value);
      qV.textContent = fmt(q, 2); RV.textContent = fmt(Rs.value / 100, 2); vV.textContent = fmt(vB, 0);
      var d = q * R;
      var tau = d / clampMin(vB);
      dEl.textContent = fmtExp(d, 2); tEl.textContent = fmtExp(tau, 2);
      var ANO = 3.156e7;
      var ctx = document.getElementById('m20-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['t_din (~27 min)', 'τ_mix (calculado)', 'τ_KH (~1,6×10⁷ anos)', 'τ_nuc (~10¹⁰ anos)'], datasets: [{ data: [1620, tau, 1.6e7 * ANO, 1e10 * ANO], backgroundColor: [CORES_GRAFICO.curva, CORES_GRAFICO.marcador, CORES_GRAFICO.extra, '#555'] }] },
        options: Object.assign(chartBaseOptions('s', '', { xScale: { type: 'logarithmic' } }), { indexAxis: 'y' })
      });
    }
    function marcaCustom() { presetSel.value = 'custom'; desenha(); }
    qs.addEventListener('input', marcaCustom); Rs.addEventListener('input', marcaCustom); vs.addEventListener('input', marcaCustom);
    presetSel.addEventListener('change', aplicaPreset);
    desenha();
  })();

  // ================= Módulo 21: evolução de X (H->He) =================
  (function () {
    var Ls = document.getElementById('m21-L'), X0s = document.getElementById('m21-X0');
    if (!Ls) return;
    var LV = document.getElementById('m21-L-valor'), X0V = document.getElementById('m21-X0-valor'), mdotEl = document.getElementById('m21-mdot'), tempoEl = document.getElementById('m21-tempo');
    var chart = null;
    var qH = PHI_PP * C * C;
    function desenha() {
      var L = Ls.value / 100 * LSUN, X0 = X0s.value / 100;
      LV.textContent = fmt(Ls.value / 100, 2); X0V.textContent = fmt(X0, 2);
      var mdot = L / qH;
      mdotEl.textContent = fmtExp(mdot, 2);
      var fnuc = 0.1;
      var massaDisponivel = fnuc * MSUN * X0;
      var ANO = 3.156e7;
      var tempo = massaDisponivel / mdot / ANO;
      tempoEl.textContent = fmtExp(tempo, 2);
      var ts = linspace(0, tempo, 60);
      var ys = ts.map(function (t) { return Math.max(0, X0 - mdot * (t * ANO) / (fnuc * MSUN) * X0); });
      var ctx = document.getElementById('m21-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, { type: 'line', data: { datasets: [datasetCurva(ts, ys)] }, options: chartBaseOptions('tempo (anos)', 'X (fração de H no núcleo)', { xScale: { type: 'linear' } }) });
    }
    Ls.addEventListener('input', desenha); X0s.addEventListener('input', desenha);
    desenha();
  })();

})();
