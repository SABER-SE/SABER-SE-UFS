// =====================================================================
// Módulos interativos do Capítulo 1 — Distância por Paralaxe
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// Migrado de Plotly.js para Chart.js/canvas 2D (Sessão 4 da auditoria).
// =====================================================================
(function () {
  'use strict';

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

  // ================= Módulo 1: geometria da paralaxe (diagrama) =================
  (function () {
    var distSlider = document.getElementById('p1-dist');
    var distValor = document.getElementById('p1-dist-valor');
    var alphaArcsec = document.getElementById('p1-alpha-arcsec');
    var alphaRad = document.getElementById('p1-alpha-rad');
    var state = setupRawCanvas('p1-diagrama', 380);

    function desenhaDiagrama(d_pc) {
      var alpha_arcsec = 1 / d_pc;
      var alpha_rad = alpha_arcsec * (Math.PI / (180 * 3600));

      // Ângulo de exibição (exagerado) apenas para fins visuais: mapeia
      // logaritmicamente d_pc em [1,1000] para um ângulo visual em [55°,10°],
      // preservando "mais distante => ângulo visualmente menor".
      var t = (Math.log10(d_pc) - 0) / 3; // 0..1
      var angVisualDeg = 55 - t * 45;
      var angVisualRad = angVisualDeg * Math.PI / 180;

      var R = 1; // raio orbital (UA), fixo no desenho
      var terra1 = [-R, 0];
      var terra2 = [R, 0];
      var sol = [0, 0];
      var yE = R / Math.tan(angVisualRad);
      var estrela = [0, yE + 0.001];

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);

      // mapeamento de coordenadas de dados (x em [-2, max(3, yE*0.3+2)], y em [-1.8, yE+1.2]) para pixels
      var xMin = -2, xMax = Math.max(3, yE * 0.3 + 2);
      var yMin = -1.8, yMax = yE + 1.2;
      var padL = 20, padR = 20, padT = 16, padB = 16;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      // preserva proporção 1:1 (equivalente a scaleanchor:'x' do Plotly)
      var escala = Math.min(plotW / (xMax - xMin), plotH / (yMax - yMin));
      var cx0 = padL + plotW / 2, cy0 = padT + plotH / 2;
      var xC = (xMin + xMax) / 2, yC = (yMin + yMax) / 2;
      function toPx(x, y) { return [cx0 + (x - xC) * escala, cy0 - (y - yC) * escala]; }

      // círculo orbital tracejado
      var pC = toPx(0, 0);
      ctx.strokeStyle = '#999'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(pC[0], pC[1], R * escala, 0, 2 * Math.PI); ctx.stroke();
      ctx.setLineDash([]);

      // linhas de visada Terra->estrela e Sol->estrela
      function linha(a, b, cor, largura, tracejado) {
        var pa = toPx(a[0], a[1]), pb = toPx(b[0], b[1]);
        ctx.strokeStyle = cor; ctx.lineWidth = largura;
        if (tracejado) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
        ctx.setLineDash([]);
      }
      linha(terra1, estrela, '#0d6e6e', 1.5, false);
      linha(terra2, estrela, '#963c1e', 1.5, false);
      linha(sol, estrela, '#c9c9c9', 1, true);

      // marcadores
      function marcador(p, raio, cor, forma) {
        var px = toPx(p[0], p[1]);
        ctx.fillStyle = cor;
        if (forma === 'star') {
          desenhaEstrela(ctx, px[0], px[1], raio, 5);
        } else {
          ctx.beginPath(); ctx.arc(px[0], px[1], raio, 0, 2 * Math.PI); ctx.fill();
        }
      }
      marcador(sol, 8, '#f4c542', 'circle');
      marcador(terra1, 5, '#3a6ea5', 'circle');
      marcador(terra2, 5, '#3a6ea5', 'circle');
      marcador(estrela, 7, '#e8823c', 'star');

      // rótulos de texto
      ctx.font = '11px -apple-system,Segoe UI,Arial,sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center';
      function rotulo(p, texto, dy) { var px = toPx(p[0], p[1]); ctx.fillText(texto, px[0], px[1] + dy); }
      rotulo(sol, 'Sol', 20);
      rotulo(terra1, 'Terra, t₀', 18);
      rotulo(terra2, 'Terra, t₀+6m', 18);
      rotulo(estrela, 'estrela', -14);

      // rótulo do ângulo alfa
      ctx.fillStyle = '#963c1e'; ctx.font = 'bold 14px -apple-system,Segoe UI,Arial,sans-serif';
      var pAlpha = toPx(terra2[0] * 0.5, yE * 0.35);
      ctx.fillText('α', pAlpha[0], pAlpha[1]);

      distValor.textContent = d_pc + ' pc';
      alphaArcsec.textContent = alpha_arcsec.toPrecision(4);
      alphaRad.textContent = alpha_rad.toExponential(3);
    }

    function desenhaEstrela(ctx, cx, cy, r, pontas) {
      ctx.beginPath();
      for (var i = 0; i < pontas * 2; i++) {
        var raio = i % 2 === 0 ? r : r * 0.45;
        var ang = (Math.PI / pontas) * i - Math.PI / 2;
        var x = cx + raio * Math.cos(ang), y = cy + raio * Math.sin(ang);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
    }

    distSlider.addEventListener('input', function () { desenhaDiagrama(Number(distSlider.value)); });
    window.addEventListener('resize', function () { state = setupRawCanvas('p1-diagrama', 380); desenhaDiagrama(Number(distSlider.value)); });
    desenhaDiagrama(Number(distSlider.value));
  })();

  // ================= Módulo 2: erro da aproximação de pequenos ângulos =================
  (function () {
    var maxSlider = document.getElementById('p2-max');
    var maxValor = document.getElementById('p2-max-valor');
    var erroSpan = document.getElementById('p2-erro');
    var ctx = document.getElementById('p2-grafico').getContext('2d');
    var chart = null;

    function desenhaErro(maxDeg) {
      var n = 200;
      var xsDeg = linspace(0, maxDeg, n + 1);
      var tanY = xsDeg.map(function (deg) { return Math.tan(deg * Math.PI / 180); });
      var aproxY = xsDeg.map(function (deg) { return deg * Math.PI / 180; });

      var maxRad = maxDeg * Math.PI / 180;
      var erroPct = 100 * (Math.tan(maxRad) - maxRad) / Math.tan(maxRad);

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            Object.assign(datasetCurva(xsDeg, tanY, '#963c1e'), { label: 'tan α (exato)' }),
            Object.assign(datasetCurva(xsDeg, aproxY, '#0d6e6e'), { label: 'α (radianos, aproximação)', borderDash: [6, 4] })
          ]
        },
        options: Object.assign(
          chartBaseOptions('α (graus)', 'tan α  ou  α (rad)', { xScale: { type: 'linear' } }),
          { plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: false } } }
        )
      });

      maxValor.textContent = maxDeg + '°';
      erroSpan.textContent = erroPct.toFixed(2) + '%';
    }

    maxSlider.addEventListener('input', function () { desenhaErro(Number(maxSlider.value)); });
    desenhaErro(Number(maxSlider.value));
  })();

  // ================= Módulo 3: calculadora paralaxe <-> distância =================
  (function () {
    var alphaNum = document.getElementById('p3-alpha-num');
    var alphaRange = document.getElementById('p3-alpha-range');
    var dNum = document.getElementById('p3-d-num');
    var dRange = document.getElementById('p3-d-range');
    if (!alphaNum) return;

    var atualizando = false;

    function setFromAlpha(alpha) {
      if (atualizando) return;
      atualizando = true;
      alpha = Math.max(0.0005, Math.min(1, alpha));
      var d = 1 / alpha;
      alphaNum.value = alpha;
      alphaRange.value = Math.log10(alpha);
      dNum.value = Number(d.toFixed(3));
      dRange.value = Math.log10(d);
      atualizando = false;
    }

    function setFromD(d) {
      if (atualizando) return;
      atualizando = true;
      d = Math.max(1, Math.min(2000, d));
      var alpha = 1 / d;
      dNum.value = d;
      dRange.value = Math.log10(d);
      alphaNum.value = Number(alpha.toPrecision(4));
      alphaRange.value = Math.log10(alpha);
      atualizando = false;
    }

    alphaNum.addEventListener('input', function () { setFromAlpha(Number(alphaNum.value)); });
    alphaRange.addEventListener('input', function () { setFromAlpha(Math.pow(10, Number(alphaRange.value))); });
    dNum.addEventListener('input', function () { setFromD(Number(dNum.value)); });
    dRange.addEventListener('input', function () { setFromD(Math.pow(10, Number(dRange.value))); });

    setFromAlpha(Number(alphaNum.value));
  })();

  // ================= Módulo 4: órbita da Terra e a paralaxe acontecendo =================
  (function () {
    var distSlider = document.getElementById('p4-dist');
    if (!distSlider) return;
    var distValor = document.getElementById('p4-dist-valor');
    var playBtn = document.getElementById('p4-play'), resetBtn = document.getElementById('p4-reset');
    var mesEl = document.getElementById('p4-mes'), descolEl = document.getElementById('p4-desloc');
    var orbState = setupRawCanvas('p4-orbita', 280);
    var ceuState = setupRawCanvas('p4-ceu', 280);
    var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    // fundo de estrelas fixas (posições ilustrativas, não um campo real)
    var FUNDO = [
      { x: -0.7, y: 0.5 }, { x: 0.6, y: 0.65 }, { x: -0.4, y: -0.6 },
      { x: 0.75, y: -0.35 }, { x: -0.85, y: -0.15 }, { x: 0.15, y: 0.8 },
      { x: 0.3, y: -0.75 }, { x: -0.15, y: 0.2 }
    ];

    function desenhaOrbita(fase) {
      var ctx = orbState.ctx, w = orbState.w, h = orbState.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 30;
      ctx.strokeStyle = '#ccc'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
      ctx.setLineDash([]);
      // Sol
      ctx.fillStyle = '#f4c542'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 2 * Math.PI); ctx.fill();
      // linha até a estrela-alvo (direção fixa, "para cima")
      ctx.strokeStyle = '#e0ddd2'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = CORES_GRAFICO.extra; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('estrela-alvo →', cx, 18);
      // Terra
      var ang = fase * 2 * Math.PI;
      var ex = cx + R * Math.sin(ang), ey = cy - R * Math.cos(ang);
      ctx.strokeStyle = CORES_GRAFICO.curva; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.fillStyle = CORES_GRAFICO.curva; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.fillText('Terra', ex, ey - 12);
    }

    function desenhaCeu(fase, d_pc) {
      var ctx = ceuState.ctx, w = ceuState.w, h = ceuState.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, escalaFundo = Math.min(w, h) / 2 - 20;
      ctx.fillStyle = '#888';
      FUNDO.forEach(function (s) {
        ctx.beginPath(); ctx.arc(cx + s.x * escalaFundo, cy + s.y * escalaFundo, 2.5, 0, 2 * Math.PI); ctx.fill();
      });
      // deslocamento da estrela-alvo: projeção senoidal da posição orbital,
      // normalizada para ocupar uma fração fixa do painel (amplitude visual
      // constante) — só a fase real depende de d_pc via a amplitude física
      // alpha=1/d_pc mostrada no texto; no desenho, a amplitude é sempre a
      // mesma para ficar visível (ver nota "o que é ilustrativo" no HTML).
      var amplitudePx = escalaFundo * 0.35;
      var dx = amplitudePx * Math.sin(fase * 2 * Math.PI);
      var alvoX = cx + dx, alvoY = cy;
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(cx - amplitudePx, alvoY); ctx.lineTo(cx + amplitudePx, alvoY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = CORES_GRAFICO.extra;
      ctx.beginPath();
      var pontas = 5, rEstrela = 7;
      for (var i = 0; i < pontas * 2; i++) {
        var raio = i % 2 === 0 ? rEstrela : rEstrela * 0.45;
        var angEstrela = (Math.PI / pontas) * i - Math.PI / 2;
        var px = alvoX + raio * Math.cos(angEstrela), py = alvoY + raio * Math.sin(angEstrela);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();

      var alpha_arcsec = 1 / d_pc;
      var deslocAtual = alpha_arcsec * Math.sin(fase * 2 * Math.PI);
      descolEl.textContent = fmtSinal(deslocAtual);
      var idxMes = Math.floor(fase * 12) % 12;
      mesEl.textContent = MESES[idxMes];
    }
    function fmtSinal(x) {
      var s = Math.abs(x) < 0.0001 ? x.toExponential(2) : x.toFixed(4);
      return (x >= 0 ? '+' : '') + s.replace('.', ',');
    }

    function desenha(fase) {
      var d_pc = Number(distSlider.value);
      distValor.textContent = fmt1(d_pc) + ' pc';
      desenhaOrbita(fase);
      desenhaCeu(fase, d_pc);
    }
    function fmt1(x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); }

    createAnimController(playBtn, resetBtn, 8, function (t) { desenha(t); }, { play: '▶ Iniciar órbita', playing: '❚❚ Orbitando…' });
    distSlider.addEventListener('input', function () { desenha(0); });
    desenha(0);
  })();

})();
