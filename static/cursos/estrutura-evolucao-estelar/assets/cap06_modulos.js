// =====================================================================
// Módulos interativos do Capítulo 6 — Estrelas Politrópicas
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  var MSUN = CONST.MSUN;

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

  // =====================================================================
  // Integrador da equação de Lane-Emden: omega'' + (2/z) omega' = -omega^n,
  // com omega(0)=1, omega'(0)=0, omega''(0)=-1/3 (caixa de atenção do
  // capítulo) — agora um caso particular do integrador genérico
  // ShootingODE de comuns.js (f''+(2/y)f'+g(f)=0, threshold=0,
  // g(f)=f^n), compartilhado com o integrador da equação de
  // Chandrasekhar do Capítulo 9 (mesma estrutura numérica, g(f) e
  // f''(0) diferentes). Método: RK4 (mais preciso que as diferenças
  // finitas descritas nas notas do professor, mas resolvendo exatamente
  // a mesma equação — a Eq. (6.47) do texto).
  // =====================================================================
  function leG(n) { return function (w) { return w > 0 ? Math.pow(w, n) : 0; }; }

  // solveLaneEmden(n, nAmostras): resolve a equação de Lane-Emden para um
  // índice n e devolve { zR, slope, razao, diverged, zs, ws, dws }, onde
  // slope = -z_R^2 * omega'(z_R) [usado na Eq. (6.42), razão de
  // densidades] e razao = rho_barra/rho_c = 3*slope/z_R^3.
  var LE_ZMAX = 500; // limite de integração (z) além do qual consideramos que a solução divergiu (n -> 5)
  function solveLaneEmden(n, nAmostras) {
    var res = ShootingODE.solve({ g: leG(n), f2at0: -1 / 3, threshold: 0, dy: 0.01, ymax: LE_ZMAX, nAmostras: nAmostras || 300 });
    if (res.diverged) {
      // n muito próximo de 5: z_R -> infinito (raio infinito, massa finita).
      return { n: n, zR: null, slope: null, razao: null, diverged: true, zs: res.ys, ws: res.fs, dws: res.dfs };
    }
    var slope = -res.y1 * res.y1 * res.dfEnd;
    var razao = 3 * slope / Math.pow(res.y1, 3);
    return { n: n, zR: res.y1, slope: slope, razao: razao, diverged: false, zs: res.ys, ws: res.fs, dws: res.dfs };
  }

  // Soluções analíticas fechadas [Eqs. (6.44)-(6.46)].
  function analiticaN0(z) { return 1 - (z * z) / 6; }
  function analiticaN1(z) { return z === 0 ? 1 : Math.sin(z) / z; }
  function analiticaN5(z) { return Math.pow(1 + (z * z) / 3, -0.5); }
  function analiticaDe(n) {
    if (Math.abs(n - 0) < 1e-6) return { f: analiticaN0, zR: Math.sqrt(6) };
    if (Math.abs(n - 1) < 1e-6) return { f: analiticaN1, zR: Math.PI };
    if (Math.abs(n - 5) < 1e-6) return { f: analiticaN5, zR: null };
    return null;
  }

  window.LaneEmden = {
    solve: solveLaneEmden,
    analiticaDe: analiticaDe,
    analiticaN0: analiticaN0,
    analiticaN1: analiticaN1,
    analiticaN5: analiticaN5
  };

  // Valores de referência da literatura (Chandrasekhar 1939) para checagem.
  var REF = {
    1.5: { zR: 3.65375, slope: 2.71406 },
    3: { zR: 6.89685, slope: 2.01824 }
  };

  // ================= Módulo 1 (central): Integrador de Lane-Emden =================
  (function () {
    var ns = document.getElementById('m1-n');
    if (!ns) return;
    var nV = document.getElementById('m1-n-valor');
    var zREl = document.getElementById('m1-zR'), slopeEl = document.getElementById('m1-slope'), razaoEl = document.getElementById('m1-razao');
    var refNota = document.getElementById('m1-ref-nota'), divergeNota = document.getElementById('m1-diverge-nota');
    var chart = null;

    function desenha() {
      var n = ns.value / 100;
      nV.textContent = fmt(n, 2);
      var sol = LaneEmden.solve(n, 350);

      var datasets = [datasetCurva(sol.zs, sol.ws, CORES_GRAFICO.curva)];
      var analitica = LaneEmden.analiticaDe(n);
      if (analitica) {
        var ysA = sol.zs.map(function (z) { return analitica.f(z); });
        datasets.push({
          data: sol.zs.map(function (z, i) { return { x: z, y: ysA[i] }; }),
          borderColor: CORES_GRAFICO.extra,
          backgroundColor: CORES_GRAFICO.extra,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          tension: 0
        });
      }
      if (!sol.diverged) {
        datasets.push(datasetMarcador(sol.zs, sol.zs.length - 1, sol.ws, CORES_GRAFICO.marcador));
      }

      var ctx = document.getElementById('m1-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: chartBaseOptions('z', 'ω(z)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: -0.05 } })
      });

      if (sol.diverged) {
        zREl.textContent = '→ ∞'; slopeEl.textContent = '—'; razaoEl.textContent = '—';
        divergeNota.style.display = '';
        divergeNota.textContent = 'Para n=' + fmt(n, 2) + ', próximo de n=5, o integrador não encontra um zero até z=' + LE_ZMAX + ' — consistente com o resultado analítico exato em n=5, onde z_R→∞ (raio infinito, massa finita; ver Eq. (6.46)). A curva acima está truncada em z=' + LE_ZMAX + '.';
      } else {
        zREl.textContent = fmt(sol.zR, 4);
        slopeEl.textContent = fmt(sol.slope, 4);
        razaoEl.textContent = fmt(sol.razao, 4);
        divergeNota.style.display = 'none';
      }

      refNota.textContent = '';
      var refKeys = [1.5, 3];
      for (var i = 0; i < refKeys.length; i++) {
        var rn = refKeys[i];
        if (Math.abs(n - rn) < 0.015) {
          var ref = REF[rn];
          refNota.textContent = 'Comparando com a literatura para n=' + fmt(rn, 1) + ': z_R≈' + fmt(ref.zR, 3) +
            ' e -z_R²ω′(z_R)≈' + fmt(ref.slope, 3) + ' (Chandrasekhar 1939) — o integrador reproduz esses valores com ' +
            (sol.zR ? ('erro relativo de ' + fmt(100 * Math.abs(sol.zR - ref.zR) / ref.zR, 3) + '% em z_R') : '');
        }
      }
    }
    ns.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 1B: integração passo a passo (animada) =================
  (function () {
    var ns = document.getElementById('m1b-n');
    if (!ns) return;
    var nV = document.getElementById('m1b-n-valor');
    var velS = document.getElementById('m1b-vel'), velV = document.getElementById('m1b-vel-valor');
    var playBtn = document.getElementById('m1b-play'), resetBtn = document.getElementById('m1b-reset');
    var zEl = document.getElementById('m1b-z'), wEl = document.getElementById('m1b-w'), dwEl = document.getElementById('m1b-dw');
    var chart = null, sol = null;
    var N_PASSOS = 220; // pontos de exibição — não é o passo real da integração
    // (esse é dz=0,01, fixo no ShootingODE); é só a resolução da "revelação".

    function recalcula() {
      var n = ns.value / 100;
      nV.textContent = fmt(n, 2);
      sol = LaneEmden.solve(n, N_PASSOS);
    }

    function pontoAtual(idx) {
      if (!sol) return;
      var i = Math.min(idx, sol.zs.length - 1);
      zEl.textContent = fmt(sol.zs[i], 4);
      wEl.textContent = fmt(sol.ws[i], 4);
      dwEl.textContent = fmt(sol.dws[i], 4);
    }

    function desenhaAte(idx) {
      var ctx = document.getElementById('m1b-canvas').getContext('2d');
      var zsParciais = sol.zs.slice(0, idx + 1);
      var wsParciais = sol.ws.slice(0, idx + 1);
      var datasets = [
        datasetCurva(zsParciais, wsParciais, CORES_GRAFICO.curva),
        datasetMarcador(zsParciais, zsParciais.length - 1, wsParciais, CORES_GRAFICO.marcador)
      ];
      if (!chart) {
        chart = new Chart(ctx, {
          type: 'line',
          data: { datasets: datasets },
          options: chartBaseOptions('z', 'ω(z)', {
            xScale: { type: 'linear', min: 0, max: sol.zs[sol.zs.length - 1] },
            yScale: { type: 'linear', min: -0.05, max: 1.05 }
          })
        });
      } else {
        chart.data.datasets = datasets;
        chart.options.scales.x.max = sol.zs[sol.zs.length - 1];
        chart.update('none');
      }
      pontoAtual(idx);
    }

    function onFrame(t) {
      // t em [0,1] ao longo da duração fixa do createAnimController;
      // "velocidade" só acelera o avanço pelo array já calculado (ver
      // nota do módulo no HTML — não recalcula nada, só revela mais rápido).
      var vel = Number(velS.value) / 100;
      velV.textContent = fmt(vel, 1) + '×';
      var tEfetivo = Math.min(1, t * vel);
      var idx = Math.round(tEfetivo * (sol.zs.length - 1));
      desenhaAte(idx);
    }

    createAnimController(playBtn, resetBtn, 6, onFrame, { play: '▶ Integrar passo a passo', playing: '❚❚ Integrando…' });

    ns.addEventListener('input', function () { recalcula(); desenhaAte(0); });
    velS.addEventListener('input', function () { velV.textContent = fmt(Number(velS.value) / 100, 1) + '×'; });
    recalcula();
    desenhaAte(0);
  })();

  // ================= Módulo 2: perfis de densidade e pressão =================
  (function () {
    var ns = document.getElementById('m2-n');
    if (!ns) return;
    var nV = document.getElementById('m2-n-valor');
    var razaoEl = document.getElementById('m2-razao');
    var chart = null;
    function desenha() {
      var n = ns.value / 100;
      nV.textContent = fmt(n, 2);
      var sol = LaneEmden.solve(n, 300);
      if (sol.diverged) { razaoEl.textContent = '— (z_R→∞)'; }
      else razaoEl.textContent = fmt(sol.razao, 4);

      var zR = sol.diverged ? sol.zs[sol.zs.length - 1] : sol.zR;
      var xs = sol.zs.map(function (z) { return z / zR; });
      var rho = sol.ws.map(function (w) { return Math.pow(w, n); });
      var P = sol.ws.map(function (w) { return Math.pow(w, n + 1); });
      var ctx = document.getElementById('m2-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: xs.map(function (x, i) { return { x: x, y: rho[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva, borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0 },
            { data: xs.map(function (x, i) { return { x: x, y: P[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra, borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0 }
          ]
        },
        options: chartBaseOptions('z/z_R', 'ρ/ρ_c (verde) e P/P_c (roxo)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
    }
    ns.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 3: versão interativa da Figura omega(z) =================
  (function () {
    var ns = document.getElementById('m3-n');
    if (!ns) return;
    var nV = document.getElementById('m3-n-valor'), zREl = document.getElementById('m3-zR');
    var chart = null;
    function desenha() {
      var n = ns.value / 100;
      nV.textContent = fmt(n, 2);
      var sol = LaneEmden.solve(n, 300);
      zREl.textContent = sol.diverged ? '→ ∞' : fmt(sol.zR, 3);
      var datasets = [datasetCurva(sol.zs, sol.ws, CORES_GRAFICO.curva)];
      if (!sol.diverged) datasets.push(datasetMarcador(sol.zs, sol.zs.length - 1, sol.ws, CORES_GRAFICO.marcador));
      var ctx = document.getElementById('m3-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: chartBaseOptions('z', 'ω(z)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: -0.05, max: 1.05 } })
      });
    }
    ns.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 4: distribuição de massa m(z)/M =================
  (function () {
    var ns = document.getElementById('m4-n');
    if (!ns) return;
    var nV = document.getElementById('m4-n-valor');
    var chart = null;

    function curvaMassa(n) {
      var sol = LaneEmden.solve(n, 300);
      var zR = sol.diverged ? sol.zs[sol.zs.length - 1] : sol.zR;
      var S = sol.diverged ? (-zR * zR * sol.dws[sol.dws.length - 1]) : sol.slope;
      var xs = sol.zs.map(function (z) { return z / zR; });
      var ys = sol.zs.map(function (z, i) { return (z * z * (-sol.dws[i])) / S; });
      return { xs: xs, ys: ys };
    }

    function desenha() {
      var n = ns.value / 100;
      nV.textContent = fmt(n, 2);
      var atual = curvaMassa(n);
      var ref0 = curvaMassa(0);
      var ref3 = curvaMassa(3);
      var ctx = document.getElementById('m4-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: ref0.xs.map(function (x, i) { return { x: x, y: ref0.ys[i] }; }), borderColor: '#bbb', backgroundColor: '#bbb', borderWidth: 1.5, borderDash: [3, 3], pointRadius: 0, fill: false, tension: 0 },
            { data: ref3.xs.map(function (x, i) { return { x: x, y: ref3.ys[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra, borderWidth: 1.5, borderDash: [3, 3], pointRadius: 0, fill: false, tension: 0 },
            { data: atual.xs.map(function (x, i) { return { x: x, y: atual.ys[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva, borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0 }
          ]
        },
        options: chartBaseOptions('z/z_R', 'm(z)/M', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0, max: 1.02 } })
      });
    }
    ns.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 5: relação politrópica P = K rho^gamma =================
  (function () {
    var gs = document.getElementById('m5-gamma'), ks = document.getElementById('m5-K');
    if (!gs) return;
    var gV = document.getElementById('m5-gamma-valor'), kV = document.getElementById('m5-K-valor');
    var chart = null;
    var marcadores = [
      { gamma: 5 / 3, rotulo: 'γ=5/3 (degenerado não-relat. / totalmente convectiva)' },
      { gamma: 4 / 3, rotulo: 'γ=4/3 (degenerado relat. / Eddington padrão)' },
      { gamma: 1, rotulo: 'γ=1 (isotérmico)' }
    ];
    function desenha() {
      var gamma = gs.value / 1000;
      var K = logSlider(ks.value / 1000, -2, 6);
      gV.textContent = fmt(gamma, 3);
      kV.textContent = fmtExp(K, 2);
      var logRho = linspace(-2, 8, 60);
      var xs = logRho;
      var ys = logRho.map(function (lr) { return Math.log10(K) + gamma * lr; });
      var datasets = [datasetCurva(xs, ys, CORES_GRAFICO.curva)];
      marcadores.forEach(function (m, idx) {
        var ysm = logRho.map(function (lr) { return Math.log10(K) + m.gamma * lr; });
        datasets.push({
          data: xs.map(function (x, i) { return { x: x, y: ysm[i] }; }),
          borderColor: idx === 0 ? CORES_GRAFICO.marcador : (idx === 1 ? CORES_GRAFICO.extra : '#999'),
          backgroundColor: 'transparent', borderWidth: 1.5, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0
        });
      });
      var ctx = document.getElementById('m5-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: chartBaseOptions('log₁₀(ρ) [g/cm³]', 'log₁₀(P) [dyn/cm²]', { xScale: { type: 'linear' } })
      });
    }
    gs.addEventListener('input', desenha); ks.addEventListener('input', desenha);
    desenha();
  })();

  // ================= Módulo 6: Massa de Chandrasekhar =================
  (function () {
    var mus = document.getElementById('m6-mue');
    if (!mus) return;
    var muV = document.getElementById('m6-mue-valor'), mchEl = document.getElementById('m6-mch');
    // M_Ch = 0,7212475 * (2/mu_e)^2 * (z_R^2 |omega'(z_R)|)_{n=3}  [M_sol]
    // (constante padrão da literatura; ver nota do módulo — reproduzida a
    // partir da solução numérica n=3 do integrador central deste capítulo.)
    var CONST_MCH = 0.7212475;
    var sol3 = LaneEmden.solve(3, 10);
    var S3 = sol3.slope; // deve reproduzir ~2,018 (valor de referência do texto)
    function mch(mue) { return CONST_MCH * Math.pow(2 / mue, 2) * S3; }
    var chart = null;
    function desenha() {
      var mue = Number(mus.value) / 100;
      muV.textContent = fmt(mue, 2);
      mchEl.textContent = fmt(mch(mue), 3);
      var mues = linspace(1.5, 2.3, 60);
      var ys = mues.map(mch);
      var idx = nearestIdx(mues, mue);
      var ctx = document.getElementById('m6-canvas').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [datasetCurva(mues, ys), datasetMarcador(mues, idx, ys)] },
        options: chartBaseOptions('μ_e (peso molecular médio por elétron)', 'M_Ch / M_☉', { xScale: { type: 'linear' } })
      });
    }
    mus.addEventListener('input', desenha);
    desenha();
  })();

})();
