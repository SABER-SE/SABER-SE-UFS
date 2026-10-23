// =====================================================================
// Módulos interativos do Capítulo 7 — Formação Estelar e Planetária
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  // ---------------- Constantes físicas (CGS) — ver comuns.js (CONST) ----------------
  var G = CONST.G;
  var MSUN = CONST.MSUN;
  var RSUN = CONST.RSUN;
  var LSUN = CONST.LSUN;
  var K_B = CONST.KB;
  var M_H = CONST.MH;
  var UA = CONST.UA;
  var PC = CONST.PC;
  var ANO = 3.1557e7;
  var SIGMA_SB = CONST.SIGMA;

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
  // PARTE 1 — Introdução até "O problema do momento angular"
  // =====================================================================

  // ================= Módulo J1: massa e comprimento de Jeans =================
  (function () {
    var Ts = document.getElementById('mj1-T'), ns = document.getElementById('mj1-n'), mus = document.getElementById('mj1-mu');
    if (!Ts) return;
    var TV = document.getElementById('mj1-T-valor'), nV = document.getElementById('mj1-n-valor'), muV = document.getElementById('mj1-mu-valor');
    var MJel = document.getElementById('mj1-MJ'), lJel = document.getElementById('mj1-lJ'), statusEl = document.getElementById('mj1-status');
    function calc() {
      var T = Number(Ts.value);
      var logn = ns.value / 10;
      var n = Math.pow(10, logn);
      var mu = mus.value / 100;
      var rho = n * mu * M_H;
      var MJ = Math.pow(5 * K_B * T / (G * mu * M_H), 1.5) * Math.pow(3 / (4 * Math.PI * rho), 0.5);
      var lJ = Math.sqrt(Math.PI * K_B * T / (mu * M_H * G * rho));
      return { T: T, n: n, mu: mu, rho: rho, MJ: MJ, lJ: lJ };
    }
    function desenha() {
      var c = calc();
      TV.textContent = fmt(c.T, 0);
      nV.textContent = fmtExp(c.n, 1);
      muV.textContent = fmt(c.mu, 2);
      MJel.textContent = fmt(c.MJ / MSUN, 2);
      lJel.textContent = fmt(c.lJ / PC, 3);
      statusEl.textContent = 'Densidade correspondente: ρ=' + fmtExp(c.rho, 2) + ' g/cm³.';
    }
    Ts.addEventListener('input', desenha); ns.addEventListener('input', desenha); mus.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo J2: relação de dispersão omega^2(k) =================
  (function () {
    var Ts = document.getElementById('mj2-T'), ns = document.getElementById('mj2-n'), mus = document.getElementById('mj2-mu');
    if (!Ts) return;
    var TV = document.getElementById('mj2-T-valor'), nV = document.getElementById('mj2-n-valor'), muV = document.getElementById('mj2-mu-valor');
    var kJel = document.getElementById('mj2-kJ');
    var chart = null;
    function desenha() {
      var T = Number(Ts.value);
      var logn = ns.value / 10;
      var n = Math.pow(10, logn);
      var mu = mus.value / 100;
      var rho0 = n * mu * M_H;
      var cs2 = K_B * T / (mu * M_H);
      var cs = Math.sqrt(cs2);
      var kJ = Math.sqrt(4 * Math.PI * G * rho0 / cs2);
      TV.textContent = fmt(T, 0); nV.textContent = fmtExp(n, 1); muV.textContent = fmt(mu, 2);
      kJel.textContent = fmtExp(kJ, 3);
      var ks = linspace(0, 2.2 * kJ, 120);
      var omega2 = ks.map(function (k) { return cs2 * k * k - 4 * Math.PI * G * rho0; });
      // normaliza pelo maior |omega^2| exibido, para a curva ficar em escala legível
      var escala = Math.max.apply(null, omega2.map(Math.abs));
      var omega2n = omega2.map(function (w) { return w / escala; });
      // as duas parcelas da Eq. de dispersão, na mesma normalização: pressão (c_s^2 k^2) e gravidade (-4 pi G rho_0)
      var pressaoN = ks.map(function (k) { return cs2 * k * k / escala; });
      var gravN = ks.map(function () { return -4 * Math.PI * G * rho0 / escala; });
      var idxJ = nearestIdx(ks, kJ);
      var ctx = document.getElementById('mj2-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(ks, omega2n, CORES_GRAFICO.curva),
            datasetMarcador(ks, idxJ, omega2n, CORES_GRAFICO.marcador),
            { data: [{ x: 0, y: 0 }, { x: ks[ks.length - 1], y: 0 }], borderColor: '#999', borderWidth: 1, borderDash: [4, 3], pointRadius: 0, fill: false },
            { data: ks.map(function (k, i) { return { x: k, y: pressaoN[i] }; }), borderColor: '#7F77DD', borderWidth: 1.8, borderDash: [6, 4], pointRadius: 0, fill: false, tension: 0 },
            { data: ks.map(function (k, i) { return { x: k, y: gravN[i] }; }), borderColor: '#963c1e', borderWidth: 1.8, borderDash: [6, 4], pointRadius: 0, fill: false, tension: 0 }
          ]
        },
        options: chartBaseOptions('k (cm⁻¹)', 'ω²/|ω²|_máx', { xScale: { type: 'linear', ticks: { font: { size: 11 }, color: '#666', maxTicksLimit: 7, callback: function (v) { return v === 0 ? '0' : fmtExp(v, 1); } } } })
      });
    }
    Ts.addEventListener('input', desenha); ns.addEventListener('input', desenha); mus.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (diagrama): nuvem molecular gigante =================
  (function () {
    var svg = document.getElementById('mnuvem-svg');
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 480 380');
  })();

  // ================= Módulo S1: perfil SIS =================
  (function () {
    var Ts = document.getElementById('ms1-T');
    if (!Ts) return;
    var TV = document.getElementById('ms1-T-valor'), csEl = document.getElementById('ms1-cs');
    var chart = null;
    function desenha() {
      var T = Number(Ts.value);
      var mu = 2.3;
      var cs2 = K_B * T / (mu * M_H);
      var cs = Math.sqrt(cs2);
      TV.textContent = fmt(T, 0); csEl.textContent = fmt(cs / 1e5, 3);
      var rs = linspace(Math.log10(0.001 * PC), Math.log10(1 * PC), 80).map(function (lr) { return Math.pow(10, lr); });
      var rho = rs.map(function (r) { return cs2 / (2 * Math.PI * G * r * r); });
      var tff = rs.map(function (r) {
        var Mr = 2 * cs2 * r / G;
        return Math.sqrt(Math.pow(r, 3) / (G * Mr)) / ANO;
      });
      var ctx = document.getElementById('ms1-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: rs.map(function (r, i) { return { x: r / PC, y: rho[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva, borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0, yAxisID: 'y' },
            { data: rs.map(function (r, i) { return { x: r / PC, y: tff[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra, borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          interaction: { intersect: false, mode: 'nearest' },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { type: 'logarithmic', title: { display: true, text: 'r (pc)' }, ticks: { font: { size: 11 }, color: '#666' }, grid: { color: '#e8e6df' } },
            y: { type: 'logarithmic', position: 'left', title: { display: true, text: 'ρ_SIS (g/cm³, verde)' }, ticks: { font: { size: 11 }, color: '#666' }, grid: { color: '#e8e6df' } },
            y1: { type: 'logarithmic', position: 'right', title: { display: true, text: 't_ff(r) (anos, roxo)' }, ticks: { font: { size: 11 }, color: '#666' }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }
    Ts.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo S2: taxa de acréscimo de Shu =================
  (function () {
    var Ts = document.getElementById('ms2-T'), ts = document.getElementById('ms2-t');
    if (!Ts) return;
    var TV = document.getElementById('ms2-T-valor'), tV = document.getElementById('ms2-t-valor');
    var csEl = document.getElementById('ms2-cs'), mdotEl = document.getElementById('ms2-mdot'), mstarEl = document.getElementById('ms2-mstar');
    function calc() {
      var T = Number(Ts.value);
      var mu = 2.3;
      var cs = Math.sqrt(K_B * T / (mu * M_H));
      var mdot = 0.975 * Math.pow(cs, 3) / G;
      var tAnos = Math.pow(10, Number(ts.value) / 100);
      var mstar = mdot * tAnos * ANO;
      return { T: T, cs: cs, mdot: mdot, tAnos: tAnos, mstar: mstar };
    }
    function desenha() {
      var c = calc();
      TV.textContent = fmt(c.T, 0);
      tV.textContent = fmtExp(c.tAnos, 2);
      csEl.textContent = fmt(c.cs / 1e4, 2);
      mdotEl.textContent = fmt(c.mdot * ANO / MSUN, 7) + ' M_☉/ano (' + fmtExp(c.mdot, 2) + ' g/s)';
      mstarEl.textContent = fmt(c.mstar / MSUN, 3);
    }
    Ts.addEventListener('input', desenha); ts.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (animação): colapso inside-out de Shu =================
  (function () {
    var Ts = document.getElementById('mshu-T');
    if (!Ts) return;
    var TV = document.getElementById('mshu-T-valor'), tEl = document.getElementById('mshu-t'), mstarEl = document.getElementById('mshu-mstar');
    var playBtn = document.getElementById('mshu-play'), resetBtn = document.getElementById('mshu-reset');
    var state = setupRawCanvas('mshu-canvas', 360);
    var DURACAO_VISUAL = 8; // segundos de animação para varrer a janela de tempo mostrada
    var TEMPO_MAX_ANOS = 5e4; // janela de tempo física mostrada na animação

    function cs_de(T) { return Math.sqrt(K_B * T / (2.3 * M_H)); }

    function desenhaFrame(frac) {
      var T = Number(Ts.value);
      var cs = cs_de(T);
      var tAnos = frac * TEMPO_MAX_ANOS;
      var tSeg = tAnos * ANO;
      var rFrente = cs * tSeg; // r = cs*t, raio da frente de rarefação
      var mdot = 0.975 * Math.pow(cs, 3) / G;
      var mstar = mdot * tSeg;
      TV.textContent = fmt(T, 0);
      tEl.textContent = fmtExp(tAnos, 2);
      mstarEl.textContent = fmt(mstar / MSUN, 3);

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var raioMax = Math.min(w, h) * 0.42;
      var rEnvelope = raioMax; // envelope estático ocupa toda a área visível (escala fixa)
      var escalaCm = rEnvelope / (cs * (TEMPO_MAX_ANOS * ANO)); // px por cm, calibrado para a frente atingir a borda em t=tmax

      // envelope estático externo (tracejado)
      ctx.strokeStyle = '#7F77DD'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx, cy, rEnvelope, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#444'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('envelope estático (ρ∝r⁻²)', cx, cy - rEnvelope - 8);

      // frente de rarefação
      var rFrentePx = Math.min(rEnvelope, rFrente * escalaCm);
      if (rFrentePx > 1) {
        ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(cx, cy, rFrentePx, 0, 2 * Math.PI); ctx.stroke();
      }

      // região em queda livre: setas convergentes dentro da frente
      ctx.strokeStyle = CORES_GRAFICO.curva; ctx.fillStyle = CORES_GRAFICO.curva; ctx.lineWidth = 1.6;
      var nSetas = 12;
      for (var i = 0; i < nSetas; i++) {
        var ang = (2 * Math.PI * i) / nSetas;
        var r0 = Math.max(8, rFrentePx * 0.92);
        var r1 = Math.max(4, rFrentePx * 0.22);
        var x0 = cx + r0 * Math.cos(ang), y0 = cy + r0 * Math.sin(ang);
        var x1 = cx + r1 * Math.cos(ang), y1 = cy + r1 * Math.sin(ang);
        if (rFrentePx > 6) {
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          var ah = 5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 + ah * Math.cos(ang + 2.6), y1 + ah * Math.sin(ang + 2.6));
          ctx.lineTo(x1 + ah * Math.cos(ang - 2.6), y1 + ah * Math.sin(ang - 2.6));
          ctx.closePath(); ctx.fill();
        }
      }
      // protoestrela central
      ctx.fillStyle = CORES_GRAFICO.marcador;
      ctx.beginPath(); ctx.arc(cx, cy, 4 + 3 * Math.min(1, mstar / MSUN), 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#333'; ctx.font = '12px sans-serif';
      ctx.fillText('protoestrela (M⋆=' + fmt(mstar / MSUN, 2) + ' M_☉)', cx, cy + 16);
      ctx.textAlign = 'left';
      ctx.fillText('r = c_s t = ' + fmtExp(rFrente, 2) + ' cm', 8, h - 10);
    }

    createAnimController(playBtn, resetBtn, DURACAO_VISUAL, desenhaFrame, { play: '▶ Iniciar colapso', playing: '❚❚ Colapsando…' });
    Ts.addEventListener('input', function () { desenhaFrame(0); });
    desenhaFrame(0);
  })();

  // ================= Módulo Rc: raio centrífugo =================
  (function () {
    var R0s = document.getElementById('mrc-R0'), Om0s = document.getElementById('mrc-Om0'), Ms = document.getElementById('mrc-Mstar');
    if (!R0s) return;
    var R0V = document.getElementById('mrc-R0-valor'), Om0V = document.getElementById('mrc-Om0-valor'), MV = document.getElementById('mrc-Mstar-valor');
    var jEl = document.getElementById('mrc-j'), RcEl = document.getElementById('mrc-Rc');
    function desenha() {
      var R0 = (R0s.value / 100) * PC;
      var Om0 = Math.pow(10, Number(Om0s.value) / 10);
      var Mstar = (Ms.value / 100) * MSUN;
      R0V.textContent = fmt(R0s.value / 100, 3);
      Om0V.textContent = fmtExp(Om0, 2);
      MV.textContent = fmt(Ms.value / 100, 2);
      var j = Om0 * R0 * R0;
      var Rc = (j * j) / (G * Mstar);
      jEl.textContent = fmtExp(j, 2);
      RcEl.textContent = fmt(Rc / UA, 1);
    }
    R0s.addEventListener('input', desenha); Om0s.addEventListener('input', desenha); Ms.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (animação): formação do disco por deposição =================
  // Versão animada da Eq. do raio centrífugo (R_c = j^2/(G M)). Simulação
  // meridional (eixo de rotação vertical, cilíndrico rho = distância ao eixo),
  // em unidades GM=1 e comprimento = R_c da camada de maior j. Cada partícula
  // conserva j (movimento axissimétrico) e sente
  //   a_rho = -GM rho/r^3 + j^2/rho^3 ,   a_z = -GM z/r^3 .
  // Ao cruzar o plano médio o gás "choca" com o do outro hemisfério: z e v_z
  // são zerados e entra um arrasto radial (dissipação) — é isso, e só isso,
  // que faz o material estacionar em R_c (onde j^2/rho^3 = GM/rho^2).
  (function () {
    var playBtn = document.getElementById('mdisco-play'), resetBtn = document.getElementById('mdisco-reset');
    var canvas = document.getElementById('mdisco-canvas');
    if (!canvas) return;
    var densS = document.getElementById('mdisco-dens'), vecC = document.getElementById('mdisco-vet');
    var OmS = document.getElementById('mdisco-Om'), MsS = document.getElementById('mdisco-M');
    var densV = document.getElementById('mdisco-dens-valor'), OmV = document.getElementById('mdisco-Om-valor'), MsV = document.getElementById('mdisco-M-valor');
    var leitura = document.getElementById('mdisco-leitura');
    var state = setupRawCanvas('mdisco-canvas', 400);

    var DURACAO = 14;      // s de animação
    var TMAX = 9;          // tempo simulado final (unidade (R_c^3/GM)^(1/2))
    var R_INI = 2.2;       // raio inicial (em R_c,max) — fora de escala, ver nota
    var GAMMA = 1.2;       // arrasto radial no plano médio (unid. de sqrt(GM/R_c^3))
    var RHO_MIN = 0.02;
    var TRACADORAS = [0.25, 0.5, 0.75, 1.0];   // j / j_max
    var LREF = 46;         // px: comprimento do vetor em R_c (escala comprimida, expoente 1/4)

    // ---- física pura (dimensionless) ----
    function acel(p) {
      var rho = Math.max(p.rho, RHO_MIN), r2 = rho * rho + p.z * p.z, r3 = Math.pow(r2, 1.5);
      var ar = -rho / r3 + p.j * p.j / (rho * rho * rho);
      var az = -p.z / r3;
      if (p.disco) { ar -= GAMMA * p.vr; az = 0; }
      return [ar, az];
    }
    function passo(p, dt) {   // velocidade-Verlet
      var a = acel(p);
      p.vr += 0.5 * a[0] * dt; p.vz += 0.5 * a[1] * dt;
      var zAnt = p.z;
      p.rho = Math.max(RHO_MIN, p.rho + p.vr * dt); p.z += p.vz * dt;
      if (!p.disco && (zAnt * p.z <= 0)) { p.disco = true; p.z = 0; p.vz = 0; }
      if (p.disco) { p.z = 0; p.vz = 0; }
      a = acel(p);
      p.vr += 0.5 * a[0] * dt; p.vz += 0.5 * a[1] * dt;
      if (p.disco) p.vz = 0;
    }
    function avanca(p, tAlvo) {
      while (p.t < tAlvo - 1e-12) {
        var r = Math.sqrt(p.rho * p.rho + p.z * p.z);
        var dt = Math.min(0.01, 0.04 * Math.pow(Math.max(r, RHO_MIN), 1.5), tAlvo - p.t);
        passo(p, dt); p.t += dt;
        if (p.disco && p.rho <= RHO_MIN) { p.t = tAlvo; }
      }
    }
    function nova(jRel, sinTh, lado, atraso) {
      // início em repouso radial a r = R_INI, ângulo polar th (do eixo); j = jRel (rotação rígida => j ∝ sin^2 th)
      var cosTh = Math.sqrt(Math.max(0, 1 - sinTh * sinTh));
      return { j: jRel, rho: R_INI * sinTh, z: R_INI * cosTh, vr: 0, vz: 0, disco: false, t: 0,
               lado: lado, atraso: atraso, hist: [] };
    }

    var particulas = [], tracadoras = [], lastT = 0;
    function constroi() {
      var N = Number(densS.value);
      particulas = [];
      for (var i = 0; i < N; i++) {
        var u = Math.random();                       // cos(th) ~ uniforme => j = sin^2 th
        var sinTh = Math.sqrt(1 - u * u);
        var jRel = sinTh * sinTh;
        var cosSinal = Math.random() < 0.5 ? 1 : -1; // hemisfério norte/sul
        var p = nova(jRel, Math.max(0.05, sinTh), Math.random() < 0.5 ? -1 : 1, Math.random() * 0.8);
        p.z *= cosSinal;
        particulas.push(p);
      }
      tracadoras = TRACADORAS.map(function (jr, k) {
        var p = nova(jr, Math.sqrt(jr), k % 2 ? 1 : -1, 0);
        p.traco = k; return p;
      });
    }
    function sincroniza(t) {
      var tSim = t * TMAX;
      particulas.forEach(function (p) { avanca(p, Math.max(0, tSim - p.atraso)); });
      tracadoras.forEach(function (p) {
        avanca(p, tSim);
        p.hist.push([p.rho, p.z]); if (p.hist.length > 120) p.hist.shift();
      });
      lastT = t;
    }

    // ---- números físicos (usa CONST via G, MSUN, UA, PC) ----
    function fisica() {
      var Om0 = Math.pow(10, OmS.value / 10), M = MsS.value / 100 * MSUN, R0 = 0.1 * PC;
      var jmax = Om0 * R0 * R0;
      var RcMax = jmax * jmax / (G * M);
      var tU = Math.sqrt(Math.pow(RcMax, 3) / (G * M)) / ANO;
      return { Om0: Om0, M: M, jmax: jmax, RcMax: RcMax, tU: tU };
    }
    function atualizaRotulos() {
      var f = fisica();
      densV.textContent = densS.value;
      OmV.textContent = fmtExp(f.Om0, 2);
      MsV.textContent = fmt(MsS.value / 100, 2);
      leitura.innerHTML = '\\(j_{\\max}=\\Omega_0R_0^2=\\)<strong>' + fmtExp(f.jmax, 2) + '</strong> cm²/s &middot; '
        + '\\(R_c=j^2/(GM_\\star)=\\)<strong>' + fmt(f.RcMax / UA, 0) + '</strong> UA '
        + '(camada mais externa, \\(R_0=0{,}1\\,\\)pc) &middot; unidade de tempo \\(\\sqrt{R_c^3/GM_\\star}\\approx\\)<strong>'
        + fmtExp(f.tU, 1) + '</strong> anos';
      if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([leitura]);
      return f;
    }

    // ---- desenho ----
    function seta(ctx, x0, y0, x1, y1, cor, larg, tracejado) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy);
      if (L < 2) return;
      ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = larg; ctx.setLineDash(tracejado || []);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
      var ux = dx / L, uy = dy / L, h = 7;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - h * ux + 0.5 * h * uy, y1 - h * uy - 0.5 * h * ux);
      ctx.lineTo(x1 - h * ux - 0.5 * h * uy, y1 - h * uy + 0.5 * h * ux); ctx.closePath(); ctx.fill();
    }
    var COR_G = '#963c1e', COR_C = '#17805f', COR_J = '#5b4fc4';
    function desenhaFrame(t) {
      if (t < lastT - 1e-9) { constroi(); lastT = 0; }
      sincroniza(t);
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h * 0.5;
      var esc = Math.min(w * 0.46, h * 0.46) / (R_INI * 1.05);
      // disco-referência: R_c das traçadoras
      ctx.setLineDash([3, 4]); ctx.strokeStyle = '#c9c7bf'; ctx.lineWidth = 1;
      tracadoras.forEach(function (p) {
        var Rc = p.j * p.j;
        [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.moveTo(cx + s * Rc * esc, cy - 10); ctx.lineTo(cx + s * Rc * esc, cy + 10); ctx.stroke(); });
      });
      ctx.setLineDash([]);
      // população de fundo
      ctx.fillStyle = CORES_GRAFICO.curva;
      ctx.globalAlpha = 0.65;
      for (var i = 0; i < particulas.length; i++) {
        var p = particulas[i];
        ctx.fillRect(cx + p.lado * p.rho * esc - 1.1, cy - p.z * esc - 1.1, 2.2, 2.2);
      }
      ctx.globalAlpha = 1;
      // protoestrela
      ctx.fillStyle = CORES_GRAFICO.marcador;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 2 * Math.PI); ctx.fill();
      // traçadoras
      var mostraVet = vecC && vecC.checked;
      tracadoras.forEach(function (p) {
        var x = cx + p.lado * p.rho * esc, y = cy - p.z * esc;
        ctx.strokeStyle = 'rgba(91,79,196,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath();
        p.hist.forEach(function (q, k) { var xx = cx + p.lado * q[0] * esc, yy = cy - q[1] * esc; if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); });
        ctx.stroke();
        ctx.fillStyle = '#16233a'; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 2 * Math.PI); ctx.fill();
        if (!mostraVet) return;
        var rho = Math.max(p.rho, RHO_MIN), r = Math.sqrt(rho * rho + p.z * p.z);
        var g = 1 / (r * r), c = p.j * p.j / (rho * rho * rho);
        var aRef = 1 / (p.j * p.j * p.j * p.j);          // g em R_c (= c em R_c)
        var Lg = LREF * Math.pow(g / aRef, 0.25), Lc = LREF * Math.pow(c / aRef, 0.25);
        Lg = Math.min(Lg, 130); Lc = Math.min(Lc, 130);
        // gravidade: para a estrela (direção (-rho, -z) no meridional)
        var ux = -p.lado * rho / r, uy = p.z / r;       // tela: x=lado*rho, y=-z
        seta(ctx, x, y, x + ux * Lg, y + uy * Lg, COR_G, 2.4);
        // centrífuga: radial no plano, para fora do eixo
        seta(ctx, x, y, x + p.lado * Lc, y, COR_C, 2.4);
        // j: axial (perpendicular ao plano do disco), módulo fixo, tracejado
        seta(ctx, x, y, x, y - LREF * 0.9, COR_J, 3, [5, 3]);
      });
      // legenda / rótulos
      ctx.font = '12px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#444';
      ctx.fillText('protoestrela', cx + 9, cy + 18);
      if (mostraVet) {
        var lx = 10, ly = 18;
        seta(ctx, lx, ly, lx + 26, ly, COR_G, 2.4); ctx.fillStyle = COR_G; ctx.fillText('gravidade GM/r² (para dentro)', lx + 34, ly + 4);
        ly += 20; seta(ctx, lx, ly, lx + 26, ly, COR_C, 2.4); ctx.fillStyle = COR_C; ctx.fillText('centrífuga j²/ϖ³ (para fora)', lx + 34, ly + 4);
        ly += 20; seta(ctx, lx, ly + 6, lx, ly - 10, COR_J, 3, [5, 3]); ctx.fillStyle = COR_J; ctx.fillText('j: grandeza conservada, NÃO é força', lx + 12, ly + 4);
      }
      var done = tracadoras.map(function (p) { return p.disco && Math.abs(p.vr) < 0.03; });
      ctx.fillStyle = '#16233a';
      var estreito = w < 640, f = fisica();
      ctx.textAlign = estreito ? 'left' : 'right';
      var txt = tracadoras.map(function (p) {
        return 'j/j_max=' + fmt(p.j, 2) + ' → R_c=' + fmt(p.j * p.j * f.RcMax / UA, 0) + ' UA';
      });
      txt.forEach(function (s, k) { ctx.fillText(s + (done[k] ? ' ✔' : ''), estreito ? 10 : w - 10, (estreito ? h - 70 : 18) + 16 * k); });
      ctx.textAlign = 'left';
    }
    var ctrl = createAnimController(playBtn, resetBtn, DURACAO, desenhaFrame, { play: '▶ Animar deposição', playing: '❚❚ Depositando…' });
    function recomeca() { var t = lastT; constroi(); lastT = 0; atualizaRotulos(); desenhaFrame(t); }
    [densS, OmS, MsS].forEach(function (el) { if (el) el.addEventListener('input', recomeca); });
    if (vecC) vecC.addEventListener('change', function () { desenhaFrame(lastT); });
    var rz = null;
    window.addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(function () { var s = setupRawCanvas('mdisco-canvas', 400); state.w = s.w; state.ctx = s.ctx; desenhaFrame(lastT); }, 150);
    });
    constroi(); atualizaRotulos(); desenhaFrame(0);
    // gancho de teste (auditoria): integra uma traçadora até o fim e devolve o raio onde parou
    window.__mdiscoTeste = function (jRel) {
      var p = nova(jRel, Math.sqrt(jRel), 1, 0); avanca(p, 60);
      return { rho: p.rho, Rc: jRel * jRel, disco: p.disco, vr: p.vr, g: 1 / (p.rho * p.rho), c: jRel * jRel / Math.pow(p.rho, 3), fisica: fisica() };
    };
  })();

  // =====================================================================
  // PARTE 2 — PMS, Classes observacionais, Discos protoplanetários
  // =====================================================================

  var TSUN = 5772; // K

  // ================= Módulo PMS: traços de Hayashi e Henyey =================
  (function () {
    var Ms = document.getElementById('mhr-M');
    if (!Ms) return;
    var MV = document.getElementById('mhr-M-valor'), tauEl = document.getElementById('mhr-tau');
    var chart = null;

    function Lzams(M) { return Math.pow(M, 3.5); } // Lsun
    function Rzams(M) { return Math.pow(M, 0.75); } // Rsun
    function Tzams(M) {
      var L = Lzams(M), R = Rzams(M);
      return TSUN * Math.pow(L, 0.25) / Math.sqrt(R);
    }
    function THayashi(M) { return 4000 * Math.pow(M, 0.05); }
    function tauKH(M) { return 4e7 * Math.pow(M, -2); } // anos; ajustado às 2 âncoras do Exemplo (0,5 e 2 Msol)

    function trilha(M) {
        var Tzams_ = Tzams(M), Lzams_ = Lzams(M), TH = THayashi(M);
        var Ltop = 50 * M; // luminosidade esquemática da birthline
        var fatorHenyey = 1 + 2 * Math.max(0, Math.log10(M / 0.5));
        var Lhenyey = Lzams_ * fatorHenyey;
        var pontos = [];
        // fase Hayashi: T=TH fixo, L de Ltop até Lhenyey (log-espaçado)
        var nH = 25;
        for (var i = 0; i <= nH; i++) {
          var logL = Math.log10(Ltop) + (Math.log10(Lhenyey) - Math.log10(Ltop)) * i / nH;
          pontos.push({ T: TH, L: Math.pow(10, logL) });
        }
        // fase Henyey: L≈Lhenyey (levemente decrescente até Lzams), T de TH até Tzams
        var nY = 25;
        for (var j = 1; j <= nY; j++) {
          var frac = j / nY;
          var T = TH + (Tzams_ - TH) * frac;
          var L = Lhenyey + (Lzams_ - Lhenyey) * frac;
          pontos.push({ T: T, L: L });
        }
        return pontos;
    }

    function desenha() {
      var M = Ms.value / 100;
      MV.textContent = fmt(M, 2);
      var tau = tauKH(M);
      tauEl.textContent = fmtExp(tau, 2);
      var pontos = trilha(M);
      var xs = pontos.map(function (p) { return p.T; });
      var ys = pontos.map(function (p) { return Math.log10(p.L); });
      var ctx = document.getElementById('mhr-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(xs, ys, CORES_GRAFICO.curva),
            datasetMarcador(xs, xs.length - 1, ys, CORES_GRAFICO.marcador),
            datasetMarcador(xs, 0, ys, CORES_GRAFICO.extra)
          ]
        },
        options: chartBaseOptions('T_eff (K) — eixo invertido, como no diagrama HR', 'log₁₀(L/L_☉)', {
          xScale: { type: 'linear', reverse: true },
          yScale: { type: 'linear' }
        })
      });
    }
    Ms.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo SED: Classes 0/I/II/III =================
  (function () {
    var sel = document.getElementById('msed-classe');
    if (!sel) return;
    var chart = null;
    var lam = linspace(-1, 3.2, 100); // log10(lambda / micron)

    function gauss(x, mu, sig, amp) { return amp * Math.exp(-Math.pow(x - mu, 2) / (2 * sig * sig)); }

    function componentes(classe) {
      // envelope (frio, FIR/submm), disco (morno, IR médio), fotosfera (quente, óptico/NIR)
      var env = lam.map(function (x) { return gauss(x, 2.3, 0.55, [1.9, 1.6, 0.15, 0][classe]); });
      var disco = lam.map(function (x) { return gauss(x, 1.3, 0.55, [0, 0.9, 1.1, 0.1][classe]); });
      var foto = lam.map(function (x) { return gauss(x, 0.1, 0.35, [0.05, 0.15, 0.7, 1.9][classe]); });
      var total = lam.map(function (i, idx) { return env[idx] + disco[idx] + foto[idx]; });
      return { env: env, disco: disco, foto: foto, total: total };
    }
    function desenha() {
      var classe = Number(sel.value);
      var c = componentes(classe);
      var ctx = document.getElementById('msed-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: lam.map(function (x, i) { return { x: x, y: c.env[i] }; }), borderColor: '#963c1e', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0.3 },
            { data: lam.map(function (x, i) { return { x: x, y: c.disco[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0.3 },
            { data: lam.map(function (x, i) { return { x: x, y: c.foto[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0.3 },
            { data: lam.map(function (x, i) { return { x: x, y: c.total[i] }; }), borderColor: '#222', backgroundColor: 'transparent', borderWidth: 2.8, pointRadius: 0, fill: false, tension: 0.3 }
          ]
        },
        options: chartBaseOptions('log₁₀(λ/μm)', 'log₁₀(νF_ν) [unid. arbitrárias]', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    sel.addEventListener('change', desenha);
    desenha();
  })();

  // ================= Módulo Disco-geometria: rotação kepleriana e H/r =================
  (function () {
    var Ms = document.getElementById('mdgeo-M'), rs = document.getElementById('mdgeo-r');
    if (!Ms) return;
    var MV = document.getElementById('mdgeo-M-valor'), rV = document.getElementById('mdgeo-r-valor');
    var HrEl = document.getElementById('mdgeo-Hr'), HEl = document.getElementById('mdgeo-H'), csEl = document.getElementById('mdgeo-cs'), vKEl = document.getElementById('mdgeo-vK');
    var chart = null;

    function Tperfil(r_UA) { return 280 * Math.pow(r_UA, -0.5); }
    function calc(Mstar, r_UA) {
      var r = r_UA * UA;
      var T = Tperfil(r_UA);
      var cs = Math.sqrt(K_B * T / (2.3 * M_H));
      var OmegaK = Math.sqrt(G * Mstar * MSUN / Math.pow(r, 3));
      var vK = OmegaK * r;
      var H = cs / OmegaK;
      return { T: T, cs: cs, OmegaK: OmegaK, vK: vK, H: H, Hr: H / r };
    }
    function desenha() {
      var Mstar = Ms.value / 100;
      var r_UA = Number(rs.value) / 100;
      MV.textContent = fmt(Mstar, 2);
      rV.textContent = fmt(r_UA, 2);
      var c = calc(Mstar, r_UA);
      HrEl.textContent = fmt(c.Hr, 4);
      HEl.textContent = fmtExp(c.H, 2);
      csEl.textContent = fmt(c.cs / 1e5, 3);
      vKEl.textContent = fmt(c.vK / 1e5, 2);

      // diagrama de estrutura vertical (flaring): H(r) para uma faixa de raios
      var rs_UA = linspace(0.3, 60, 60);
      var Hrs = rs_UA.map(function (rr) { return calc(Mstar, rr).Hr; });
      var ctx = document.getElementById('mdgeo-canvas').getContext('2d');
      if (chart) chart.destroy();
      var idx = nearestIdx(rs_UA, r_UA);
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [datasetCurva(rs_UA, Hrs, CORES_GRAFICO.curva), datasetMarcador(rs_UA, idx, Hrs, CORES_GRAFICO.marcador)] },
        options: chartBaseOptions('r (UA)', 'H/r (razão de aspecto)', { xScale: { type: 'logarithmic' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    Ms.addEventListener('input', desenha); rs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo Disco-alpha: viscosidade e tempo viscoso =================
  (function () {
    var as = document.getElementById('mdvisc-alpha'), rs = document.getElementById('mdvisc-r');
    if (!as) return;
    var aV = document.getElementById('mdvisc-alpha-valor'), rV = document.getElementById('mdvisc-r-valor');
    var nuEl = document.getElementById('mdvisc-nu'), tviscEl = document.getElementById('mdvisc-tvisc');
    function calc(alpha, r_UA) {
      var r = r_UA * UA;
      var T = 280 * Math.pow(r_UA, -0.5);
      var cs = Math.sqrt(K_B * T / (2.3 * M_H));
      var OmegaK = Math.sqrt(G * MSUN / Math.pow(r, 3));
      var H = cs / OmegaK;
      var nu = alpha * cs * H;
      var tvisc = (r * r) / nu;
      return { nu: nu, tvisc: tvisc, H: H, cs: cs };
    }
    function desenha() {
      var alpha = Math.pow(10, Number(as.value) / 100);
      var r_UA = Math.pow(10, Number(rs.value) / 100);
      aV.textContent = fmtExp(alpha, 2);
      rV.textContent = fmt(r_UA, 2);
      var c = calc(alpha, r_UA);
      nuEl.textContent = fmtExp(c.nu, 2);
      tviscEl.textContent = fmtExp(c.tvisc / ANO, 2);
    }
    as.addEventListener('input', desenha); rs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (animação): evolução viscosa do disco =================
  (function () {
    var playBtn = document.getElementById('mdevol-play'), resetBtn = document.getElementById('mdevol-reset');
    var canvas = document.getElementById('mdevol-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mdevol-canvas', 320);
    var DURACAO = 7;
    function sigma(x, t) {
      // perfil esquemático inspirado na solução autossemelhante de
      // Lynden-Bell & Pringle (1974): um anel inicial em x0 se espalha —
      // acréscimo para dentro (pico migra e cai), espalhamento para fora
      // (cauda externa cresce) — sem pretender ser a solução exata.
      var x0 = 1.0;
      var largura = 0.18 + 0.9 * t;
      var pico = Math.max(0.05, x0 * (1 - 0.55 * t));
      return Math.exp(-Math.pow((x - pico) / largura, 2)) * (1 + 1.4 * t * Math.exp(-x / (0.4 + 2.5 * t)));
    }
    function desenhaFrame(t) {
      var xs = linspace(0.02, 4, 140);
      var ys = xs.map(function (x) { return sigma(x, t); });
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 40, padB = 28, padT = 14, padR = 14;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      var maxY = 1.6;
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('r (unid. arbitrárias)', padL + plotW / 2, h - 6);
      ctx.save(); ctx.translate(12, padT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('Σ(r,t)', 0, 0); ctx.restore();
      ctx.strokeStyle = CORES_GRAFICO.curva; ctx.lineWidth = 2.4; ctx.beginPath();
      xs.forEach(function (x, i) {
        var px = padL + (x / 4) * plotW;
        var py = h - padB - Math.min(1, ys[i] / maxY) * plotH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.fillStyle = CORES_GRAFICO.marcador; ctx.textAlign = 'left'; ctx.font = '12px sans-serif';
      ctx.fillText('t/t_visc = ' + t.toFixed(2), padL + 6, padT + 14);
      ctx.fillText('acréscimo para dentro, espalhamento para fora', padL + 6, padT + 30);
    }
    createAnimController(playBtn, resetBtn, DURACAO, desenhaFrame, { play: '▶ Animar evolução viscosa', playing: '❚❚ Evoluindo…' });
    desenhaFrame(0);
  })();

  // ================= Módulo Temperatura: viscoso vs. irradiação =================
  (function () {
    var mdots = document.getElementById('mdtemp-mdot');
    if (!mdots) return;
    var mdotV = document.getElementById('mdtemp-mdot-valor'), rcrossEl = document.getElementById('mdtemp-rcross');
    var chart = null;
    function Tvisc(r_cm, Mdot) {
      var num = 3 * G * MSUN * Mdot;
      var den = 8 * Math.PI * SIGMA_SB * Math.pow(r_cm, 3);
      return Math.pow(num / den, 0.25);
    }
    function Tirrad(r_UA) { return 280 * Math.pow(r_UA, -0.5); }
    function desenha() {
      var Mdot = Math.pow(10, Number(mdots.value) / 100) * MSUN / ANO;
      mdotV.textContent = fmtExp(Mdot * ANO / MSUN, 2);
      var rs_UA = linspace(-1, 2, 90).map(function (l) { return Math.pow(10, l); });
      var Tv = rs_UA.map(function (r) { return Tvisc(r * UA, Mdot); });
      var Ti = rs_UA.map(function (r) { return Tirrad(r); });
      // encontra cruzamento aproximado (onde Tv cruza Ti)
      var rcross = null;
      for (var i = 1; i < rs_UA.length; i++) {
        if ((Tv[i - 1] - Ti[i - 1]) * (Tv[i] - Ti[i]) < 0) { rcross = rs_UA[i]; break; }
      }
      rcrossEl.textContent = rcross ? fmt(rcross, 3) : '— (irradiação domina em toda a faixa mostrada)';
      var ctx = document.getElementById('mdtemp-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: rs_UA.map(function (r, i) { return { x: r, y: Tv[i] }; }), borderColor: CORES_GRAFICO.marcador, backgroundColor: 'transparent', borderWidth: 2.3, pointRadius: 0, fill: false },
            { data: rs_UA.map(function (r, i) { return { x: r, y: Ti[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.3, pointRadius: 0, fill: false }
          ]
        },
        options: chartBaseOptions('r (UA)', 'T(r) (K)', { xScale: { type: 'logarithmic' }, yScale: { type: 'logarithmic' } })
      });
    }
    mdots.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: linha de gelo =================
  (function () {
    var Ls = document.getElementById('mgelo-L');
    if (!Ls) return;
    var LV = document.getElementById('mgelo-L-valor'), rgeloEl = document.getElementById('mgelo-rgelo');
    var chart = null;
    var TGELO = 170;
    function Tperfil(r_UA, L) { return 280 * Math.pow(L, 0.25) * Math.pow(r_UA, -0.5); }
    function desenha() {
      var L = Math.pow(10, Number(Ls.value) / 100);
      LV.textContent = fmt(L, 2);
      var rgelo = Math.pow(280 * Math.pow(L, 0.25) / TGELO, 2);
      rgeloEl.textContent = fmt(rgelo, 2);
      var rs_UA = linspace(-0.3, 1.7, 80).map(function (l) { return Math.pow(10, l); });
      var Ts = rs_UA.map(function (r) { return Tperfil(r, L); });
      var refs = [
        { r: 2.2, nome: 'borda interna do cinturão' },
        { r: 3.2, nome: 'cinturão de asteroides' },
        { r: 5.2, nome: 'Júpiter' },
        { r: 9.5, nome: 'Saturno' }
      ];
      var ctx = document.getElementById('mgelo-canvas').getContext('2d');
      if (chart) chart.destroy();
      var idxGelo = nearestIdx(rs_UA, rgelo);
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(rs_UA, Ts, CORES_GRAFICO.curva),
            datasetMarcador(rs_UA, idxGelo, Ts, CORES_GRAFICO.marcador)
          ]
        },
        options: chartBaseOptions('r (UA)', 'T(r) (K)', { xScale: { type: 'logarithmic' }, yScale: { type: 'linear' } })
      });
    }
    Ls.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: tempo de vida dos discos =================
  (function () {
    var ts = document.getElementById('mdvida-t');
    if (!ts) return;
    var tV = document.getElementById('mdvida-t-valor'), fracEl = document.getElementById('mdvida-frac');
    var chart = null;
    var TAU = 3.1; // Myr, calibrado às referências citadas no texto
    function frac(tMyr) { return Math.exp(-tMyr / TAU); }
    function desenha() {
      var t = Number(ts.value) / 10;
      tV.textContent = fmt(t, 1);
      fracEl.textContent = fmt(100 * frac(t), 1);
      var ts_ = linspace(0, 15, 80);
      var fs = ts_.map(frac);
      var idx = nearestIdx(ts_, t);
      var refs = [[2, 0.45], [3, 0.45], [5, 0.20], [9, 0.05]];
      var ctx = document.getElementById('mdvida-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(ts_, fs, CORES_GRAFICO.curva),
            datasetMarcador(ts_, idx, fs, CORES_GRAFICO.marcador),
            { data: refs.map(function (p) { return { x: p[0], y: p[1] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra, pointRadius: 5, showLine: false }
          ]
        },
        options: chartBaseOptions('idade (Myr)', 'fração de estrelas com disco', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0, max: 1 } })
      });
    }
    ts.addEventListener('input', desenha);
    desenha();
  })();

  // =====================================================================
  // PARTE 3 — Acréscimo magnetosférico e Síntese
  // =====================================================================

  // ================= Módulo TTauri: raios de truncamento/corrotação, impacto e luminosidade =================
  (function () {
    var Bs = document.getElementById('mtt-B'), Mdots = document.getElementById('mtt-Mdot');
    if (!Bs) return;
    var Ms = document.getElementById('mtt-M'), Rs = document.getElementById('mtt-R'), Ps = document.getElementById('mtt-P');
    var BV = document.getElementById('mtt-B-valor'), MdotV = document.getElementById('mtt-Mdot-valor');
    var MV = document.getElementById('mtt-M-valor'), RV = document.getElementById('mtt-R-valor'), PV = document.getElementById('mtt-P-valor');
    var RAel = document.getElementById('mtt-RA'), RAstarEl = document.getElementById('mtt-RA-Rstar');
    var Rcoel = document.getElementById('mtt-Rco'), RcostarEl = document.getElementById('mtt-Rco-Rstar');
    var regimeEl = document.getElementById('mtt-regime');
    var vimpEl = document.getElementById('mtt-vimp'), TchoqueEl = document.getElementById('mtt-Tchoque'), LaccEl = document.getElementById('mtt-Lacc');
    function desenha() {
      var B = Math.pow(10, Number(Bs.value) / 100); // G
      var Mdot = Math.pow(10, Number(Mdots.value) / 100) * MSUN / ANO; // g/s
      var Mstar = (Ms.value / 100) * MSUN;
      var Rstar = (Rs.value / 100) * RSUN;
      var Pstar = Number(Ps.value) / 10 * 86400; // s

      BV.textContent = fmtExp(B, 2);
      MdotV.textContent = fmtExp(Mdot * ANO / MSUN, 2);
      MV.textContent = fmt(Ms.value / 100, 2);
      RV.textContent = fmt(Rs.value / 100, 2);
      PV.textContent = fmt(Number(Ps.value) / 10, 1);

      var RA = Math.pow((Math.pow(B, 4) * Math.pow(Rstar, 12)) / (8 * G * Mstar * Mdot * Mdot), 1 / 7);
      var Rco = Math.pow(G * Mstar * Pstar * Pstar / (4 * Math.PI * Math.PI), 1 / 3);
      RAel.textContent = fmtExp(RA, 2); RAstarEl.textContent = fmt(RA / Rstar, 1);
      Rcoel.textContent = fmtExp(Rco, 2); RcostarEl.textContent = fmt(Rco / Rstar, 1);
      regimeEl.textContent = RA <= Rco
        ? 'R_A ≲ R_co: regime de disk-locking (material capturado e acretado).'
        : 'R_A ≳ R_co: regime de propeller (material pode ser ejetado).';

      var vimp = Math.sqrt(clampMin(2 * G * Mstar * (1 / Rstar - 1 / RA), 0));
      var mu = 0.6;
      var Tchoque = 3 * mu * M_H * vimp * vimp / (16 * K_B);
      vimpEl.textContent = fmt(vimp / 1e5, 0);
      TchoqueEl.textContent = fmtExp(Tchoque, 2);

      var Lacc = G * Mstar * Mdot / Rstar;
      LaccEl.textContent = fmt(Lacc / LSUN, 3);
    }
    Bs.addEventListener('input', desenha); Mdots.addEventListener('input', desenha);
    Ms.addEventListener('input', desenha); Rs.addEventListener('input', desenha); Ps.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (diagrama animado): acréscimo magnetosférico =================
  (function () {
    var canvas = document.getElementById('mmag-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mmag-canvas', 360);
    var playBtn = document.getElementById('mmag-play'), resetBtn = document.getElementById('mmag-reset');

    function campoLinha(cx, cy, raioEstrela, raioTrunc, ladoX, alturaY, tParam) {
      // curva simples (quadrática) da superfície estelar até o ponto de truncamento no disco
      var x0 = cx + ladoX * raioEstrela * 0.9, y0 = cy - alturaY * raioEstrela * 0.9;
      var x1 = cx + ladoX * raioTrunc, y1 = cy - alturaY * raioTrunc * 0.55;
      var xm = (x0 + x1) / 2 + ladoX * 18, ym = Math.min(y0, y1) - 24;
      var t = tParam;
      var x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * xm + t * t * x1;
      var y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ym + t * t * y1;
      return { x: x, y: y, x0: x0, y0: y0, xm: xm, ym: ym, x1: x1, y1: y1 };
    }

    function desenhaFrame(t) {
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var raioEstrela = Math.min(w, h) * 0.09;
      var raioTrunc = Math.min(w, h) * 0.30;
      var raioDiscoExt = Math.min(w, h) * 0.46;

      // disco truncado (dois trechos)
      ctx.fillStyle = CORES_GRAFICO.curva; ctx.globalAlpha = 0.18;
      ctx.fillRect(cx + raioTrunc, cy - 5, raioDiscoExt - raioTrunc, 10);
      ctx.fillRect(cx - raioDiscoExt, cy - 5, raioDiscoExt - raioTrunc, 10);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = CORES_GRAFICO.curva; ctx.lineWidth = 1.6;
      ctx.strokeRect(cx + raioTrunc, cy - 5, raioDiscoExt - raioTrunc, 10);
      ctx.strokeRect(cx - raioDiscoExt, cy - 5, raioDiscoExt - raioTrunc, 10);

      // linhas de campo dipolar (4 por lado)
      var angs = [25, 45, 65, 80];
      var linhas = [];
      ctx.strokeStyle = '#1c4878'; ctx.lineWidth = 1.6;
      [1, -1].forEach(function (lado) {
        angs.forEach(function (a) {
          var rad = (a * Math.PI) / 180;
          var linha = campoLinha(cx, cy, raioEstrela, raioTrunc, lado, Math.sin(rad) * 1.15 + 0.3, 1);
          ctx.beginPath();
          ctx.moveTo(linha.x0, linha.y0);
          ctx.quadraticCurveTo(linha.xm, linha.ym, linha.x1, linha.y1);
          ctx.stroke();
          linhas.push({ lado: lado, alturaY: Math.sin(rad) * 1.15 + 0.3 });
        });
      });

      // estrela central
      ctx.fillStyle = CORES_GRAFICO.marcador;
      ctx.beginPath(); ctx.arc(cx, cy, raioEstrela, 0, 2 * Math.PI); ctx.fill();

      // material fluindo pelas colunas (partículas ao longo das linhas de campo)
      linhas.forEach(function (ln, idx) {
        var fase = (t + idx * 0.13) % 1;
        var pt = campoLinha(cx, cy, raioEstrela, raioTrunc, ln.lado, ln.alturaY, 1 - fase);
        ctx.fillStyle = CORES_GRAFICO.marcador;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI); ctx.fill();
      });

      // hot spots (pontos quentes) nos polos magnéticos, pulsando
      var pulso = 2.5 + 1.2 * Math.abs(Math.sin(t * Math.PI * 4));
      ctx.fillStyle = '#ffb347';
      [1, -1].forEach(function (lado) {
        [0.55, -0.55].forEach(function (sinal) {
          ctx.beginPath();
          ctx.arc(cx + lado * raioEstrela * 0.75, cy + sinal * raioEstrela * 0.65, pulso, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // vento/jato ao longo do eixo
      ctx.strokeStyle = '#3355aa'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy - raioEstrela * 1.3); ctx.lineTo(cx, cy - raioEstrela * 1.3 - 46 - 10 * Math.sin(t * Math.PI * 2)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + raioEstrela * 1.3); ctx.lineTo(cx, cy + raioEstrela * 1.3 + 46 + 10 * Math.sin(t * Math.PI * 2)); ctx.stroke();

      ctx.fillStyle = '#444'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('disco truncado em R_A, colunas de acréscimo até hot spots, jato ao longo do eixo', cx, h - 10);
    }

    var anim = { t: 0 };
    function tick() {
      anim.t = (anim.t + 0.006) % 1;
      desenhaFrame(anim.t);
      if (playBtn && playBtn.dataset.animando === '1') requestAnimationFrame(tick);
    }
    if (playBtn) {
      playBtn.dataset.animando = '0';
      playBtn.addEventListener('click', function () {
        if (playBtn.dataset.animando === '1') { playBtn.dataset.animando = '0'; playBtn.textContent = '▶ Animar fluxo'; return; }
        playBtn.dataset.animando = '1'; playBtn.textContent = '❚❚ Fluindo…';
        requestAnimationFrame(tick);
      });
    }
    if (resetBtn) resetBtn.addEventListener('click', function () { anim.t = 0; if (playBtn) { playBtn.dataset.animando = '0'; playBtn.textContent = '▶ Animar fluxo'; } desenhaFrame(0); });
    desenhaFrame(0);
  })();

  // ================= Módulo: tempo de coagulação =================
  (function () {
    var as = document.getElementById('mcoag-a');
    if (!as) return;
    var aV = document.getElementById('mcoag-a-valor'), tEl = document.getElementById('mcoag-t');
    var RHO_D = 1.3e-11, RHO_S = 1.0, DV = 10; // g/cm3, g/cm3, cm/s
    function desenha() {
      var loga = Number(as.value) / 100;
      var a = Math.pow(10, loga);
      aV.textContent = fmtExp(a, 2);
      var t = (4 * RHO_S * a) / (RHO_D * DV);
      tEl.textContent = fmtExp(t / ANO, 2);
    }
    as.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: barreira do metro (tempo de deriva vs. Stokes) =================
  (function () {
    var r_UA = 1;
    var eta = 1.9e-3;
    var vK = 3.0e6; // cm/s, a 1 UA (mesmo valor do Exemplo)
    var r_cm = r_UA * UA;
    var chart = null;
    var canvasEl = document.getElementById('mbarreira-canvas');
    if (!canvasEl) return;
    var Sts = linspace(-3, 3, 140).map(function (l) { return Math.pow(10, l); });
    var tdrift = Sts.map(function (St) {
      var vr = 2 * eta * vK * St / (1 + St * St);
      return r_cm / clampMin(vr) / ANO;
    });
    var idxMin = 0;
    for (var i = 1; i < tdrift.length; i++) if (tdrift[i] < tdrift[idxMin]) idxMin = i;
    var ctx = canvasEl.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: { datasets: [datasetCurva(Sts, tdrift, CORES_GRAFICO.curva), datasetMarcador(Sts, idxMin, tdrift, CORES_GRAFICO.marcador)] },
      options: chartBaseOptions('Número de Stokes, St', 't_deriva (anos)', { xScale: { type: 'logarithmic' }, yScale: { type: 'logarithmic' } })
    });
    var minEl = document.getElementById('mbarreira-min');
    if (minEl) minEl.textContent = fmt(tdrift[idxMin], 0) + ' anos, em St=' + fmt(Sts[idxMin], 2);
  })();

  // ================= Módulo: critério de Toomre Q =================
  (function () {
    var rs = document.getElementById('mtoomre-r'), fs = document.getElementById('mtoomre-f');
    if (!rs) return;
    var rV = document.getElementById('mtoomre-r-valor'), fV = document.getElementById('mtoomre-f-valor');
    var Qel = document.getElementById('mtoomre-Q'), statusEl = document.getElementById('mtoomre-status');
    function desenha() {
      var r_UA = Math.pow(10, Number(rs.value) / 100);
      var fator = Math.pow(10, Number(fs.value) / 100);
      rV.textContent = fmt(r_UA, 1);
      fV.textContent = fmt(fator, 2);
      var Sigma = fator * 1700 * Math.pow(r_UA, -1.5);
      var T = 280 * Math.pow(r_UA, -0.5);
      var cs = Math.sqrt(K_B * T / (2.3 * M_H));
      var r = r_UA * UA;
      var OmegaK = Math.sqrt(G * MSUN / Math.pow(r, 3));
      var Q = cs * OmegaK / (Math.PI * G * Sigma);
      Qel.textContent = fmt(Q, 2);
      statusEl.textContent = Q < 1.3 ? 'Q≲1,3: disco instável — fragmentação favorecida.' : 'Q≳1,3: disco gravitacionalmente estável.';
      statusEl.style.color = Q < 1.3 ? '#963c1e' : '#17805f';
    }
    rs.addEventListener('input', desenha); fs.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: acréscimo de núcleo / runaway de gás =================
  (function () {
    var Mcs = document.getElementById('mnucleo-Mc');
    if (!Mcs) return;
    var McV = document.getElementById('mnucleo-Mc-valor'), statusEl = document.getElementById('mnucleo-status');
    var MCRIT = 11; // M_terra, valor central citado (Mizuno 1980)
    function desenha() {
      var Mc = Number(Mcs.value) / 10;
      McV.textContent = fmt(Mc, 1);
      if (Mc < MCRIT) {
        statusEl.textContent = 'Núcleo abaixo da massa crítica (~' + MCRIT + ' M⊕): envoltória gasosa em equilíbrio quase-estático, crescimento lento.';
        statusEl.style.color = '#17805f';
      } else {
        statusEl.textContent = 'Núcleo acima da massa crítica: envelope colapsa dinamicamente — acréscimo descontrolado de gás (runaway), formando um gigante gasoso.';
        statusEl.style.color = '#963c1e';
      }
    }
    Mcs.addEventListener('input', desenha);
    desenha();
  })();

})();
