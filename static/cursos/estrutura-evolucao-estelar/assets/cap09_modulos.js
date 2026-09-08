// =====================================================================
// Módulos interativos do Capítulo 9 — Anãs Brancas
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  // ---------------- Constantes físicas (CGS) — ver comuns.js (CONST) ----------------
  var H = CONST.H;
  var C = CONST.C;
  var ME = CONST.ME;
  var NA = CONST.NA;
  var MA = CONST.MA;
  var G = CONST.G;
  var MSUN = CONST.MSUN;
  var REARTH = 6.371e8; // cm
  var ANO = 3.1557e7;

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
  // Integrador da equação de Chandrasekhar (Eq. anb-chandrasekhar-eq):
  //   psi'' + (2/y)psi' + (psi^2 - 1/z_c^2)^(3/2) = 0 ,  psi(0)=1, psi'(0)=0.
  // Caso particular do integrador genérico ShootingODE (comuns.js), o
  // mesmo motor numérico do integrador de Lane-Emden do Capítulo 6 —
  // aqui com threshold=1/z_c (a superfície, onde psi^2=1/z_c^2, e não
  // psi=0) e g(psi)=(psi^2-1/z_c^2)^(3/2). A condição f''(0) vem de
  // expandir psi em série de Taylor e exigir que a própria equação seja
  // satisfeita em y=0 (mesmo truque da caixa de atenção do Cap. 6):
  //   3*psi''(0) = -(1-1/z_c^2)^(3/2)  =>  psi''(0) = -(1-1/z_c^2)^(3/2)/3.
  // =====================================================================
  function gChandra(zc) {
    var inv2 = 1 / (zc * zc);
    return function (psi) {
      var val = psi * psi - inv2;
      return val > 0 ? Math.pow(val, 1.5) : 0;
    };
  }
  function f2at0Chandra(zc) { return -Math.pow(clampMin(1 - 1 / (zc * zc), 0), 1.5) / 3; }

  function solveChandra(zc, nAmostras) {
    var threshold = 1 / zc;
    var res = ShootingODE.solve({ g: gChandra(zc), f2at0: f2at0Chandra(zc), threshold: threshold, dy: 0.01, ymax: 500, nAmostras: nAmostras || 300 });
    return { zc: zc, y1: res.y1, dpsidy1: res.dfEnd, diverged: res.diverged, ys: res.ys, psis: res.fs, dpsis: res.dfs };
  }

  // c1, c2(mu_e): prefatores físicos [Eq. anb-notacao-compacta]
  var C1 = Math.PI * Math.pow(ME, 4) * Math.pow(C, 5) / (3 * Math.pow(H, 3));
  function c2De(mu_e) { return 8 * Math.PI * mu_e * MA * Math.pow(ME * C, 3) / (3 * Math.pow(H, 3)); }

  // massaRaio(zc, mu_e): resolve a equação de Chandrasekhar em z_c e
  // devolve {M (g), R (cm), rhoc (g/cm3), y1, diverged}. [Eqs. anb-massa-final, anb-raio]
  function massaRaio(zc, mu_e, nAmostras) {
    var sol = solveChandra(zc, nAmostras || 10);
    var c2 = c2De(mu_e);
    if (sol.diverged || sol.y1 == null) return { M: null, R: null, rhoc: null, y1: null, diverged: true, sol: sol };
    var alpha2 = 2 * C1 / (Math.PI * G * c2 * c2 * zc * zc);
    var alpha = Math.sqrt(alpha2);
    var M = -4 * Math.PI * Math.pow(alpha, 3) * Math.pow(zc, 3) * c2 * (sol.y1 * sol.y1 * sol.dpsidy1);
    var R = Math.sqrt(2 * C1 / (Math.PI * G)) * sol.y1 / (zc * c2);
    var rhoc = c2 * Math.pow(Math.max(zc * zc - 1, 0), 1.5);
    return { M: M, R: R, rhoc: rhoc, y1: sol.y1, diverged: false, sol: sol };
  }

  function MchDe(mu_e) { return Math.pow(2 / mu_e, 2) * 1.459 * MSUN; }

  // Curva de Lane-Emden (n=3 e n=3/2), via o mesmo ShootingODE, para a
  // sobreposição da "grande unificação" (independe do Cap. 6 — reimplementado
  // aqui localmente para não exigir carregar cap06_modulos.js nesta página).
  function leG(n) { return function (w) { return w > 0 ? Math.pow(w, n) : 0; }; }
  function solveLaneEmdenLocal(n) {
    var res = ShootingODE.solve({ g: leG(n), f2at0: -1 / 3, threshold: 0, dy: 0.01, ymax: 500, nAmostras: 300 });
    return res;
  }
  var LE_N3 = solveLaneEmdenLocal(3);
  var LE_N32 = solveLaneEmdenLocal(1.5);

  window.Chandra = { solve: solveChandra, massaRaio: massaRaio, MchDe: MchDe, c2De: c2De, C1: C1 };

  // ================= Módulo 1 (central): integrador de Chandrasekhar =================
  (function () {
    var zcs = document.getElementById('mch-zc');
    if (!zcs) return;
    var zcV = document.getElementById('mch-zc-valor');
    var y1El = document.getElementById('mch-y1'), dpsiEl = document.getElementById('mch-dpsi'), MEl = document.getElementById('mch-M'), REl = document.getElementById('mch-R');
    var notaEl = document.getElementById('mch-nota');
    var mu_e = 2.0;
    var chart = null;

    function zcDe(t) {
      // t em [0,1] -> z_c em escala que comprime valores grandes (1.003 a ~3000)
      return 1 + Math.pow(10, -3 + 6.6 * t);
    }
    function desenha() {
      var t = Number(zcs.value) / 1000;
      var zc = zcDe(t);
      zcV.textContent = fmt(zc, 3);
      var mr = massaRaio(zc, mu_e, 300);
      if (mr.diverged) { notaEl.textContent = 'Integração não convergiu para este z_c.'; return; }
      y1El.textContent = fmt(mr.y1, 4);
      dpsiEl.textContent = fmt(-mr.y1 * mr.y1 * mr.sol.dpsidy1, 4);
      MEl.textContent = fmt(mr.M / MSUN, 4);
      REl.textContent = fmt(mr.R / REARTH, 3);

      // perfil normalizado rho/rhoc vs y/y1, comparado às soluções de
      // Lane-Emden n=3 (z_c->infty) e n=3/2 (z_c->1)
      var thr2 = 1 / (zc * zc);
      var base = Math.pow(Math.max(1 - thr2, 1e-30), 1.5);
      var xs = mr.sol.ys.map(function (y) { return y / mr.y1; });
      var ys = mr.sol.psis.map(function (psi) { return Math.pow(Math.max(psi * psi - thr2, 0), 1.5) / base; });

      var xsN3 = LE_N3.ys.map(function (y) { return y / LE_N3.y1; });
      var ysN3 = LE_N3.fs.map(function (w) { return Math.pow(Math.max(w, 0), 3); });
      var xsN32 = LE_N32.ys.map(function (y) { return y / LE_N32.y1; });
      var ysN32 = LE_N32.fs.map(function (w) { return Math.pow(Math.max(w, 0), 1.5); });

      var ctx = document.getElementById('mch-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: xsN32.map(function (x, i) { return { x: x, y: ysN32[i] }; }), borderColor: '#999', backgroundColor: 'transparent', borderWidth: 1.6, borderDash: [3, 3], pointRadius: 0, fill: false, tension: 0.15 },
            { data: xsN3.map(function (x, i) { return { x: x, y: ysN3[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'transparent', borderWidth: 1.6, borderDash: [3, 3], pointRadius: 0, fill: false, tension: 0.15 },
            { data: xs.map(function (x, i) { return { x: x, y: ys[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.6, pointRadius: 0, fill: false, tension: 0.15 }
          ]
        },
        options: chartBaseOptions('y/y₁ (raio normalizado)', 'ρ/ρc', { xScale: { type: 'linear', min: 0, max: 1 }, yScale: { type: 'linear', min: 0, max: 1.02 } })
      });

      if (zc < 1.05) notaEl.textContent = 'z_c→1: a curva verde (Chandrasekhar) já quase coincide com a cinza tracejada — Lane-Emden n=3/2 (não-relativístico).';
      else if (zc > 200) notaEl.textContent = 'z_c→∞: a curva verde já quase coincide com a roxa tracejada — Lane-Emden n=3 (ultra-relativístico). M→M_ch.';
      else notaEl.textContent = 'z_c intermediário: a curva verde está entre os dois limites — nem puramente n=3/2 nem n=3.';
    }
    zcs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 2: relação massa-raio construída ao vivo =================
  var mrCurvaCache = {}; // cache por mu_e arredondado, para reaproveitar entre módulos 2 e 3
  function curvaMR(mu_e, nPts) {
    var key = mu_e.toFixed(3);
    if (mrCurvaCache[key]) return mrCurvaCache[key];
    nPts = nPts || 70;
    var ts = linspace(0, 1, nPts);
    var Ms = [], Rs = [], rhocs = [], zcs = [];
    ts.forEach(function (t) {
      var zc = 1 + Math.pow(10, -3 + 4.2 * t);
      var mr = massaRaio(zc, mu_e, 12);
      if (!mr.diverged) { Ms.push(mr.M / MSUN); Rs.push(mr.R / REARTH); rhocs.push(mr.rhoc); zcs.push(zc); }
    });
    var out = { Ms: Ms, Rs: Rs, rhocs: rhocs, zcs: zcs };
    mrCurvaCache[key] = out;
    return out;
  }

  (function () {
    var mues = document.getElementById('mmr-mue'), playBtn = document.getElementById('mmr-play'), resetBtn = document.getElementById('mmr-reset');
    if (!mues) return;
    var mueV = document.getElementById('mmr-mue-valor'), MchEl = document.getElementById('mmr-Mch');
    var chart = null;

    function desenha(frac) {
      var mu_e = Number(mues.value) / 100;
      mueV.textContent = fmt(mu_e, 2);
      var Mch = MchDe(mu_e) / MSUN;
      MchEl.textContent = fmt(Mch, 3);
      var curva = curvaMR(mu_e);
      var nMostrar = Math.max(1, Math.round(frac * curva.Ms.length));
      var MsShow = curva.Ms.slice(0, nMostrar), RsShow = curva.Rs.slice(0, nMostrar);

      var siriusB = { M: 1.018, R: (0.0084 * 6.957e10) / REARTH };

      var ctx = document.getElementById('mmr-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: MsShow.map(function (m, i) { return { x: m, y: RsShow[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.6, pointRadius: 0, fill: false, tension: 0.1 },
            { data: [{ x: siriusB.M, y: siriusB.R }], borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 6, showLine: false },
            { data: [{ x: Mch, y: 0 }, { x: Mch, y: 2.2 }], borderColor: '#963c1e', backgroundColor: 'transparent', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false }
          ]
        },
        options: chartBaseOptions('M / M_☉', 'R / R⊕', { xScale: { type: 'linear', min: 0, max: 1.6 }, yScale: { type: 'linear', min: 0, max: 2.2 } })
      });
    }
    var ctrl = createAnimController(playBtn, resetBtn, 5, desenha, { play: '▶ Construir curva M–R', playing: '❚❚ Construindo…' });
    mues.addEventListener('input', function () { desenha(1); });
    desenha(1);
  })();

  // ================= Módulo 3 (animação): acréscimo até o limite de Chandrasekhar =================
  (function () {
    var canvas = document.getElementById('macre-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('macre-canvas', 360);
    var M0s = document.getElementById('macre-M0'), taxaS = document.getElementById('macre-taxa'), playBtn = document.getElementById('macre-play'), resetBtn = document.getElementById('macre-reset');
    var M0V = document.getElementById('macre-M0-valor'), taxaV = document.getElementById('macre-taxa-valor');
    var Mel = document.getElementById('macre-M'), Rel = document.getElementById('macre-R'), rhocEl = document.getElementById('macre-rhoc'), tEl = document.getElementById('macre-t'), statusEl = document.getElementById('macre-status');
    var mu_e = 2.0;

    function interpR(curva, M) {
      var Ms = curva.Ms, Rs = curva.Rs, rhocs = curva.rhocs;
      if (M <= Ms[0]) return { R: Rs[0], rhoc: rhocs[0] };
      for (var i = 1; i < Ms.length; i++) {
        if (Ms[i] >= M) {
          var t = (M - Ms[i - 1]) / clampMin(Ms[i] - Ms[i - 1]);
          return { R: Rs[i - 1] + t * (Rs[i] - Rs[i - 1]), rhoc: rhocs[i - 1] + t * (rhocs[i] - rhocs[i - 1]) };
        }
      }
      return { R: Rs[Rs.length - 1], rhoc: rhocs[rhocs.length - 1] };
    }

    function desenhaFrame(frac) {
      var M0 = Number(M0s.value) / 100;
      var taxa = Math.pow(10, Number(taxaS.value) / 100); // Msun/ano
      M0V.textContent = fmt(M0, 2); taxaV.textContent = fmtExp(taxa, 2);
      var Mch = MchDe(mu_e) / MSUN;
      var curva = curvaMR(mu_e);
      var Mfinal = Mch * 0.998;
      var M = M0 + frac * (Mfinal - M0);
      var tAnos = (M - M0) / taxa;
      var interp = interpR(curva, M);
      Mel.textContent = fmt(M, 4); Rel.textContent = fmt(interp.R, 3); rhocEl.textContent = fmtExp(interp.rhoc, 2);
      tEl.textContent = fmtExp(tAnos, 2);

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 46, padB = 30, padT = 14, padR = 14;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      var maxM = 1.6, maxR = 2.2;
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('M / M_☉', padL + plotW / 2, h - 8);
      ctx.save(); ctx.translate(14, padT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('R / R⊕', 0, 0); ctx.restore();

      function px(m) { return padL + (m / maxM) * plotW; }
      function py(r) { return h - padB - (r / maxR) * plotH; }

      ctx.strokeStyle = CORES_GRAFICO.curva; ctx.lineWidth = 2; ctx.beginPath();
      curva.Ms.forEach(function (m, i) {
        var x = px(m), y = py(curva.Rs[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.strokeStyle = '#963c1e'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(px(Mch), padT); ctx.lineTo(px(Mch), h - padB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#963c1e'; ctx.textAlign = 'center'; ctx.fillText('M_ch', px(Mch), padT - 2);

      // ponto atual (a estrela acretando)
      var xm = px(M), ym = py(interp.R);
      var perto = M / Mch > 0.97;
      ctx.fillStyle = perto ? CORES_GRAFICO.marcador : '#333';
      ctx.beginPath(); ctx.arc(xm, ym, perto ? 7 : 5, 0, 2 * Math.PI); ctx.fill();

      if (frac >= 0.999) {
        statusEl.innerHTML = '<strong style="color:#963c1e;">M → M_ch:</strong> o raio despenca e a estrela se torna dinamicamente instável — ignição termonuclear descontrolada do carbono, consistente com uma <strong>supernova tipo Ia</strong>. (Cenário <em>single-degenerate</em> ilustrado aqui; o canal <em>double-degenerate</em> — fusão de duas anãs brancas — é discutido no texto e permanece uma alternativa em debate.)';
      } else {
        statusEl.textContent = 'Acretando massa da companheira — a estrela encolhe à medida que ganha massa, percorrendo a curva massa-raio.';
      }
    }
    createAnimController(playBtn, resetBtn, 6, desenhaFrame, { play: '▶ Acretar massa', playing: '❚❚ Acretando…' });
    M0s.addEventListener('input', function () { desenhaFrame(0); });
    taxaS.addEventListener('input', function () { desenhaFrame(0); });
    desenhaFrame(0);
  })();

  // ================= Módulo 4: Mch vs. composição =================
  (function () {
    var mues = document.getElementById('mcomp-mue');
    if (!mues) return;
    var mueV = document.getElementById('mcomp-mue-valor'), MchEl = document.getElementById('mcomp-Mch'), notaEl = document.getElementById('mcomp-nota');
    function desenha() {
      var mu_e = Number(mues.value) / 100;
      mueV.textContent = fmt(mu_e, 2);
      var Mch = MchDe(mu_e) / MSUN;
      MchEl.textContent = fmt(Mch, 3);
      if (Math.abs(mu_e - 2) < 0.01) notaEl.textContent = 'μ_e=2,00 (He/C/O ou O/Ne/Mg, Z=N): reproduz o valor clássico M_ch≈1,459 M_☉.';
      else if (Math.abs(mu_e - 2.15) < 0.01) notaEl.textContent = 'μ_e≈2,15 (composição hipotética rica em ⁵⁶Fe): M_ch≈1,26 M_☉ — sensivelmente menor.';
      else notaEl.textContent = 'Composições mais ricas em nêutrons (menor Z/A, maior μ_e) reduzem M_ch.';
    }
    mues.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 5: perfis internos psi(y) e rho(r) =================
  (function () {
    var zcs = document.getElementById('mperfil-zc');
    if (!zcs) return;
    var zcV = document.getElementById('mperfil-zc-valor');
    var chart = null;
    function desenha() {
      var t = Number(zcs.value) / 1000;
      var zc = 1 + Math.pow(10, -3 + 4.2 * t);
      zcV.textContent = fmt(zc, 3);
      var sol = solveChandra(zc, 250);
      if (sol.diverged) return;
      var thr2 = 1 / (zc * zc);
      var xs = sol.ys;
      var ysPsi = sol.psis;
      var ysRho = sol.psis.map(function (psi) { return Math.pow(Math.max(psi * psi - thr2, 0), 1.5); });
      var maxRho = Math.max.apply(null, ysRho) || 1;
      var ysRhoNorm = ysRho.map(function (v) { return v / maxRho; });
      var ctx = document.getElementById('mperfil-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: xs.map(function (x, i) { return { x: x, y: ysPsi[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false },
            { data: xs.map(function (x, i) { return { x: x, y: ysRhoNorm[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false }
          ]
        },
        options: chartBaseOptions('y', 'ψ(y) (roxo) e ρ/ρc (verde)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    zcs.addEventListener('input', desenha);
    desenha();
  })();

})();
