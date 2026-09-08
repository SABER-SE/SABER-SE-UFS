// =====================================================================
// Módulos interativos do Capítulo 10 — Processos de Geração de Energia
// (Nucleossíntese)
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
// =====================================================================
(function () {
  'use strict';

  // ---------------- Constantes físicas ----------------
  var KB_KEV = 8.617333262e-8; // keV/K (constante de Boltzmann)
  var COEF_31_29 = 31.29;      // coeficiente numérico da Eq. 10.15 do capítulo
  // E_G[keV] = (31.29)^2 * Zi^2 * Zj^2 * A ; ver dedução no módulo do pico de Gamow.
  var COEF_EG = COEF_31_29 * COEF_31_29; // = 979.0641

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

  // E_G(Zi,Zj,A) em keV, a partir do coeficiente numérico 31,29 da Eq. 10.15
  // (2πη = 31,29 Zi Zj (A/E)^{1/2}, com E em keV): como 2πη = (E_G/E)^{1/2},
  // segue E_G[keV] = 31,29² · Zi² · Zj² · A.
  function energiaGamow(Zi, Zj, A) { return COEF_EG * Zi * Zi * Zj * Zj * A; }
  // E0 = (E_G · kT² / 4)^{1/3} — posição do pico de Gamow (mesma dedução da
  // Eq. 10.19, E0=(bkT/2)^{2/3}, com b=E_G^{1/2}).
  function picoGamow(EG, kT) { return Math.pow(EG * kT * kT / 4, 1 / 3); }
  window.GamowCap10 = { energiaGamow: energiaGamow, picoGamow: picoGamow, KB_KEV: KB_KEV };

  // =====================================================================
  // Módulo-estrela 1: Pico de Gamow
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mgamow-canvas');
    if (!canvas) return;
    var TS = document.getElementById('mgamow-T'), z1z2S = document.getElementById('mgamow-z1z2'), AS = document.getElementById('mgamow-A');
    var TV = document.getElementById('mgamow-T-valor'), z1z2V = document.getElementById('mgamow-z1z2-valor'), AV = document.getElementById('mgamow-A-valor');
    var kTEl = document.getElementById('mgamow-kT'), E0El = document.getElementById('mgamow-E0'), notaEl = document.getElementById('mgamow-nota');
    var chart = null;

    function desenha() {
      var logT = Number(TS.value) / 100; // slider 600-900 -> log10(T)=6.00-9.00
      var T = Math.pow(10, logT);
      var Zi = 1, Zj = Number(z1z2S.value); // Zi fixo =1 (próton incidente), Zj variável
      var A = Number(AS.value) / 100; // slider 10-2000 -> A = 0,10-20,00 amu

      TV.textContent = fmtExp(T, 2);
      z1z2V.textContent = Zj;
      AV.textContent = fmt(A, 2);

      var kT = KB_KEV * T; // keV
      var EG = energiaGamow(Zi, Zj, A); // keV
      var E0 = picoGamow(EG, kT); // keV
      kTEl.textContent = fmt(kT, 2) + ' keV';
      E0El.textContent = fmt(E0, 2) + ' keV';

      // faixa de plotagem em E: cobre a cauda maxwelliana e a curva de tunelamento
      var Emax = Math.max(6 * kT, 3 * E0, 1);
      var N = 200;
      var Es = linspace(Math.max(Emax / 400, 0.01), Emax, N);
      var maxwell = Es.map(function (E) { return Math.exp(-E / kT); });
      var tunel = Es.map(function (E) { return Math.exp(-Math.sqrt(EG / E)) / Math.exp(-Math.sqrt(EG / Emax)); });
      // normaliza tunel para ir de ~0 a ~1 no intervalo mostrado
      var tunelMax = Math.max.apply(null, tunel);
      tunel = tunel.map(function (v) { return v / tunelMax; });
      var produto = Es.map(function (E, i) { return maxwell[i] * Math.exp(-Math.sqrt(EG / E)); });
      var prodMax = Math.max.apply(null, produto);
      var produtoNorm = produto.map(function (v) { return prodMax > 0 ? v / prodMax : 0; });

      var ctx = canvas.getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Es.map(function (e) { return fmt(e, 1); }),
          datasets: [
            { data: Es.map(function (e, i) { return { x: e, y: maxwell[i] }; }), borderColor: CORES_GRAFICO.marcador, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0.15, label: 'e^{-E/kT}' },
            { data: Es.map(function (e, i) { return { x: e, y: tunel[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0.15, label: 'e^{-bE^{-1/2}}' },
            { data: Es.map(function (e, i) { return { x: e, y: produtoNorm[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'rgba(127,119,221,0.28)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.15, label: 'produto (pico de Gamow)' }
          ]
        },
        options: chartBaseOptions('E [keV]', 'amplitude (normalizada)', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0, max: 1.05 } })
      });

      var faixaValida;
      if (Zj === 1) faixaValida = E0 >= 4 && E0 <= 12;
      else faixaValida = E0 >= 15 && E0 <= 40;
      notaEl.textContent = 'kT=' + fmt(kT, 2) + ' keV; E₀=' + fmt(E0, 2) + ' keV (' + (Zj === 1 ? 'faixa esperada da cadeia p-p: 5–10 keV' : 'faixa esperada de reações Z moderado (ciclo CNO): 20–35 keV') + (faixaValida ? ' — dentro do esperado.' : ' — fora da faixa típica citada no texto para este Z; verifique unidades.');
    }
    [TS, z1z2S, AS].forEach(function (el) { el.addEventListener('input', desenha); });
    desenha();
  })();

  // =====================================================================
  // Módulo-estrela 2: Tunelamento através da barreira coulombiana
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mtunel-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mtunel-canvas', 300);
    var ES = document.getElementById('mtunel-E'), z1z2S = document.getElementById('mtunel-z1z2');
    var EV = document.getElementById('mtunel-E-valor'), z1z2V = document.getElementById('mtunel-z1z2-valor');
    var playBtn = document.getElementById('mtunel-play'), resetBtn = document.getElementById('mtunel-reset');
    var PEl = document.getElementById('mtunel-P'), notaEl = document.getElementById('mtunel-nota');
    var tentarBtn = document.getElementById('mtunel-tentar'), contadorEl = document.getElementById('mtunel-contador');
    var A_FIXO = 1; // massa reduzida de referência (~1 amu), fixada para este módulo didático
    var totalTentativas = 0, totalSucessos = 0;

    function P_atual() {
      var E = Number(ES.value) / 10; // slider 5-990 -> 0,5-99,0 keV
      var Zj = Number(z1z2S.value);
      var EG = energiaGamow(1, Zj, A_FIXO);
      var duasPiEta = COEF_31_29 * Zj * Math.sqrt(A_FIXO / E);
      return { E: E, P: Math.exp(-duasPiEta), duasPiEta: duasPiEta };
    }

    function desenhaFrame(t) {
      var info = P_atual();
      EV.textContent = fmt(info.E, 1);
      z1z2V.textContent = Number(z1z2S.value);
      PEl.textContent = fmtExp(info.P, 2);

      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var padL = 50, padB = 30, padT = 16, padR = 20;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      var rMax = 12, R0 = 1.4, E2_MEVFM = 1.44;
      var Zj = Number(z1z2S.value);
      function px(r) { return padL + (r / rMax) * plotW; }
      function Vr(r) { return r < R0 ? -8 : E2_MEVFM * Zj / r * 1000; } // keV
      var Ec = E2_MEVFM * Zj / R0 * 1000; // keV
      var Vmax = Math.max(Ec * 0.6, 20);
      function py(v) { return h - padB - ((v + 8) / (Vmax + 8)) * plotH; }

      ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('r (fm)', padL + plotW / 2, h - 8);

      ctx.strokeStyle = '#1c4878'; ctx.lineWidth = 2.2; ctx.beginPath();
      for (var r = 0.3; r <= rMax; r += 0.1) {
        var x = px(r), y = py(Math.min(Vr(r), Vmax + 8));
        if (r === 0.3) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = CORES_GRAFICO.marcador; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(padL, py(info.E)); ctx.lineTo(w - padR, py(info.E)); ctx.stroke(); ctx.setLineDash([]);

      var rTurn = info.E > 0 ? E2_MEVFM * Zj / (info.E / 1000) : rMax;
      var rParticula = rMax - t * (rMax - R0 * 0.9);
      var dentroBarreira = rParticula < rTurn;
      ctx.fillStyle = CORES_GRAFICO.curva;
      ctx.globalAlpha = dentroBarreira ? Math.max(0.06, Math.min(1, Math.sqrt(info.P) * 3)) : 1;
      ctx.beginPath(); ctx.arc(px(Math.max(R0 * 0.9, Math.min(rParticula, rTurn))), py(info.E), 6, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = 1;

      notaEl.textContent = 'P = e^{-2πη} = ' + fmtExp(info.P, 2) + ' (2πη=' + fmt(info.duasPiEta, 1) + '). ' +
        (dentroBarreira ? 'Dentro da barreira clássica (r < ' + fmt(rTurn, 2) + ' fm) — só atravessa por tunelamento; opacidade do marcador ∝ √P.' : 'Fora do raio de retorno clássico.');
    }
    createAnimController(playBtn, resetBtn, 4, desenhaFrame, { play: '▶ Aproximar núcleo', playing: '❚❚ Aproximando…' });
    ES.addEventListener('input', function () { desenhaFrame(0); });
    z1z2S.addEventListener('input', function () { desenhaFrame(0); });
    if (tentarBtn) {
      tentarBtn.addEventListener('click', function () {
        var info = P_atual();
        var N = 200000;
        var sucessos = 0;
        for (var i = 0; i < N; i++) { if (Math.random() < info.P) sucessos++; }
        totalTentativas += N; totalSucessos += sucessos;
        var fracao = totalSucessos / totalTentativas;
        contadorEl.textContent = 'Tentativas: ' + totalTentativas.toLocaleString('pt-BR') + ' — Sucessos: ' + totalSucessos.toLocaleString('pt-BR') +
          ' (fração empírica ' + fmtExp(fracao, 2) + '; P teórico = ' + fmtExp(info.P, 2) + '). ' +
          (info.P < 1e-4 ? 'Com P tão pequeno, mesmo centenas de milhares de tentativas simuladas aqui no navegador tipicamente não produzem nenhum sucesso — ilustrando concretamente a raridade do evento no núcleo estelar real.' : '');
      });
    }
    desenhaFrame(0.02);
  })();

  // =====================================================================
  // Módulo-estrela 3: Cadeia pp animada com ramificações PP I / II / III
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mppchain-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mppchain-canvas', 340);
    var playBtn = document.getElementById('mppchain-play'), resetBtn = document.getElementById('mppchain-reset');
    var simBtn = document.getElementById('mppchain-simular'), statsEl = document.getElementById('mppchain-stats');
    var ramoEl = document.getElementById('mppchain-ramo-atual');
    var FRACOES = { I: 0.86, II: 0.14 - 0.001, III: 0.001 }; // 86% / ~13,9% / 0,1%, somando 1
    var contagens = { I: 0, II: 0, III: 0 };
    var ramoSorteado = 'I';

    function sortearRamo() {
      var u = Math.random();
      if (u < FRACOES.III) return 'III';
      if (u < FRACOES.III + FRACOES.II) return 'II';
      return 'I';
    }

    // Coordenadas dos "nós" da rede (fração de largura/altura do canvas)
    var NOS = {
      p1: [0.06, 0.5], p2: [0.06, 0.35],
      d: [0.22, 0.5],
      he3: [0.38, 0.5],
      // PP I
      he4_I: [0.92, 0.15],
      // PP II
      be7_II: [0.55, 0.62], li7_II: [0.72, 0.62], he4_II: [0.92, 0.5],
      // PP III
      be7_III: [0.55, 0.85], b8_III: [0.72, 0.85], be8_III: [0.85, 0.85], he4_III: [0.92, 0.85]
    };
    function pt(nome, w, h) { var p = NOS[nome]; return { x: p[0] * w, y: p[1] * h }; }

    function desenhaRede(ctx, w, h, progresso, ramo) {
      ctx.clearRect(0, 0, w, h);
      ctx.font = '10.5px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      function no(nome, rotulo, cor) {
        var p = pt(nome, w, h);
        ctx.fillStyle = cor || '#eee'; ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 17, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#222'; ctx.fillText(rotulo, p.x, p.y);
      }
      function seta(n1, n2, cor) {
        var a = pt(n1, w, h), b = pt(n2, w, h);
        ctx.strokeStyle = cor || '#999'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      seta('p1', 'd', '#ccc'); seta('p2', 'd', '#ccc'); seta('d', 'he3', '#ccc');
      seta('he3', 'he4_I', '#ccc');
      seta('he3', 'be7_II', '#ccc'); seta('be7_II', 'li7_II', '#ccc'); seta('li7_II', 'he4_II', '#ccc');
      seta('he3', 'be7_III', '#ccc'); seta('be7_III', 'b8_III', '#ccc'); seta('b8_III', 'be8_III', '#ccc'); seta('be8_III', 'he4_III', '#ccc');

      no('p1', 'p'); no('p2', 'p'); no('d', 'd'); no('he3', '³He');
      no('he4_I', '⁴He', '#dfeee0'); no('be7_II', '⁷Be', '#eee'); no('li7_II', '⁷Li', '#eee'); no('he4_II', '⁴He', '#dfeee0');
      no('be7_III', '⁷Be', '#eee'); no('b8_III', '⁸B', '#eee'); no('be8_III', '⁸Be', '#eee'); no('he4_III', '⁴He', '#dfeee0');

      ctx.fillStyle = '#333'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('PP I (86%)', 8, 18);
      ctx.fillText('PP II (~14%)', 8, h * 0.62 + 28);
      ctx.fillText('PP III (~0,1%)', 8, h * 0.85 + 28);

      // marcador animado percorrendo o caminho escolhido
      var caminho = ['p1', 'd', 'he3'];
      if (ramo === 'I') caminho = caminho.concat(['he4_I']);
      else if (ramo === 'II') caminho = caminho.concat(['be7_II', 'li7_II', 'he4_II']);
      else caminho = caminho.concat(['be7_III', 'b8_III', 'be8_III', 'he4_III']);
      var nSeg = caminho.length - 1;
      var posGlobal = progresso * nSeg;
      var seg = Math.min(nSeg - 1, Math.floor(posGlobal));
      var fracSeg = posGlobal - seg;
      var a = pt(caminho[seg], w, h), b = pt(caminho[seg + 1], w, h);
      var mx = a.x + (b.x - a.x) * fracSeg, my = a.y + (b.y - a.y) * fracSeg;
      ctx.fillStyle = CORES_GRAFICO.marcador;
      ctx.beginPath(); ctx.arc(mx, my, 6.5, 0, 2 * Math.PI); ctx.fill();
    }

    function frame(t) {
      desenhaRede(state.ctx, state.w, state.h, t, ramoSorteado);
      ramoEl.textContent = 'PP ' + ramoSorteado;
    }
    var ctrl = createAnimController(playBtn, resetBtn, 3.2, frame, { play: '▶ Sortear e seguir uma partícula', playing: '❚❚ Seguindo…' });
    // Este listener é registrado DEPOIS do de createAnimController, então roda em
    // seguida no mesmo clique — a tempo de fixar ramoSorteado antes do primeiro
    // requestAnimationFrame (assíncrono) chamar frame(0) de fato.
    playBtn.addEventListener('click', function () {
      if (!ctrl.isAnimando()) return; // o clique que pausou, não que iniciou: ignora
      ramoSorteado = sortearRamo();
      contagens[ramoSorteado]++;
      atualizaStats();
    });
    resetBtn.addEventListener('click', function () { ramoSorteado = 'I'; });
    function atualizaStats() {
      var total = contagens.I + contagens.II + contagens.III;
      if (total === 0) { statsEl.textContent = 'Nenhum evento simulado ainda.'; return; }
      statsEl.textContent = 'N=' + total.toLocaleString('pt-BR') + ' — PP I: ' + fmt(100 * contagens.I / total, 1) +
        '% (esperado 86%) · PP II: ' + fmt(100 * contagens.II / total, 1) + '% (esperado ~14%) · PP III: ' +
        fmt(100 * contagens.III / total, 2) + '% (esperado ~0,1%)';
    }
    if (simBtn) {
      simBtn.addEventListener('click', function () {
        var N = 5000;
        for (var i = 0; i < N; i++) { contagens[sortearRamo()]++; }
        atualizaStats();
      });
    }
    frame(0.02);
    atualizaStats();
  })();

  // =====================================================================
  // Módulo-estrela 4: Ciclo CNO como catálise (loop fechado)
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mcno-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('mcno-canvas', 320);
    var playBtn = document.getElementById('mcno-play'), resetBtn = document.getElementById('mcno-reset');
    var voltaEl = document.getElementById('mcno-voltas'), notaEl = document.getElementById('mcno-nota');
    var voltas = 0;
    // Ciclo CNO-I: 12C(p,γ)13N(β+ν)13C(p,γ)14N(p,γ)15O(β+ν)15N(p,α)12C
    var CICLO = ['¹²C', '¹³N', '¹³C', '¹⁴N', '¹⁵O', '¹⁵N', '¹²C'];
    var RADIUS = 0.34; // fração do menor lado

    function posNo(i, n, cx, cy, R) {
      var ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
    }
    function desenha(t) {
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2 + 6, R = Math.min(w, h) * RADIUS;
      var n = CICLO.length - 1; // 6 nós distintos no laço fechado (o último repete o primeiro)
      ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < n; i++) {
        var p = posNo(i, n, cx, cy, R);
        var p2 = posNo(i + 1, n, cx, cy, R);
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        // seta indicando direção
        var mx = (p.x + p2.x) / 2, my = (p.y + p2.y) / 2;
        var ang2 = Math.atan2(p2.y - p.y, p2.x - p.x);
        ctx.save(); ctx.translate(mx, my); ctx.rotate(ang2);
        ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3, 3.5); ctx.lineTo(-3, -3.5); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      for (var j = 0; j < n; j++) {
        var pj = posNo(j, n, cx, cy, R);
        ctx.fillStyle = (j === 0) ? '#dfeee0' : '#eef2fb';
        ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(pj.x, pj.y, 22, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#222'; ctx.fillText(CICLO[j], pj.x, pj.y);
      }
      // marcador percorrendo o laço (fração t completa 1 volta)
      var posGlobal = t * n;
      var seg = Math.min(n - 1, Math.floor(posGlobal));
      var frac = posGlobal - seg;
      var a = posNo(seg, n, cx, cy, R), b = posNo(seg + 1, n, cx, cy, R);
      var mx2 = a.x + (b.x - a.x) * frac, my2 = a.y + (b.y - a.y) * frac;
      ctx.fillStyle = CORES_GRAFICO.marcador;
      ctx.beginPath(); ctx.arc(mx2, my2, 7, 0, 2 * Math.PI); ctx.fill();
      ctx.font = '10.5px sans-serif'; ctx.fillStyle = '#333';
      ctx.fillText('próton capturado (p,γ) ou (p,α)', mx2, my2 - 18);

      ctx.textAlign = 'left'; ctx.font = '11px sans-serif'; ctx.fillStyle = '#333';
      ctx.fillText('entra: próton (a cada passo) — sai no final: 1 partícula α (⁴He)', 8, h - 10);
    }
    function desenhaComContagem(t) {
      desenha(t);
      if (t >= 1) { voltas++; voltaEl.textContent = String(voltas); }
    }
    createAnimController(playBtn, resetBtn, 5, desenhaComContagem, { play: '▶ Girar o ciclo (1 volta = 4 capturas)', playing: '❚❚ Girando…' });
    resetBtn.addEventListener('click', function () { voltas = 0; voltaEl.textContent = '0'; });
    notaEl.textContent = 'C, N e O voltam ao ponto de partida ao fim do laço — não são consumidos líquidamente, apenas catalisam a conversão 4 ¹H → ⁴He, exatamente como o texto descreve.';
    desenha(0.02);
  })();

  // =====================================================================
  // Módulo-estrela 5: Triplo-alfa e a ressonância de Hoyle
  // =====================================================================
  (function () {
    var canvas = document.getElementById('m3alfa-canvas');
    if (!canvas) return;
    var state = setupRawCanvas('m3alfa-canvas', 300);
    var playBtn = document.getElementById('m3alfa-play'), resetBtn = document.getElementById('m3alfa-reset');
    var hoyleOnBtn = document.getElementById('m3alfa-hoyle-on'), hoyleOffBtn = document.getElementById('m3alfa-hoyle-off');
    var resultadoEl = document.getElementById('m3alfa-resultado'), statsEl = document.getElementById('m3alfa-stats');
    var comHoyle = true;
    // Probabilidades ESQUEMÁTICAS (não são as seções de choque reais, que são
    // muito menores) — escolhidas apenas para tornar visível, em poucas
    // tentativas, o efeito qualitativo central do texto: a ressonância de
    // Hoyle aumenta MUITO a chance de captura do terceiro alfa antes do
    // 8Be decair de volta.
    var P_CAPTURA_COM = 0.35, P_CAPTURA_SEM = 0.0006;
    var contagens = { com: { c12: 0, decaiu: 0 }, sem: { c12: 0, decaiu: 0 } };

    function setModo(com) {
      comHoyle = com;
      hoyleOnBtn.classList.toggle('ativo', com);
      hoyleOffBtn.classList.toggle('ativo', !com);
    }
    setModo(true);
    hoyleOnBtn.addEventListener('click', function () { setModo(true); });
    hoyleOffBtn.addEventListener('click', function () { setModo(false); });

    function desenha(t, capturou) {
      var ctx = state.ctx, w = state.w, h = state.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h * 0.38;
      ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // fase 1 (t<0.4): dois alfas se aproximando e formando 8Be
      // fase 2 (0.4-1): relógio de decaimento do 8Be correndo; se capturou, 3o alfa chega e forma 12C
      var faseFusao = Math.min(1, t / 0.35);
      var a1x = cx - 60 + faseFusao * 60, a2x = cx + 60 - faseFusao * 60;
      if (t < 0.4) {
        ctx.fillStyle = CORES_GRAFICO.curva;
        ctx.beginPath(); ctx.arc(a1x, cy, 14, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(a2x, cy, 14, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillText('α', a1x, cy); ctx.fillText('α', a2x, cy);
      } else {
        ctx.fillStyle = '#eee'; ctx.strokeStyle = '#963c1e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#222'; ctx.fillText('⁸Be', cx, cy);
        // relógio de decaimento (barra de vida do 8Be)
        var vida = Math.max(0, 1 - (t - 0.4) / 0.5);
        ctx.fillStyle = '#963c1e';
        ctx.fillRect(cx - 60, cy + 40, 120 * vida, 10);
        ctx.strokeStyle = '#963c1e'; ctx.strokeRect(cx - 60, cy + 40, 120, 10);
        ctx.font = '10.5px sans-serif'; ctx.fillStyle = '#333';
        ctx.fillText('"vida" do ⁸Be antes de decair de volta a 2α', cx, cy + 62);
        if (t > 0.55 && capturou) {
          // terceiro alfa chegando
          var a3prog = Math.min(1, (t - 0.55) / 0.35);
          var a3x = cx - 120 + a3prog * 120;
          ctx.fillStyle = CORES_GRAFICO.curva;
          ctx.beginPath(); ctx.arc(a3x, cy - 50, 12, 0, 2 * Math.PI); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.fillText('α', a3x, cy - 50);
          if (a3prog >= 1) {
            ctx.fillStyle = CORES_GRAFICO.extra;
            ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText('¹²C', cx, cy);
          }
        }
      }
    }

    var capturouEsteEvento = false;
    function frame(t) { desenha(t, capturouEsteEvento); }
    var ctrl = createAnimController(playBtn, resetBtn, 3.5, frame, { play: '▶ Colidir dois núcleos de ⁴He', playing: '❚❚ Animando…' });
    playBtn.addEventListener('click', function () {
      if (!ctrl.isAnimando()) return;
      var P = comHoyle ? P_CAPTURA_COM : P_CAPTURA_SEM;
      capturouEsteEvento = Math.random() < P;
      var grupo = comHoyle ? 'com' : 'sem';
      if (capturouEsteEvento) contagens[grupo].c12++; else contagens[grupo].decaiu++;
      atualizaStats();
    });
    function atualizaStats() {
      var c = contagens.com, s = contagens.sem;
      var totalC = c.c12 + c.decaiu, totalS = s.c12 + s.decaiu;
      var taxaC = totalC > 0 ? c.c12 / totalC : null;
      var taxaS = totalS > 0 ? s.c12 / totalS : null;
      statsEl.textContent = 'Com ressonância: ' + c.c12 + '/' + totalC + ' formaram ¹²C (' + (taxaC !== null ? fmt(100 * taxaC, 1) + '%' : '—') +
        '). Sem ressonância: ' + s.c12 + '/' + totalS + ' formaram ¹²C (' + (taxaS !== null ? fmt(100 * taxaS, 2) + '%' : '—') + ').' +
        (taxaC && taxaS ? ' Razão com/sem ≈ ' + fmt(taxaC / taxaS, 0) + '× — a ordem de grandeza do argumento de Hoyle (probabilidades aqui são esquemáticas, não as seções de choque nucleares reais).' : '');
    }
    resetBtn.addEventListener('click', function () { contagens = { com: { c12: 0, decaiu: 0 }, sem: { c12: 0, decaiu: 0 } }; atualizaStats(); });
    frame(0.02);
    atualizaStats();
  })();

  // =====================================================================
  // Módulo: comparador de dependência com T (pp vs. CNO vs. triplo-alfa)
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mcompT-canvas');
    if (!canvas) return;
    var TS = document.getElementById('mcompT-T'), nCNOS = document.getElementById('mcompT-nCNO');
    var TV = document.getElementById('mcompT-T-valor'), nCNOV = document.getElementById('mcompT-nCNO-valor');
    var dominanteEl = document.getElementById('mcompT-dominante');
    var chart = null;
    var T_REF_PP_CNO = 1.7e7; // K — cruzamento pp/CNO citado no texto
    var T_REF_3A = 1.0e8;     // K — regime típico de queima de hélio (âncora separada)

    function desenha() {
      var logT = 6 + Number(TS.value) / 100 * 2.5; // slider 0-100 -> log10 T de 6,0 a 8,5
      var T = Math.pow(10, logT);
      var nCNO = Number(nCNOS.value);
      TV.textContent = fmtExp(T, 2) + ' K';
      nCNOV.textContent = nCNO;

      var logTs = linspace(6, 8.5, 120);
      var yPP = logTs.map(function (lt) { return 4 * (lt - Math.log10(T_REF_PP_CNO)); });
      var yCNO = logTs.map(function (lt) { return nCNO * (lt - Math.log10(T_REF_PP_CNO)); });
      var y3A = logTs.map(function (lt) { return 40 * (lt - Math.log10(T_REF_3A)); });

      var ctx = canvas.getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: logTs.map(function (lt, i) { return { x: lt, y: yPP[i] }; }), borderColor: CORES_GRAFICO.marcador, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0 },
            { data: logTs.map(function (lt, i) { return { x: lt, y: yCNO[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0 },
            { data: logTs.map(function (lt, i) { return { x: lt, y: y3A[i] }; }), borderColor: CORES_GRAFICO.extra, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0 },
            { data: [{ x: logT, y: null }], borderColor: '#333', backgroundColor: '#333', pointRadius: 0, showLine: true, borderWidth: 1, borderDash: [3, 3] }
          ]
        },
        options: chartBaseOptions('log₁₀(T/K)', 'log₁₀(ε/ε_ref) [esquemático]', { xScale: { type: 'linear' }, yScale: { type: 'linear' } })
      });

      // qual domina no T escolhido (comparando as taxas relativas às respectivas âncoras)
      var vPP = 4 * (logT - Math.log10(T_REF_PP_CNO));
      var vCNO = nCNO * (logT - Math.log10(T_REF_PP_CNO));
      var v3A = 40 * (logT - Math.log10(T_REF_3A));
      var nome = 'cadeia pp'; var val = vPP;
      if (vCNO > val) { nome = 'ciclo CNO'; val = vCNO; }
      if (T > 6e7 && v3A > val) { nome = 'triplo-α (regime de queima de He, T≳10⁸ K)'; val = v3A; }
      dominanteEl.textContent = 'Em T=' + fmtExp(T, 2) + ' K, domina: ' + nome + '. Cruzamento pp→CNO citado no texto: T≳1,7×10⁷ K (marcado no gráfico com a curva CNO ultrapassando a pp).';
    }
    TS.addEventListener('input', desenha); nCNOS.addEventListener('input', desenha);
    desenha();
  })();

  // =====================================================================
  // Módulo: blindagem eletrônica (Debye–Hückel)
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mblindagem-canvas');
    if (!canvas) return;
    var neS = document.getElementById('mblindagem-ne'), TS = document.getElementById('mblindagem-T');
    var neV = document.getElementById('mblindagem-ne-valor'), TV = document.getElementById('mblindagem-T-valor');
    var rDEl = document.getElementById('mblindagem-rD'), notaEl = document.getElementById('mblindagem-nota');
    var chart = null;
    var E_ESU = CONST.E, KB_ERG = CONST.KB;

    function desenha() {
      var logRho = Number(neS.value) / 100 * 6; // slider 0-100 -> rho de 10^0 a 10^6 g/cm3 (proxy p/ densidade de carga)
      var rho = Math.pow(10, logRho);
      var logT = 6 + Number(TS.value) / 100 * 2; // 10^6 a 10^8 K
      var T = Math.pow(10, logT);
      neV.textContent = fmtExp(rho, 1) + ' g/cm³';
      TV.textContent = fmtExp(T, 1) + ' K';

      var zeta = 1.0; // valor de referência (hidrogênio puro ionizado, Zi(Zi+1)Xi/Ai ~ 2 para H com Fi=1... usamos zeta=1 como referência didática)
      var NA = CONST.NA;
      var rD = Math.sqrt((KB_ERG * T) / (4 * Math.PI * E_ESU * E_ESU * rho * NA * zeta)); // cm
      rDEl.textContent = fmtExp(rD, 2) + ' cm';

      var R0 = 1.4e-13; // cm, raio nuclear de referência
      var rMaxFm = 12;
      var rs_cm = linspace(0.3e-13, rMaxFm * 1e-13, 120);
      var Z = 1;
      var Vnu = rs_cm.map(function (r) { return Z * E_ESU * E_ESU / r; }); // erg, potencial nu
      var Vbl = rs_cm.map(function (r) { return Z * E_ESU * E_ESU / r * Math.exp(-r / rD); }); // blindado

      var ctx = canvas.getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            { data: rs_cm.map(function (r, i) { return { x: r * 1e13, y: Vnu[i] / 1.602176634e-6 }; }), borderColor: CORES_GRAFICO.marcador, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0 },
            { data: rs_cm.map(function (r, i) { return { x: r * 1e13, y: Vbl[i] / 1.602176634e-6 }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.2, pointRadius: 0, fill: false, tension: 0 }
          ]
        },
        options: chartBaseOptions('r [fm]', 'V(r) [MeV]', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0 } })
      });
      notaEl.textContent = 'Vermelho: potencial coulombiano nu, V=Ze²/r. Verde: potencial blindado, V=Ze²/r·e^{-r/r_D}. r_D=' + fmtExp(rD, 2) + ' cm ≈ ' + fmtExp(rD * 1e13, 1) + ' fm — quanto maior a densidade eletrônica, menor r_D e mais forte a blindagem em curto alcance, aumentando a taxa de reação efetiva.';
    }
    neS.addEventListener('input', desenha); TS.addEventListener('input', desenha);
    desenha();
  })();

  // =====================================================================
  // Módulo: rede de reações e o exemplo do ²⁵Al — integração ao vivo
  // =====================================================================
  (function () {
    var canvas = document.getElementById('mal25-canvas');
    if (!canvas) return;
    var rhoS = document.getElementById('mal25-rho'), XHs = document.getElementById('mal25-XH'), sigmavS = document.getElementById('mal25-sigmav');
    var rhoV = document.getElementById('mal25-rho-valor'), XHv = document.getElementById('mal25-XH-valor'), sigmavV = document.getElementById('mal25-sigmav-valor');
    var tauEl = document.getElementById('mal25-tau'), notaEl = document.getElementById('mal25-nota');
    var chart = null;
    var A_H = 1.0078;

    function desenha() {
      var rho = Math.pow(10, Number(rhoS.value) / 100 * 2 - 1); // slider 0-100 -> rho de 10^-1 a 10^1 g/cm3
      var XH = Number(XHs.value) / 100;
      var NAsigmav = Number(sigmavS.value) * 100; // slider 1-30 -> 100 a 3000 cm3 mol-1 s-1
      rhoV.textContent = fmtExp(rho, 2); XHv.textContent = fmt(XH, 2); sigmavV.textContent = fmtExp(NAsigmav, 2);

      var lambda = rho * (XH / A_H) * NAsigmav; // s^-1 (Eq. 10.43, N_A<σv> já embutido)
      var tau = 1 / lambda;
      var tauFinito = isFinite(tau);
      tauEl.textContent = tauFinito ? (fmtExp(tau, 3) + ' s') : '∞ (sem captura de próton nesta configuração)';

      var datasets;
      if (tauFinito) {
        var ts = linspace(0, 5 * tau, 150);
        var Ns = ts.map(function (t) { return Math.exp(-t / tau); });
        datasets = [
          { data: ts.map(function (t, i) { return { x: t, y: Ns[i] }; }), borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.4, pointRadius: 0, fill: false, tension: 0 },
          { data: [{ x: tau, y: Math.exp(-1) }], borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 6, showLine: false }
        ];
      } else {
        // X_H=0 (ou N_A<σv>=0): lambda=0, tau->infinito — sem canal de captura de
        // próton ativo, a abundância de 25Al não decai por este processo. Em vez de
        // tentar plotar uma curva com eixo temporal infinito (NaN), mostramos N/N0=1
        // constante, com a nota explicando por quê.
        datasets = [
          { data: [{ x: 0, y: 1 }, { x: 1, y: 1 }], borderColor: CORES_GRAFICO.curva, backgroundColor: 'transparent', borderWidth: 2.4, pointRadius: 0, fill: false, tension: 0 },
          { data: [{ x: 0, y: null }], borderColor: CORES_GRAFICO.marcador, backgroundColor: CORES_GRAFICO.marcador, pointRadius: 0, showLine: false }
        ];
      }

      var ctx = canvas.getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: chartBaseOptions('t [s]', 'N(²⁵Al)/N₀', { xScale: { type: 'linear' }, yScale: { type: 'linear', min: 0, max: 1.02 } })
      });
      notaEl.textContent = tauFinito
        ? ('τ_p(²⁵Al) = [ρ(X_H/A_H)N_A⟨σv⟩]⁻¹ = ' + fmtExp(tau, 3) + ' s (marcador: N/N₀=1/e em t=τ). Valores-padrão do slider reproduzem o exemplo do texto (ρ=0,1 g/cm³, X_H=0,7, N_A⟨σv⟩=1,3×10³ cm³mol⁻¹s⁻¹) — ver a caixa de atenção do capítulo sobre a correção de ρ=10⁻¹ (não 10¹) g/cm³.')
        : 'Com X_H=0 não há prótons disponíveis para a reação ²⁵Al(p,γ)²⁶Si — a taxa de destruição por este canal é zero (τ→∞) e a abundância de ²⁵Al não decai por captura de próton nesta configuração.';
    }
    rhoS.addEventListener('input', desenha); XHs.addEventListener('input', desenha); sigmavS.addEventListener('input', desenha);
    desenha();
  })();

  // =====================================================================
  // Módulo: equilíbrio D/H
  // =====================================================================
  (function () {
    var out = document.getElementById('mdh-razao');
    if (!out) return;
    var taupS = document.getElementById('mdh-taup-p'), taudS = document.getElementById('mdh-taup-d');
    var taupV = document.getElementById('mdh-taup-p-valor'), taudV = document.getElementById('mdh-taup-d-valor');
    var canvas = document.getElementById('mdh-canvas');
    var chart = null;
    function desenha() {
      var taup = Math.pow(10, Number(taupS.value) / 10); // slider 60-120 -> 10^6 a 10^12 s
      var taud = Math.pow(10, Number(taudS.value) / 10 - 6); // slider 0-60 -> 10^-6 a 10^0 s
      taupV.textContent = fmtExp(taup, 2) + ' s'; taudV.textContent = fmtExp(taud, 2) + ' s';
      var razao = taup / (2 * taud);
      out.textContent = fmtExp(razao, 3);
      if (canvas) {
        var ctx = canvas.getContext('2d');
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['τ_p(p)', 'τ_p(d)'],
            datasets: [{ data: [taup, taud], backgroundColor: [CORES_GRAFICO.marcador, CORES_GRAFICO.curva] }]
          },
          options: chartBaseOptions('', 'tempo [s], escala log', { yScale: { type: 'logarithmic' } })
        });
      }
    }
    taupS.addEventListener('input', desenha); taudS.addEventListener('input', desenha);
    desenha();
  })();

  // =====================================================================
  // Módulo: tabela comparativa interativa (pp / CNO / triplo-α)
  // =====================================================================
  (function () {
    var TS = document.getElementById('mtabcomp-T'), MS = document.getElementById('mtabcomp-M');
    if (!TS) return;
    var TV = document.getElementById('mtabcomp-T-valor'), MV = document.getElementById('mtabcomp-M-valor');
    var linhaPP = document.getElementById('linha-pp'), linhaCNO = document.getElementById('linha-cno'), linha3A = document.getElementById('linha-3alfa');
    function desenha() {
      var logT = 6 + Number(TS.value) / 100 * 2.5;
      var T = Math.pow(10, logT);
      var M = Number(MS.value) / 10;
      TV.textContent = fmtExp(T, 2) + ' K'; MV.textContent = fmt(M, 1) + ' M☉';
      [linhaPP, linhaCNO, linha3A].forEach(function (l) { if (l) l.classList.remove('linha-destacada'); });
      var destaque;
      if (T >= 9e7) destaque = linha3A;
      else if (T >= 1.7e7 || M >= 1.3) destaque = linhaCNO;
      else destaque = linhaPP;
      if (destaque) destaque.classList.add('linha-destacada');
    }
    TS.addEventListener('input', desenha); MS.addEventListener('input', desenha);
    desenha();
  })();

})();
