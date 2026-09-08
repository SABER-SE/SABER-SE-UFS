// =====================================================================
// Módulos interativos do Capítulo 8 — Equações de Estado Estelar
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  // ---------------- Constantes físicas (CGS) — ver comuns.js (CONST) ----------------
  var H = CONST.H;              // erg s
  var HBAR = CONST.HBAR;
  var C = CONST.C;               // cm/s
  var ME = CONST.ME;             // g
  var NA = CONST.NA;             // /mol
  var KB = CONST.KB;             // erg/K
  var MA = CONST.MA;             // g (Dalton, "m_a" do texto)
  var A_RAD = CONST.A_RAD;       // erg/(cm^3 K^4)
  var EV = 1.602176634e-12;     // erg por eV
  var ESU = CONST.E;             // carga elementar, statC (cgs-Gaussian)

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
  // PARTE 1 — Introdução até "Fluxo de momento e pressão mecânica"
  // =====================================================================

  // ================= Módulo mu: calculadora de peso molecular médio =================
  (function () {
    var Xs = document.getElementById('mmu-X'), Ys = document.getElementById('mmu-Y');
    if (!Xs) return;
    var XV = document.getElementById('mmu-X-valor'), YV = document.getElementById('mmu-Y-valor'), ZV = document.getElementById('mmu-Z-valor');
    var muEl = document.getElementById('mmu-mu'), mueEl = document.getElementById('mmu-mue'), muiEl = document.getElementById('mmu-mui');
    function desenha() {
      var X = Xs.value / 1000;
      var Y = Math.min(Ys.value / 1000, 1 - X);
      var Z = Math.max(0, 1 - X - Y);
      XV.textContent = fmt(X, 3); YV.textContent = fmt(Y, 3); ZV.textContent = fmt(Z, 3);
      // 1/mu = sum (1+Zi) Xi/mui [Eq. (8.9)]: H (Zi=1,mui=1) -> 2X; He (Zi=2,mui=4) -> (3/4)Y;
      // "metais" (Zi/mui~1/2 para elementos pesados, aproximação padrão da literatura) -> (1/2)Z
      var invMuStd = 2 * X + 0.75 * Y + 0.5 * Z;
      var mu = 1 / invMuStd;
      var invMue = X * 1 + Y * 0.5 + Z * 0.5; // mu_e: 1/mu_e = sum Zi Xi/mui (elétrons por massa)
      var mue = 1 / clampMin(invMue);
      var invMui = X / 1 + Y / 4 + Z / 12; // aproximando Z~12,A~24 p/ "metais" nao muda muito a ordem
      var mui = 1 / clampMin(invMui);
      muEl.textContent = fmt(mu, 3);
      mueEl.textContent = fmt(mue, 3);
      muiEl.textContent = fmt(mui, 3);
    }
    Xs.addEventListener('input', desenha); Ys.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo Pgas: pressão do gás ideal decomposta =================
  (function () {
    var rhos = document.getElementById('mpgas-rho'), Ts = document.getElementById('mpgas-T');
    if (!rhos) return;
    var rhoV = document.getElementById('mpgas-rho-valor'), TV = document.getElementById('mpgas-T-valor');
    var Pel = document.getElementById('mpgas-P'), PeEl = document.getElementById('mpgas-Pe'), PiEl = document.getElementById('mpgas-Pi');
    var mu = 0.62, mu_e = 1.18, mu_i = 1.30; // composição de referência (H0,7/He0,3 do texto)
    function desenha() {
      var rho = Math.pow(10, Number(rhos.value) / 100);
      var T = Math.pow(10, Number(Ts.value) / 100);
      rhoV.textContent = fmtExp(rho, 2); TV.textContent = fmtExp(T, 2);
      var R = KB / MA;
      var P = rho * R * T / mu;
      var Pe = rho * R * T / mu_e;
      var Pi = rho * R * T / mu_i;
      Pel.textContent = fmtExp(P, 3);
      PeEl.textContent = fmtExp(Pe, 3) + ' (' + fmt(100 * Pe / (Pe + Pi), 0) + '%)';
      PiEl.textContent = fmtExp(Pi, 3) + ' (' + fmt(100 * Pi / (Pe + Pi), 0) + '%)';
    }
    rhos.addEventListener('input', desenha); Ts.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (animação): elétron confinado 1D -> 3D =================
  (function () {
    var canvas = document.getElementById('m1d3d-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('m1d3d-canvas', 360);
    var Ls = document.getElementById('m1d3d-L'), playBtn = document.getElementById('m1d3d-play'), resetBtn = document.getElementById('m1d3d-reset');
    var LV = document.getElementById('m1d3d-L-valor'), pmaxEl = document.getElementById('m1d3d-pmax');
    var NPARES_MAX = 8; // pares de eletrons (16 eletrons) preenchidos na animacao

    function En_eV(n, L_cm) {
      // partícula numa caixa 1D: E_n = n^2 h^2/(8 me L^2)
      return (n * n * H * H) / (8 * ME * L_cm * L_cm) / EV;
    }
    function desenhaFrame(t) {
      var L_A = Number(Ls.value); // angstrom
      var L_cm = L_A * 1e-8;
      LV.textContent = fmt(L_A, 1);
      var nParesVisiveis = Math.max(1, Math.round(t * NPARES_MAX));
      var pmax = nParesVisiveis * H / (2 * L_cm);
      pmaxEl.textContent = fmtExp(pmax, 3);

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 55, padB = 30, padT = 16;
      var panelW = (w - padL - 40) / 2;

      // painel esquerdo: níveis de energia 1D
      var maxE = En_eV(NPARES_MAX, L_cm);
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(padL + panelW, h - padB); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('níveis 1D (caixa de tamanho L)', padL + panelW / 2, h - 8);
      ctx.save(); ctx.translate(16, padT + (h - padB - padT) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('E (eV)', 0, 0); ctx.restore();
      for (var n = 1; n <= nParesVisiveis; n++) {
        var E = En_eV(n, L_cm);
        var y = h - padB - (E / maxE) * (h - padB - padT - 10);
        ctx.strokeStyle = n === nParesVisiveis ? CORES_GRAFICO.marcador : CORES_GRAFICO.curva;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(padL + 8, y); ctx.lineTo(padL + panelW - 8, y); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('n=' + n + ' (↑↓)', padL + panelW + 2 > padL + panelW ? padL + 6 : padL + 6, y - 3);
      }

      // painel direito: esfera de Fermi (projeção 2D, octante positivo destacado)
      var cx = padL + panelW + 90, cy = (padT + h - padB) / 2 + 6;
      var raioMax = Math.min(panelW, h - padB - padT) * 0.42;
      var raioAtual = raioMax * Math.pow(nParesVisiveis / NPARES_MAX, 1 / 1);
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(cx, cy, raioMax, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
      // eixos p_x, p_y
      ctx.strokeStyle = '#bbb';
      ctx.beginPath(); ctx.moveTo(cx - raioMax - 10, cy); ctx.lineTo(cx + raioMax + 10, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - raioMax - 10); ctx.lineTo(cx, cy + raioMax + 10); ctx.stroke();
      // octante positivo preenchido (quarter circle no 2D, representando 1/8 em 3D)
      ctx.fillStyle = CORES_GRAFICO.curva; ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, raioAtual, -Math.PI / 2, 0); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, raioAtual, -Math.PI / 2, 0); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('espaço de momento 3D (corte 2D)', cx, h - 8);
      ctx.fillText('octante ocupado, raio p_máx', cx, padT + 10);
    }

    createAnimController(playBtn, resetBtn, 5, desenhaFrame, { play: '▶ Preencher níveis', playing: '❚❚ Preenchendo…' });
    Ls.addEventListener('input', function () { desenhaFrame(1); });
    desenhaFrame(1);
  })();

  // ================= Módulo (animação flagship): mar de Fermi e f(E) =================
  (function () {
    var canvas = document.getElementById('mfermi-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mfermi-canvas', 340);
    var Ts = document.getElementById('mfermi-T'), playBtn = document.getElementById('mfermi-play'), resetBtn = document.getElementById('mfermi-reset');
    var TV = document.getElementById('mfermi-T-valor'), regimeEl = document.getElementById('mfermi-regime');
    var NLINHAS = 6, NCOL = 12; // grade esquemática de estados (pares de setas) até E_F
    var EF_EV = 3.0; // energia de Fermi de referência (escala arbitrária p/ ilustração)

    var T_CHAR = 2e4; // K: escala em que o potencial químico efetivo começa a cair (toy model)
    function fEnergia(E, T) {
      if (T < 50) return E <= EF_EV ? 1 : 0;
      var kT_eV = (KB * T) / EV;
      // potencial químico efetivo decresce com T (esquemático, mas qualitativamente correto:
      // em T alto a fixo n_e, mu cai bastante abaixo de E_F) -> garante que o limite T->infty
      // desta curva vire de fato o decaimento de Boltzmann e^(-E/kT), não um patamar em 0,5.
      var muEff = EF_EV / (1 + T / T_CHAR);
      var x = (E - muEff) / kT_eV;
      if (x > 40) return 0;
      if (x < -40) return 1;
      return 1 / (1 + Math.exp(x));
    }

    function desenhaFrame(t) {
      var T = Math.pow(10, Number(Ts.value) / 100);
      TV.textContent = fmtExp(T, 2);
      if (T < 100) regimeEl.textContent = 'T→0: degenerescência total — degrau perfeito em E_F.';
      else if (T < 3e6) regimeEl.textContent = 'Degenerescência parcial: borda de f(E) suavizada em torno de E_F.';
      else regimeEl.textContent = 'T alto: aproxima-se do limite clássico de Maxwell–Boltzmann, f(E)∝e^(-E/kT) para (quase) todo E.';

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 46, padR = 16, padT = 16, padB = 34;
      var plotW = (w - padL - padR) * 0.52, plotH = h - padT - padB;

      // painel esquerdo: "mar de Fermi" - grade de estados preenchendo de baixo p/ cima (animado por t)
      var gridX0 = padL, gridY0 = h - padB, cellW = plotW / NCOL, cellH = plotH / NLINHAS;
      var totalEstados = NLINHAS * NCOL;
      var preenchidos = Math.round(t * totalEstados);
      var k = 0;
      for (var lin = 0; lin < NLINHAS; lin++) {
        for (var col = 0; col < NCOL; col++) {
          var idx = lin * NCOL + col; // preenche de baixo (lin=0) para cima
          var ocupado = idx < preenchidos;
          var x = gridX0 + col * cellW, y = gridY0 - (lin + 1) * cellH;
          ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
          if (ocupado) {
            ctx.fillStyle = (idx === preenchidos - 1) ? CORES_GRAFICO.marcador : CORES_GRAFICO.curva;
            ctx.globalAlpha = 0.85;
            ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
            ctx.globalAlpha = 1;
          }
          k++;
        }
      }
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('mar de Fermi (T=0): pares de spin preenchendo até E_F', gridX0 + plotW / 2, h - 10);
      ctx.save(); ctx.translate(16, gridY0 - plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('E crescente ↑', 0, 0); ctx.restore();

      // painel direito: f(E) vs E, curva dependente de T
      var px0 = padL + plotW + 46, pw = w - px0 - padR;
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px0, padT); ctx.lineTo(px0, h - padB); ctx.lineTo(px0 + pw, h - padB); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.textAlign = 'center'; ctx.fillText('E', px0 + pw / 2, h - 10);
      ctx.save(); ctx.translate(px0 - 30, padT + (h - padB - padT) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('f(E)', 0, 0); ctx.restore();
      var kT_eV_disp = (KB * T) / EV;
      var Emax = Math.max(8, 6 * kT_eV_disp); // eixo de energia se reescala em T alto p/ manter o decaimento visível na janela
      ctx.strokeStyle = CORES_GRAFICO.curva; ctx.lineWidth = 2.4; ctx.beginPath();
      for (var i = 0; i <= 120; i++) {
        var E = (Emax * i) / 120;
        var f = fEnergia(E, T);
        var xx = px0 + (E / Emax) * pw;
        var yy = h - padB - f * (h - padB - padT - 6);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      // linha tracejada em E_F
      var xEF = px0 + (EF_EV / Emax) * pw;
      ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(xEF, padT); ctx.lineTo(xEF, h - padB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = CORES_GRAFICO.marcador; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('E_F', xEF, h - padB + 14);
    }

    createAnimController(playBtn, resetBtn, 4, desenhaFrame, { play: '▶ Preencher mar de Fermi', playing: '❚❚ Preenchendo…' });
    Ts.addEventListener('input', function () { desenhaFrame(1); });
    desenhaFrame(1);
  })();

  // ================= Módulo ne(p): densidade de elétrons por intervalo de momento =================
  (function () {
    var Ts = document.getElementById('mnep-T');
    if (!Ts) return;
    var TV = document.getElementById('mnep-T-valor'), regimeEl = document.getElementById('mnep-regime');
    var chart = null;
    var P0 = 1.0; // escala arbitraria de p0 (unidades relativas) para visualizacao
    function nep(p, T) {
      // T=0: corte abrupto em p0 (proporcional a p^2). T>0: suaviza via Fermi-Dirac
      // usa uma energia efetiva ~ p^2 para a suavizacao (nao-relativistico, unidades arbitrarias)
      var base = p * p; // proporcional a p^2 (forma do grafico do .tex)
      if (T < 0.01) return p <= P0 ? base : 0;
      var largura = 0.15 * Math.sqrt(T); // suavizacao cresce com T (escala arbitraria)
      var supressao = 1 / (1 + Math.exp((p - P0) / clampMin(largura)));
      return base * supressao;
    }
    function desenha() {
      var T = Number(Ts.value) / 100;
      TV.textContent = fmt(T, 2);
      regimeEl.textContent = T < 0.05
        ? 'T≈0: corte abrupto em p₀ — todos os estados até p₀ ocupados, nenhum além (degenerescência total).'
        : (T < 1.5 ? 'Degenerescência parcial: a borda em p₀ se suaviza.' : 'T alto: a distribuição se aproxima do regime não-degenerado (cauda estendida).');
      var ps = linspace(0, 1.8, 100);
      var ys = ps.map(function (p) { return nep(p, T); });
      var ctx = document.getElementById('mnep-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [datasetCurva(ps, ys, CORES_GRAFICO.curva)] },
        options: chartBaseOptions('p / p₀ (escala relativa)', 'n_e(p) (unid. arbitrárias)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    Ts.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (animação): pressão cinética - partículas colidindo com a parede =================
  (function () {
    var canvas = document.getElementById('mparede-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mparede-canvas', 340);
    var playBtn = document.getElementById('mparede-play'), resetBtn = document.getElementById('mparede-reset');
    var nColEl = document.getElementById('mparede-ncol'), impEl = document.getElementById('mparede-impulso');
    var N = 22;
    var particulas = [];
    var nColisoes = 0, impulsoAcumulado = 0;
    function reinit() {
      particulas = [];
      for (var i = 0; i < N; i++) {
        particulas.push({
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 280,
          vx: 60 + Math.random() * 90,
          vy: (Math.random() - 0.5) * 160
        });
      }
      nColisoes = 0; impulsoAcumulado = 0;
    }
    reinit();
    var lastTs = null, animando = false, rafId = null;
    function passo(dt) {
      var w = state.w, h = state.h, paredeX = w - 24;
      particulas.forEach(function (pt) {
        pt.x += pt.vx * dt; pt.y += pt.vy * dt;
        if (pt.y < 8) { pt.y = 8; pt.vy *= -1; }
        if (pt.y > h - 8) { pt.y = h - 8; pt.vy *= -1; }
        if (pt.x < 8) { pt.x = 8; pt.vx *= -1; }
        if (pt.x > paredeX) {
          pt.x = paredeX;
          var p = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
          var costheta = Math.abs(pt.vx) / p;
          impulsoAcumulado += 2 * p * costheta;
          nColisoes++;
          pt.vx *= -1;
        }
      });
    }
    function desenha() {
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var paredeX = w - 24;
      ctx.fillStyle = '#eee'; ctx.fillRect(paredeX, 0, 24, h);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(paredeX, 0); ctx.lineTo(paredeX, h); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('parede', paredeX + 12, h / 2);
      ctx.fillStyle = CORES_GRAFICO.curva;
      particulas.forEach(function (pt) {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI); ctx.fill();
      });
      nColEl.textContent = String(nColisoes);
      impEl.textContent = fmt(impulsoAcumulado, 0);
    }
    function tick(ts) {
      if (lastTs == null) lastTs = ts;
      var elapsed = (ts - lastTs) / 1000; lastTs = ts;
      // subdivide em passos fixos (em vez de descartar tempo excedente) para que a
      // simulação não pareça travada quando o navegador atrasa/agrupa os callbacks
      // de requestAnimationFrame (aba em segundo plano, etc.) — até um teto de
      // segurança de passos por quadro para nunca travar o loop.
      var PASSO = 0.03, MAX_PASSOS = 200;
      var nPassos = Math.min(MAX_PASSOS, Math.max(1, Math.round(elapsed / PASSO)));
      var dtPasso = Math.min(PASSO, elapsed / nPassos || PASSO);
      for (var i = 0; i < nPassos; i++) passo(dtPasso);
      desenha();
      if (animando) rafId = requestAnimationFrame(tick);
    }
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (animando) { animando = false; if (rafId) cancelAnimationFrame(rafId); playBtn.textContent = '▶ Iniciar colisões'; return; }
        animando = true; lastTs = null; playBtn.textContent = '❚❚ Colidindo…';
        rafId = requestAnimationFrame(tick);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        animando = false; if (rafId) cancelAnimationFrame(rafId);
        if (playBtn) playBtn.textContent = '▶ Iniciar colisões';
        reinit(); desenha();
      });
    }
    desenha();
  })();

  // =====================================================================
  // PARTE 2 — Regimes de degenerescência, diagrama rho-T, EOS total,
  // cristalização e neutronização
  // =====================================================================

  var COEF_NR = (1 / 20) * Math.pow(3 / Math.PI, 2 / 3) * (H * H / ME) * Math.pow(NA, 5 / 3);
  var COEF_UR = Math.pow(3 / (8 * Math.PI), 1 / 3) * (H * C / 4) * Math.pow(NA, 4 / 3);
  var R_GAS = KB / MA;

  function pFermi0(rho, mu_e) {
    var ne = NA * rho / mu_e;
    return Math.pow(3 * Math.pow(H, 3) * ne / (8 * Math.PI), 1 / 3);
  }
  function Xrel(rho, mu_e) { return pFermi0(rho, mu_e) / (ME * C); }
  function F_of_X(X) { return X * (2 * X * X - 3) * Math.sqrt(X * X + 1) + 3 * Math.asinh(X); }
  function P_exact_degenerada(rho, mu_e) {
    var X = Xrel(rho, mu_e);
    return (Math.PI * Math.pow(ME, 4) * Math.pow(C, 5) / (3 * Math.pow(H, 3))) * F_of_X(X);
  }
  function P_NR(rho, mu_e) { return COEF_NR * Math.pow(rho / mu_e, 5 / 3); }
  function P_UR(rho, mu_e) { return COEF_UR * Math.pow(rho / mu_e, 4 / 3); }
  function P_ideal(rho, T, mu) { return rho * R_GAS * T / mu; }

  // ================= Módulo: comparador de regimes =================
  (function () {
    var Ts = document.getElementById('mreg-T'), mues = document.getElementById('mreg-mue'), rhos = document.getElementById('mreg-rho');
    if (!Ts) return;
    var TV = document.getElementById('mreg-T-valor'), mueV = document.getElementById('mreg-mue-valor'), rhoV = document.getElementById('mreg-rho-valor');
    var PidealEl = document.getElementById('mreg-Pideal'), PnrEl = document.getElementById('mreg-Pnr'), PurEl = document.getElementById('mreg-Pur'), PexEl = document.getElementById('mreg-Pex');
    var domEl = document.getElementById('mreg-dominante');
    var chart = null;
    var mu_ion = 1.30; // referência (composição H0.7/He0.3)

    function desenha() {
      var T = Math.pow(10, Number(Ts.value) / 100);
      var mu_e = Number(mues.value) / 100;
      var rhoAtual = Math.pow(10, Number(rhos.value) / 100);
      TV.textContent = fmtExp(T, 2); mueV.textContent = fmt(mu_e, 2); rhoV.textContent = fmtExp(rhoAtual, 2);

      var logRhos = linspace(-4, 10, 140);
      var rhos_ = logRhos.map(function (l) { return Math.pow(10, l); });
      var yIdeal = rhos_.map(function (r) { return Math.log10(P_ideal(r, T, mu_ion)); });
      var yNR = rhos_.map(function (r) { return Math.log10(P_NR(r, mu_e)); });
      var yUR = rhos_.map(function (r) { return Math.log10(P_UR(r, mu_e)); });
      var yEx = rhos_.map(function (r) { return Math.log10(P_exact_degenerada(r, mu_e)); });

      var Pid = P_ideal(rhoAtual, T, mu_ion), Pnr = P_NR(rhoAtual, mu_e), Pur = P_UR(rhoAtual, mu_e), Pex = P_exact_degenerada(rhoAtual, mu_e);
      PidealEl.textContent = fmtExp(Pid, 2); PnrEl.textContent = fmtExp(Pnr, 2); PurEl.textContent = fmtExp(Pur, 2); PexEl.textContent = fmtExp(Pex, 2);
      var dominante = Pex > Pid ? 'degenerada (P_degenerada > P_gás ideal)' : 'gás ideal não-degenerado (P_ideal > P_degenerada)';
      var X = Xrel(rhoAtual, mu_e);
      domEl.textContent = 'Regime dominante: ' + dominante + '. Parâmetro relativístico X=p_F/(m_ec)=' + fmt(X, 3) + ' (' + (X < 0.3 ? 'não-relativístico' : (X > 3 ? 'ultra-relativístico' : 'transição relativística')) + ').';

      var idxAtual = nearestIdx(logRhos, Number(rhos.value) / 100);
      var ctx = document.getElementById('mreg-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: logRhos.map(function (l, i) { return { x: l, y: yIdeal[i] }; }), borderColor: '#999', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 3], pointRadius: 0, fill: false },
            { data: logRhos.map(function (l, i) { return { x: l, y: yNR[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'transparent', borderWidth: 1.6, borderDash: [3, 3], pointRadius: 0, fill: false },
            { data: logRhos.map(function (l, i) { return { x: l, y: yUR[i] }; }), borderColor: CORES_GRAFICO.marcador, backgroundColor: 'transparent', borderWidth: 1.6, borderDash: [3, 3], pointRadius: 0, fill: false },
            { data: logRhos.map(function (l, i) { return { x: l, y: yEx[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.6, pointRadius: 0, fill: false },
            datasetMarcador(logRhos, idxAtual, yEx, '#000')
          ]
        },
        options: chartBaseOptions('log₁₀(ρ) [g/cm³]', 'log₁₀(P) [dyn/cm²]', { xScale: { type: 'linear' }, yScale: { type: 'linear' } })
      });
    }
    Ts.addEventListener('input', desenha); mues.addEventListener('input', desenha); rhos.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: parâmetro relativístico X =================
  (function () {
    var rhos = document.getElementById('mX-rho'), mues = document.getElementById('mX-mue');
    if (!rhos) return;
    var rhoV = document.getElementById('mX-rho-valor'), mueV = document.getElementById('mX-mue-valor');
    var Xel = document.getElementById('mX-X'), regimeEl = document.getElementById('mX-regime');
    function desenha() {
      var rho = Math.pow(10, Number(rhos.value) / 100);
      var mu_e = Number(mues.value) / 100;
      rhoV.textContent = fmtExp(rho, 2); mueV.textContent = fmt(mu_e, 2);
      var X = Xrel(rho, mu_e);
      Xel.textContent = fmt(X, 3);
      regimeEl.textContent = X < 0.3
        ? 'X≪1: regime não-relativístico (P∝ρ^(5/3)).'
        : (X > 3 ? 'X≫1: regime ultra-relativístico (P∝ρ^(4/3)).' : 'X∼1: transição relativística — nem a lei de potência 5/3 nem a 4/3 descrevem bem P(ρ) aqui; use a fórmula geral F(X).');
    }
    rhos.addEventListener('input', desenha); mues.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: degenerescência parcial - funções de Fermi-Dirac =================
  (function () {
    var psis = document.getElementById('mfd-psi');
    if (!psis) return;
    var psiV = document.getElementById('mfd-psi-valor'), f12El = document.getElementById('mfd-f12'), f32El = document.getElementById('mfd-f32'), fatorEl = document.getElementById('mfd-fator');
    var chart = null;

    function Fv(v, psi) {
      var umax = Math.max(60, psi + 40);
      var n = 400;
      var h = umax / n, s = 0;
      for (var i = 0; i <= n; i++) {
        var u = i * h;
        var w = (i === 0 || i === n) ? 1 : (i % 2 === 1 ? 4 : 2);
        var expo = u - psi;
        var val = expo > 700 ? 0 : Math.pow(u, v) / (1 + Math.exp(expo));
        s += w * val;
      }
      return s * h / 3;
    }

    function desenha() {
      var psi = Number(psis.value) / 100;
      psiV.textContent = fmt(psi, 2);
      var f12 = Fv(0.5, psi), f32 = Fv(1.5, psi);
      var fator = (2 * f32) / (3 * clampMin(f12));
      f12El.textContent = fmt(f12, 4); f32El.textContent = fmt(f32, 4); fatorEl.textContent = fmt(fator, 3);

      var psis_ = linspace(-8, 20, 60);
      var fatores = psis_.map(function (p) { var a = Fv(0.5, p), b = Fv(1.5, p); return (2 * b) / (3 * clampMin(a)); });
      var idx = nearestIdx(psis_, psi);
      var ctx = document.getElementById('mfd-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [datasetCurva(psis_, fatores, CORES_GRAFICO.curva), datasetMarcador(psis_, idx, fatores, CORES_GRAFICO.marcador)] },
        options: chartBaseOptions('ψ (parâmetro de degenerescência)', '2F₃/₂(ψ) / [3F₁/₂(ψ)]', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    psis.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (central): diagrama densidade-temperatura interativo =================
  (function () {
    var rhos = document.getElementById('mdiag-rho'), Ts = document.getElementById('mdiag-T');
    if (!rhos) return;
    var rhoV = document.getElementById('mdiag-rho-valor'), TV = document.getElementById('mdiag-T-valor');
    var statusEl = document.getElementById('mdiag-status');
    var mu = 0.6, mu_e = 2.0;
    var chart = null;

    function rhoFronteiraRadGas(T) { return A_RAD * mu * Math.pow(T, 3) / (3 * R_GAS); }
    function rhoFronteiraDegen(T) { return mu_e * 2.4e-8 * Math.pow(T, 1.5); }
    var rhoFronteiraRel = mu_e * (8 * Math.PI / 3) * Math.pow(ME * C / H, 3) / NA;

    var OBJETOS = [
      { nome: 'núcleo do Sol', rho: 150, T: 1.5e7 },
      { nome: 'núcleo de anã branca', rho: 1e6, T: 1e7 },
      { nome: 'núcleo de He pré-flash', rho: 5e5, T: 8e6 }
    ];

    function desenha() {
      var logRho = Number(rhos.value) / 100;
      var logT = Number(Ts.value) / 100;
      var rho = Math.pow(10, logRho), T = Math.pow(10, logT);
      rhoV.textContent = fmtExp(rho, 2); TV.textContent = fmtExp(T, 2);

      var Ts_ = linspace(3, 9, 80);
      var TsLin = Ts_.map(function (l) { return Math.pow(10, l); });
      var yRadGas = Ts_.map(function (l, i) { return Math.log10(rhoFronteiraRadGas(TsLin[i])); });
      var yDegen = Ts_.map(function (l, i) { return Math.log10(rhoFronteiraDegen(TsLin[i])); });

      var raGas = rhoFronteiraRadGas(T), rDeg = rhoFronteiraDegen(T);
      var gasOuRad = rho > raGas ? 'pressão do gás domina sobre a radiação' : 'pressão de radiação domina sobre o gás';
      var degOuNao = rho > rDeg ? 'degenerado' : 'não-degenerado';
      var relOuNao = rho > rhoFronteiraRel ? 'relativístico' : 'não-relativístico';
      var ionOuNeutro = T > 1e4 ? 'H ionizado' : 'H neutro';
      statusEl.innerHTML = 'Neste ponto (ρ=' + fmtExp(rho, 2) + ' g/cm³, T=' + fmtExp(T, 2) + ' K): <strong>' + gasOuRad + '</strong>, gás <strong>' + degOuNao + '</strong>, elétrons <strong>' + relOuNao + '</strong>, e <strong>' + ionOuNeutro + '</strong>.';

      var ctx = document.getElementById('mdiag-canvas').getContext('2d');
      if (chart) chart.destroy();
      var datasets = [
        { label: 'rad=gás', data: Ts_.map(function (l, i) { return { x: l, y: yRadGas[i] }; }), borderColor: '#1c4878', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, fill: false },
        { label: 'degen', data: Ts_.map(function (l, i) { return { x: l, y: yDegen[i] }; }), borderColor: '#5a3c82', backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false },
        { label: 'H neutro/ionizado (T~10⁴K)', data: [{ x: 3, y: 4 }, { x: 9, y: 4 }], borderColor: '#963c1e', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, fill: false },
        { label: 'não-rel./relativístico', data: [{ x: 3, y: Math.log10(rhoFronteiraRel) }, { x: 9, y: Math.log10(rhoFronteiraRel) }], borderColor: '#3c6e3c', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, fill: false },
        { label: 'marcador', data: [{ x: logT, y: logRho }], borderColor: '#000', backgroundColor: '#000', pointRadius: 7, showLine: false }
      ];
      OBJETOS.forEach(function (o) {
        datasets.push({ label: o.nome, data: [{ x: Math.log10(o.T), y: Math.log10(o.rho) }], borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 5, showLine: false });
      });
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: chartBaseOptions('log₁₀(T) [K]', 'log₁₀(ρ) [g/cm³]', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: -6, max: 12 } })
      });
    }
    rhos.addEventListener('input', desenha); Ts.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: EOS total (Pe, Pion, Prad) =================
  (function () {
    var rhos = document.getElementById('meos-rho'), Ts = document.getElementById('meos-T');
    if (!rhos) return;
    var rhoV = document.getElementById('meos-rho-valor'), TV = document.getElementById('meos-T-valor');
    var chart = null;
    var mu_i = 1.30, mu_e = 1.18;
    function desenha() {
      var rho = Math.pow(10, Number(rhos.value) / 100);
      var T = Math.pow(10, Number(Ts.value) / 100);
      rhoV.textContent = fmtExp(rho, 2); TV.textContent = fmtExp(T, 2);
      var Pion = P_ideal(rho, T, mu_i);
      var PeIdeal = rho * R_GAS * T / mu_e;
      var PeDeg = P_NR(rho, mu_e);
      var Pe = Math.sqrt(PeIdeal * PeIdeal + PeDeg * PeDeg); // interpolação suave esquemática entre os regimes
      var Prad = A_RAD * Math.pow(T, 4) / 3;
      var Ptot = Pion + Pe + Prad;
      var ctx = document.getElementById('meos-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['P_íon', 'P_e', 'P_rad'],
          datasets: [{
            data: [Pion, Pe, Prad],
            backgroundColor: [CORES_GRAFICO.extra, CORES_GRAFICO.curva, CORES_GRAFICO.marcador]
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { y: { type: 'logarithmic', title: { display: true, text: 'P (dyn/cm²)' } } }
        }
      });
      var fracEl = document.getElementById('meos-fracoes');
      if (fracEl) fracEl.textContent = 'P_total≈' + fmtExp(Ptot, 2) + ' dyn/cm² — frações: íon ' + fmt(100 * Pion / Ptot, 1) + '%, elétrons ' + fmt(100 * Pe / Ptot, 1) + '%, radiação ' + fmt(100 * Prad / Ptot, 1) + '%.';
    }
    rhos.addEventListener('input', desenha); Ts.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo: neutronização =================
  (function () {
    var rhos = document.getElementById('mneutron-rho');
    if (!rhos) return;
    var rhoV = document.getElementById('mneutron-rho-valor'), EFel = document.getElementById('mneutron-EF'), statusEl = document.getElementById('mneutron-status');
    var Q_MeV = 1.293; // diferença de massa nêutron-próton (energia de repouso), MeV
    var mu_e = 2.0;
    function desenha() {
      var rho = Math.pow(10, Number(rhos.value) / 100);
      rhoV.textContent = fmtExp(rho, 2);
      var p0 = pFermi0(rho, mu_e);
      var EF = (Math.sqrt(Math.pow(p0 * C, 2) + Math.pow(ME * C * C, 2)) - ME * C * C) / (1e6 * EV); // MeV
      EFel.textContent = fmt(EF, 3);
      statusEl.textContent = EF > Q_MeV
        ? 'E_F > ' + Q_MeV + ' MeV: captura eletrônica (e⁻+p→n+ν_e) energeticamente favorável — neutronização em curso.'
        : 'E_F < ' + Q_MeV + ' MeV: captura eletrônica não é favorável — gás de elétrons estável.';
    }
    rhos.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo (animação): cristalização =================
  (function () {
    var canvas = document.getElementById('mcristal-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mcristal-canvas', 340);
    var playBtn = document.getElementById('mcristal-play'), resetBtn = document.getElementById('mcristal-reset');
    var statusEl = document.getElementById('mcristal-status');
    var GAMMA_MAX = 400, GAMMA_C = 175;
    var NX = 8, NY = 6;
    var particulas = [];
    (function initParticulas() {
      for (var i = 0; i < NX * NY; i++) {
        particulas.push({
          rx: Math.random(), ry: Math.random(), // posição aleatória inicial (fração do canvas)
          gx: (i % NX) + 0.5, gy: Math.floor(i / NX) + 0.5 // posição de rede alvo
        });
      }
    })();
    function desenhaFrame(t) {
      var Gamma = t * GAMMA_MAX;
      statusEl.textContent = 'Γ = ' + fmt(Gamma, 0) + ' — ' + (Gamma < GAMMA_C
        ? 'Γ < Γc≈175: plasma desordenado (líquido de Coulomb).'
        : 'Γ > Γc≈175: rede cristalina formada — energia coulombiana domina sobre a agitação térmica.');
      var fracCristal = Math.min(1, Math.max(0, (Gamma - 60) / (GAMMA_C - 60 + 60)));
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var pad = 30;
      particulas.forEach(function (p) {
        var xRand = pad + p.rx * (w - 2 * pad), yRand = pad + p.ry * (h - 2 * pad);
        var xGrid = pad + (p.gx / NX) * (w - 2 * pad), yGrid = pad + (p.gy / NY) * (h - 2 * pad);
        var x = xRand + (xGrid - xRand) * fracCristal, y = yRand + (yGrid - yRand) * fracCristal;
        ctx.fillStyle = Gamma > GAMMA_C ? '#1D9E75' : '#D85A30';
        ctx.beginPath(); ctx.arc(x, y, 5, 0, 2 * Math.PI); ctx.fill();
      });
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Γ = ' + fmt(Gamma, 0) + ' (crítico Γc≈175)', w / 2, h - 10);
    }
    createAnimController(playBtn, resetBtn, 6, desenhaFrame, { play: '▶ Resfriar (aumentar Γ)', playing: '❚❚ Resfriando…' });
    desenhaFrame(0);
  })();

})();
