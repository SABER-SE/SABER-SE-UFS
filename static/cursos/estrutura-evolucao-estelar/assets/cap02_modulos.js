// =====================================================================
// Módulos interativos do Capítulo 2 — Magnitudes Estelares
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// Migrado de Plotly.js para Chart.js (Sessão 4 da auditoria).
// =====================================================================
(function () {
  'use strict';

  // Plugin leve (sem dependência externa) para desenhar rótulos de texto
  // perto de pontos de um dataset — usado onde o Plotly original tinha
  // mode:'markers+text'. Um dataset participa se tiver `pontoLabels`
  // (array paralelo a `data`, com o texto de cada ponto ou null).
  var textoPontosPlugin = {
    id: 'textoPontos',
    afterDatasetsDraw: function (chart) {
      var ctx = chart.ctx;
      chart.data.datasets.forEach(function (ds, di) {
        if (!ds.pontoLabels) return;
        var meta = chart.getDatasetMeta(di);
        ctx.save();
        ctx.font = '11px -apple-system,Segoe UI,Arial,sans-serif';
        ctx.fillStyle = ds.corTexto || '#333';
        ctx.textAlign = 'center';
        meta.data.forEach(function (el, i) {
          var label = ds.pontoLabels[i];
          if (!label) return;
          ctx.fillText(label, el.x, el.y + (ds.textoDy || -10));
        });
        ctx.restore();
      });
    }
  };

  // Plugin para sombrear a faixa de luz visível (380-750nm) atrás da
  // curva de Planck (Módulo 4) — equivalente ao `shapes` do Plotly.
  var faixaVisivelPlugin = {
    id: 'faixaVisivel',
    beforeDatasetsDraw: function (chart, args, opts) {
      if (!opts || !opts.ativo) return;
      var ctx = chart.ctx, xScale = chart.scales.x, yScale = chart.scales.y;
      var xIni = xScale.getPixelForValue(opts.x0), xFim = xScale.getPixelForValue(opts.x1);
      ctx.save();
      ctx.fillStyle = 'rgba(150,150,150,0.12)';
      ctx.fillRect(xIni, yScale.top, xFim - xIni, yScale.bottom - yScale.top);
      ctx.restore();
    }
  };
  Chart.register(textoPontosPlugin);

  // ================= Módulo 1: relação de Pogson =================
  (function () {
    var razaoSlider = document.getElementById('m1-razao'); // log10(F1/F2), de -3 a 3
    var razaoValor = document.getElementById('m1-razao-valor');
    var dmSpan = document.getElementById('m1-dm');
    var ctx = document.getElementById('m1-grafico').getContext('2d');
    var chart = null;

    function formataRazao(r) {
      if (r >= 1) return r.toPrecision(3).replace(/\.?0+$/, '').replace('.', ',');
      return r.toPrecision(3).replace('.', ',');
    }

    function desenhaPogson(logRazao) {
      var razao = Math.pow(10, logRazao);
      var dm = -2.5 * Math.log10(razao);

      var n = 200;
      var xs = [], ys = [];
      for (var i = 0; i <= n; i++) {
        var lr = -3 + (6 * i) / n;
        xs.push(Math.pow(10, lr));
        ys.push(-2.5 * lr);
      }

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(xs, ys, CORES_GRAFICO.curva),
            { data: [{ x: razao, y: dm }], borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 7, showLine: false }
          ]
        },
        options: chartBaseOptions('F₁ / F₂', 'm₁ − m₂', { xScale: { type: 'logarithmic' } })
      });

      razaoValor.textContent = formataRazao(razao);
      dmSpan.textContent = dm.toFixed(2).replace('.', ',').replace('-', '−');
    }

    razaoSlider.addEventListener('input', function () { desenhaPogson(Number(razaoSlider.value)); });
    desenhaPogson(Number(razaoSlider.value));
  })();

  // ================= Módulo 2: módulo de distância =================
  (function () {
    var mSlider = document.getElementById('m2-m');
    var MSlider = document.getElementById('m2-M');
    var mValor = document.getElementById('m2-m-valor');
    var MValor = document.getElementById('m2-M-valor');
    var distModSpan = document.getElementById('m2-dist-mod');
    var rSpan = document.getElementById('m2-r');
    var ctx = document.getElementById('m2-grafico').getContext('2d');
    var chart = null;

    function desenhaModuloDistancia() {
      var m = Number(mSlider.value);
      var M = Number(MSlider.value);
      var distMod = m - M;
      var r = Math.pow(10, (distMod + 5) / 5);

      var n = 150;
      var xs = [], ys = [];
      for (var i = 0; i <= n; i++) {
        var logr = -1 + (7 * i) / n; // r de 0.1 a 1e6 pc
        var rr = Math.pow(10, logr);
        xs.push(rr);
        ys.push(-5 + 5 * Math.log10(rr));
      }

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(xs, ys, CORES_GRAFICO.curva),
            { data: [{ x: r, y: distMod }], borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 7, showLine: false }
          ]
        },
        options: chartBaseOptions('distância r (pc)', 'm − M', { xScale: { type: 'logarithmic' } })
      });

      mValor.textContent = m.toFixed(1).replace('.', ',');
      MValor.textContent = M.toFixed(1).replace('.', ',');
      distModSpan.textContent = distMod.toFixed(2).replace('.', ',');
      rSpan.textContent = r < 1000 ? r.toFixed(2).replace('.', ',') : r.toExponential(2);
    }

    mSlider.addEventListener('input', desenhaModuloDistancia);
    MSlider.addEventListener('input', desenhaModuloDistancia);
    desenhaModuloDistancia();
  })();

  // ================= Módulo 3: diagrama cor-magnitude =================
  (function () {
    var ebvSlider = document.getElementById('m3-ebv');
    var rSliderCM = document.getElementById('m3-r');
    var ebvValor = document.getElementById('m3-ebv-valor');
    var rValorCM = document.getElementById('m3-r-valor');
    var ctx = document.getElementById('m3-grafico').getContext('2d');
    var chart = null;

    // Conjunto fixo de estrelas hipotéticas: (B-V)_0 intrínseco e V_0 intrínseca
    var estrelasBase = [
      { nome: 'O quente', bv0: -0.30, v0: 2.0 },
      { nome: 'A', bv0: 0.05, v0: 3.5 },
      { nome: 'F/G (tipo solar)', bv0: 0.65, v0: 5.0 },
      { nome: 'K', bv0: 1.00, v0: 6.5 },
      { nome: 'M fria', bv0: 1.50, v0: 8.5 }
    ];

    function desenhaCorMagnitude() {
      var ebv = Number(ebvSlider.value);
      var Rv = Number(rSliderCM.value);
      var av = Rv * ebv;

      var bv0 = estrelasBase.map(function (e) { return e.bv0; });
      var v0 = estrelasBase.map(function (e) { return e.v0; });
      var bvObs = estrelasBase.map(function (e) { return e.bv0 + ebv; });
      var vObs = estrelasBase.map(function (e) { return e.v0 + av; });
      var nomes = estrelasBase.map(function (e) { return e.nome; });

      // segmentos ligando intrínseca -> observada (equivalente às setas do Plotly, sem seta)
      var segmentos = estrelasBase.map(function (e, i) {
        return { data: [{ x: bv0[i], y: v0[i] }, { x: bvObs[i], y: vObs[i] }], borderColor: '#bbb', borderWidth: 1, pointRadius: 0, showLine: true, fill: false, tension: 0 };
      });

      var dsIntr = {
        data: bv0.map(function (x, i) { return { x: x, y: v0[i] }; }),
        pontoLabels: nomes, textoDy: -10,
        borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva,
        pointRadius: 6, pointStyle: 'circle', showLine: false, label: 'intrínseca (sem poeira)'
      };
      var dsObs = {
        data: bvObs.map(function (x, i) { return { x: x, y: vObs[i] }; }),
        borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador,
        pointRadius: 6, pointStyle: 'rectRot', showLine: false, label: 'observada (avermelhada + extinta)'
      };

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: segmentos.concat([dsIntr, dsObs]) },
        options: Object.assign(
          chartBaseOptions('B − V (mag)', 'V (mag)', { xScale: { type: 'linear' }, yScale: { type: 'linear', reverse: true } }),
          { plugins: { legend: { display: true, position: 'top', labels: { filter: function (item) { return item.text; } } }, tooltip: { enabled: false } } }
        )
      });

      ebvValor.textContent = ebv.toFixed(2).replace('.', ',');
      rValorCM.textContent = Rv.toFixed(2).replace('.', ',');
    }

    ebvSlider.addEventListener('input', desenhaCorMagnitude);
    rSliderCM.addEventListener('input', desenhaCorMagnitude);
    desenhaCorMagnitude();

    // Animação "ao vivo": varre E(B-V) de 0 até o máximo do slider,
    // reaproveitando exatamente o mesmo desenhaCorMagnitude() — não há
    // cálculo diferente durante a animação, só o valor do slider mudando
    // sozinho (ver nota explícita no HTML sobre o que é calculado vs.
    // ilustrativo).
    var playBtn = document.getElementById('m3-play'), resetBtn = document.getElementById('m3-reset');
    var ebvMax = Number(ebvSlider.max);
    createAnimController(playBtn, resetBtn, 6, function (t) {
      ebvSlider.value = String(t * ebvMax);
      desenhaCorMagnitude();
    }, { play: '▶ Aumentar extinção ao vivo', playing: '❚❚ Extinção aumentando…' });
  })();

  // ================= Módulo BC: correção bolométrica vs. T_eff =================
  (function () {
    // Tabela BC_V(T_eff) para estrelas de sequência principal (O a M),
    // extraída de Pecaut & Mamajek (2013, ApJS 208, 9), tabela mantida e
    // atualizada por Eric Mamajek em pas.rochester.edu/~emamajek — valores
    // lidos diretamente de EEM_dwarf_UBVIJHK_colors_Teff.txt (versão 2022.04.16).
    var tabelaBC = [
      [2810, -4.13], [3210, -2.51], [3560, -1.62], [3850, -1.15],
      [4100, -0.93], [4440, -0.63], [4830, -0.375], [5270, -0.195],
      [5480, -0.14], [5660, -0.105], [5770, -0.085], [5930, -0.065],
      [6180, -0.04], [6550, -0.02], [7220, 0.01], [8100, 0.00],
      [8600, -0.04], [9700, -0.21], [10700, -0.42], [12300, -0.73],
      [14500, -1.13], [17000, -1.54], [20600, -2.03], [24500, -2.44],
      [29000, -2.83], [33300, -3.11], [35100, -3.24], [37100, -3.41],
      [41400, -3.76]
    ];

    function bcInterpolado(T) {
      var Tmin = tabelaBC[0][0], Tmax = tabelaBC[tabelaBC.length - 1][0];
      T = Math.max(Tmin, Math.min(Tmax, T));
      for (var i = 0; i < tabelaBC.length - 1; i++) {
        var t0 = tabelaBC[i][0], t1 = tabelaBC[i + 1][0];
        if (T >= t0 && T <= t1) {
          var f = (T - t0) / (t1 - t0);
          return tabelaBC[i][1] + f * (tabelaBC[i + 1][1] - tabelaBC[i][1]);
        }
      }
      return tabelaBC[tabelaBC.length - 1][1];
    }

    var m5TeffSlider = document.getElementById('m5-teff');
    var m5MvSlider = document.getElementById('m5-mv');
    var m5TeffValor = document.getElementById('m5-teff-valor');
    var m5MvValor = document.getElementById('m5-mv-valor');
    var m5TeffSaida = document.getElementById('m5-teff-saida');
    var m5BcSpan = document.getElementById('m5-bc');
    var m5MbolSpan = document.getElementById('m5-mbol');
    var ctx = document.getElementById('m5-grafico').getContext('2d');
    var chart = null;

    var referenciasBC = [
      { nome: 'Sol (G2V)', T: 5772 },
      { nome: 'estrela O quente', T: 35000 },
      { nome: 'anã M fria', T: 3200 }
    ];

    function desenhaBC() {
      var T = Math.pow(10, Number(m5TeffSlider.value));
      var Mv = Number(m5MvSlider.value);
      var bc = bcInterpolado(T);
      var mbol = Mv + bc;

      var xsCurva = tabelaBC.map(function (p) { return p[0]; });
      var ysCurva = tabelaBC.map(function (p) { return p[1]; });

      var xsRef = referenciasBC.map(function (r) { return r.T; });
      var ysRef = referenciasBC.map(function (r) { return bcInterpolado(r.T); });
      var nomesRef = referenciasBC.map(function (r) { return r.nome; });

      var dsCurva = datasetCurva(xsCurva, ysCurva, CORES_GRAFICO.marcador);
      var dsRef = {
        data: xsRef.map(function (x, i) { return { x: x, y: ysRef[i] }; }),
        pontoLabels: nomesRef, textoDy: -10, corTexto: CORES_GRAFICO.extra,
        borderColor: CORES_GRAFICO.extra, backgroundColor: CORES_GRAFICO.extra,
        pointRadius: 5, pointStyle: 'rectRot', showLine: false
      };
      var dsAtual = { data: [{ x: T, y: bc }], borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva, pointRadius: 7, showLine: false };

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [dsCurva, dsRef, dsAtual] },
        options: chartBaseOptions('T_eff (K)', 'BC_V (mag)', { xScale: { type: 'logarithmic' } })
      });

      m5TeffValor.textContent = Math.round(T) + ' K';
      m5MvValor.textContent = Mv.toFixed(2).replace('.', ',');
      m5TeffSaida.textContent = Math.round(T);
      m5BcSpan.textContent = bc.toFixed(3).replace('.', ',').replace('-', '−');
      m5MbolSpan.textContent = mbol.toFixed(2).replace('.', ',');
    }

    m5TeffSlider.addEventListener('input', desenhaBC);
    m5MvSlider.addEventListener('input', desenhaBC);
    desenhaBC();
  })();

  // ================= Módulo 4: lei de Wien / curva de Planck =================
  (function () {
    var TSlider = document.getElementById('m4-T');
    var TValor = document.getElementById('m4-T-valor');
    var lambdaSpan = document.getElementById('m4-lambda');
    var hnuSpan = document.getElementById('m4-hnu');
    var ctx = document.getElementById('m4-grafico').getContext('2d');
    var chart = null;

    var h = 6.626e-34, c = 2.998e8, kB = 1.381e-23;
    var b = 2.898e-3;
    var eV = 1.602e-19;

    function planckLambda(lambda_m, T) {
      var x = (h * c) / (lambda_m * kB * T);
      if (x > 700) return 0; // evita overflow no exp
      return (2 * h * c * c) / Math.pow(lambda_m, 5) / (Math.exp(x) - 1);
    }

    function desenhaWien() {
      var T = Number(TSlider.value);
      var lambdaMax_nm = (b / T) * 1e9;

      var lambdaPlotMax_nm = Math.max(3000, lambdaMax_nm * 4);
      var n = 300;
      var xs = [], ys = [];
      var picoY = planckLambda(lambdaMax_nm * 1e-9, T);
      for (var i = 1; i <= n; i++) {
        var lam_nm = (lambdaPlotMax_nm * i) / n;
        xs.push(lam_nm);
        ys.push(planckLambda(lam_nm * 1e-9, T) / picoY); // normalizado ao pico
      }

      var opts = chartBaseOptions('λ (nm)', 'B_λ(T) (normalizado ao pico)', { xScale: { type: 'linear', min: 0, max: lambdaPlotMax_nm } });
      opts.plugins.faixaVisivel = { ativo: true, x0: 380, x1: 750 };

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            datasetCurva(xs, ys, CORES_GRAFICO.marcador),
            { data: [{ x: lambdaMax_nm, y: 1 }], borderColor: CORES_GRAFICO.curva, backgroundColor: CORES_GRAFICO.curva, pointRadius: 7, showLine: false }
          ]
        },
        options: opts,
        plugins: [faixaVisivelPlugin]
      });

      var hnuMax_eV = (2.821 * kB * T) / eV;

      TValor.textContent = T + ' K';
      lambdaSpan.textContent = lambdaMax_nm.toFixed(1).replace('.', ',');
      hnuSpan.textContent = hnuMax_eV.toFixed(3).replace('.', ',');
    }

    TSlider.addEventListener('input', desenhaWien);
    desenhaWien();
  })();

})();
