// =====================================================================
// Utilitários compartilhados pelos módulos interativos (Chart.js)
// Estrutura e Evolução Estelar — Notas de Aula (UFS)
//
// Carregar este arquivo (depois do Chart.js, antes do <script> de cada
// capítulo): <script src="assets/comuns.js"></script>
// =====================================================================

// =====================================================================
// CONST — constantes físicas em cgs, centralizadas (Auditoria, Sessão 2,
// Etapa 3.1). Antes desta sessão, cada capítulo mantinha sua própria
// cópia dessas constantes (valores conferidos idênticos entre si onde
// comparados — nenhum erro de valor encontrado — mas duplicados, sem
// fonte única). Fontes: CODATA 2018/2022 para constantes fundamentais;
// IAU para constantes solares/astronômicas (valores nominais).
// =====================================================================
var CONST = {
  G: 6.674e-8,             // cm^3 g^-1 s^-2 — constante gravitacional
  C: 2.99792458e10,        // cm/s — velocidade da luz (exata, por definição)
  H: 6.62607015e-27,       // erg s — constante de Planck (exata, SI 2019)
  KB: 1.380649e-16,        // erg/K — constante de Boltzmann (exata, SI 2019)
  NA: 6.02214076e23,       // /mol — número de Avogadro (exato, SI 2019)
  ME: 9.1093837015e-28,    // g — massa do elétron
  MA: 1.66053907e-24,      // g — unidade de massa atômica (dalton, "u")
  MH: 1.6726e-24,          // g — massa do próton (aproximação usual p/ "massa do hidrogênio" em astrofísica estelar)
  E: 4.80320425e-10,       // statC (esu) — carga elementar, unidades cgs-gaussianas
  SIGMA: 5.670374419e-5,   // erg cm^-2 s^-1 K^-4 — constante de Stefan-Boltzmann
  A_RAD: 7.5657e-15,       // erg cm^-3 K^-4 — constante de radiação (a = 4*sigma/c)
  MSUN: 1.989e33,          // g — massa solar
  RSUN: 6.957e10,          // cm — raio solar
  LSUN: 3.828e33,          // erg/s — luminosidade solar
  UA: 1.496e13,            // cm — unidade astronômica
  PC: 3.0857e18            // cm — parsec
};
CONST.HBAR = CONST.H / (2 * Math.PI);

// =====================================================================
// URL BASE DO REPOSITÓRIO / GITHUB PAGES.
// >>> QUANDO A URL REAL EXISTIR, EDITE SÓ ESTA LINHA <<<
// (o equivalente em LaTeX é \urlbase, definido em preambulo.tex — mesma
// ideia, duas linguagens; atualize as duas quando a URL existir).
// Preenche automaticamente o link "Repositório no GitHub" (id="link-repo")
// em toda página que carregar este arquivo — ver preencherLinkRepo() logo
// abaixo. Enquanto a URL não existe, o link fica como placeholder ('#').
// =====================================================================
var URL_REPO = '#';
function preencherLinkRepo() {
  var el = document.getElementById('link-repo');
  if (!el) return;
  el.href = URL_REPO;
  if (URL_REPO !== '#') el.removeAttribute('title');
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preencherLinkRepo);
  } else {
    preencherLinkRepo();
  }
}

// Paleta fixa dos gráficos — mesmas 3 cores em todos os capítulos que
// adotarem o padrão de card branco (ver .modulo-card em estilo.css).
var CORES_GRAFICO = {
  curva: '#1D9E75',    // verde-azulado — curva teórica principal
  marcador: '#D85A30', // terracota — valor atual / destaque
  extra: '#7F77DD'     // roxo — terceira série, quando necessário
};

// linspace(a, b, n): n pontos igualmente espaçados entre a e b (inclusive).
function linspace(a, b, n) {
  var pontos = [];
  if (n <= 1) { pontos.push(a); return pontos; }
  var passo = (b - a) / (n - 1);
  for (var i = 0; i < n; i++) pontos.push(a + i * passo);
  return pontos;
}

// nearestIdx(arr, v): índice do elemento de arr mais próximo de v.
function nearestIdx(arr, v) {
  var melhorIdx = 0;
  var melhorDist = Infinity;
  for (var i = 0; i < arr.length; i++) {
    var d = Math.abs(arr[i] - v);
    if (d < melhorDist) { melhorDist = d; melhorIdx = i; }
  }
  return melhorIdx;
}

// logSlider(t, logMin, logMax): mapeia t em [0,1] (posição linear de um
// slider) para um valor em escala logarítmica, 10^(logMin + t*(logMax-logMin)).
// Usado por sliders cujo range físico cobre muitas ordens de grandeza
// (razões geométricas, profundidade ótica, massa em unidades solares).
function logSlider(t, logMin, logMax) {
  return Math.pow(10, logMin + t * (logMax - logMin));
}

// invLogSlider(v, logMin, logMax): inversa de logSlider — devolve t em [0,1]
// a partir do valor físico v. Útil para posicionar o slider a partir de um
// valor de referência (ex. marcador de um objeto real).
function invLogSlider(v, logMin, logMax) {
  return (Math.log10(v) - logMin) / (logMax - logMin);
}

// chartBaseOptions(xTitulo, yTitulo, extra): opções padrão do Chart.js
// compartilhadas por todos os gráficos — sem legenda, grid neutro, fonte
// enxuta nos eixos. `extra` (opcional) é mesclado por cima (ex. escala
// logarítmica, range fixo).
function chartBaseOptions(xTitulo, yTitulo, extra) {
  var base = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { intersect: false, mode: 'nearest' },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: {
        title: { display: !!xTitulo, text: xTitulo || '', font: { size: 11 } },
        ticks: { font: { size: 11 }, color: '#666' },
        grid: { color: '#e8e6df' }
      },
      y: {
        title: { display: !!yTitulo, text: yTitulo || '', font: { size: 11 } },
        ticks: { font: { size: 11 }, color: '#666' },
        grid: { color: '#e8e6df' }
      }
    }
  };
  if (extra) {
    if (extra.xScale) Object.assign(base.scales.x, extra.xScale);
    if (extra.yScale) Object.assign(base.scales.y, extra.yScale);
  }
  return base;
}

// datasetCurva(xs, ys, cor): dataset de linha contínua, sem pontos.
function datasetCurva(xs, ys, cor) {
  return {
    data: xs.map(function (x, i) { return { x: x, y: ys[i] }; }),
    borderColor: cor || CORES_GRAFICO.curva,
    backgroundColor: cor || CORES_GRAFICO.curva,
    borderWidth: 2.5,
    pointRadius: 0,
    fill: false,
    tension: 0
  };
}

// datasetMarcador(xs, idx, ys, cor): dataset "esparso" com um único ponto
// visível (o valor atual), no índice idx do array — o padrão de marcador
// ao vivo usado em todos os módulos de curva.
function datasetMarcador(xs, idx, ys, cor) {
  var data = xs.map(function (x, i) {
    return { x: x, y: i === idx ? ys[i] : null };
  });
  return {
    data: data,
    borderColor: cor || CORES_GRAFICO.marcador,
    backgroundColor: cor || CORES_GRAFICO.marcador,
    pointRadius: data.map(function (p) { return p.y === null ? 0 : 6; }),
    pointHoverRadius: 6,
    borderWidth: 0,
    showLine: false,
    spanGaps: false
  };
}

// createAnimController(playBtn, resetBtn, durationSec, onFrame, labels):
// controlador play/pause/reset reutilizável via requestAnimationFrame,
// compartilhado por todos os módulos animados (evita reimplementar o
// mesmo tick/RAF em cada capítulo). onFrame(t) é chamado a cada quadro
// com t em [0,1] (fração do tempo total da animação); labels é opcional,
// {play: 'texto do botão parado', playing: 'texto do botão animando'}.
// Devolve { reset(), isAnimando() } — reset() também chama onFrame(0).
function createAnimController(playBtn, resetBtn, durationSec, onFrame, labels) {
  var animando = false, t = 0, rafId = null, lastTs = null;
  // labels.play pode ser uma string fixa ou uma função () => string, avaliada
  // a cada uso (útil quando o rótulo depende de um estado externo, como o
  // modo s/r do módulo de nuclídeos do Capítulo 10).
  function lblPlay() { var v = (labels && labels.play) || '▶ Iniciar'; return typeof v === 'function' ? v() : v; }
  var lblPlaying = (labels && labels.playing) || '❚❚ Animando…';
  function frame(ts) {
    if (lastTs == null) lastTs = ts;
    var dt = (ts - lastTs) / 1000; lastTs = ts;
    t += dt / durationSec;
    if (t >= 1) {
      t = 1; onFrame(t); animando = false;
      if (playBtn) playBtn.textContent = lblPlay();
      return;
    }
    onFrame(t);
    rafId = requestAnimationFrame(frame);
  }
  if (playBtn) {
    playBtn.textContent = lblPlay();
    playBtn.addEventListener('click', function () {
      if (animando) {
        animando = false;
        if (rafId) cancelAnimationFrame(rafId);
        playBtn.textContent = lblPlay();
        return;
      }
      animando = true; lastTs = null; t = 0; playBtn.textContent = lblPlaying;
      rafId = requestAnimationFrame(frame);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      animando = false;
      if (rafId) cancelAnimationFrame(rafId);
      t = 0;
      if (playBtn) playBtn.textContent = lblPlay();
      onFrame(0);
    });
  }
  return { isAnimando: function () { return animando; } };
}

// =====================================================================
// ShootingODE — integrador genérico "tipo Lane-Emden": resolve, por RK4,
// qualquer EDO de segunda ordem da forma
//   f''(y) + (2/y) f'(y) + g(f) = 0 ,   f(0)=1 ,  f'(0)=0 ,
// até a superfície onde f cruza um valor-limiar (threshold). Usado tanto
// pela equação de Lane-Emden (Cap. 6: threshold=0, g(f)=f^n, f''(0)=-1/3)
// quanto pela equação de Chandrasekhar (Cap. 9: threshold=1/z_c,
// g(f)=(f²-1/z_c²)^(3/2), f''(0)=-(1-1/z_c²)^(3/2)/3) — ambas equações
// mestras cujos parâmetros (n, z_c) apenas trocam g(f) e a condição
// inicial de curvatura f''(0), preservando a mesma estrutura numérica.
// A singularidade em y=0 (o termo 2f'/y é 0/0 ali) é contornada
// iniciando a integração em y0 pequeno via a série de Taylor
//   f(y) ≈ 1 + f''(0)/2 · y² ,  f'(y) ≈ f''(0) · y .
// =====================================================================
var SHOOT_Y0 = 1e-4, SHOOT_DY = 0.01, SHOOT_YMAX = 500, SHOOT_NAMOSTRAS = 300;

function shootSeriesStart(y0, f2at0) {
  return { f: 1 + 0.5 * f2at0 * y0 * y0, df: f2at0 * y0 };
}
function shootDeriv(y, f, df, g) {
  return { df: df, ddf: -g(f) - (2 / y) * df };
}
function shootStep(y, f, df, h, g) {
  var k1 = shootDeriv(y, f, df, g);
  var k2 = shootDeriv(y + h / 2, f + (h / 2) * k1.df, df + (h / 2) * k1.ddf, g);
  var k3 = shootDeriv(y + h / 2, f + (h / 2) * k2.df, df + (h / 2) * k2.ddf, g);
  var k4 = shootDeriv(y + h, f + h * k3.df, df + h * k3.ddf, g);
  return {
    f: f + (h / 6) * (k1.df + 2 * k2.df + 2 * k3.df + k4.df),
    df: df + (h / 6) * (k1.ddf + 2 * k2.ddf + 2 * k3.ddf + k4.ddf)
  };
}
// Fase 1: encontra a superfície y1 (busca rápida, sem armazenar a trajetória).
function shootFindSurface(g, f2at0, threshold, h, ymax) {
  var s = shootSeriesStart(SHOOT_Y0, f2at0);
  var y = SHOOT_Y0, f = s.f, df = s.df;
  while (y < ymax) {
    var nxt = shootStep(y, f, df, h, g);
    if (nxt.f <= threshold) {
      // Refinamento: um novo passo de RK4 com o tamanho exato até a
      // superfície estimada (mesma ordem de precisão do resto da
      // integração), em vez de interpolar linearmente entre os dois
      // últimos passos.
      var t = (f - threshold) / (f - nxt.f);
      var hy = t * h;
      var refin = shootStep(y, f, df, hy, g);
      return { y1: y + hy, dfR: refin.df, diverged: false };
    }
    y = y + h; f = nxt.f; df = nxt.df;
  }
  return { y1: null, dfR: null, diverged: true };
}
// Fase 2: reintegra de 0 a y1 armazenando ~nAmostras pontos, para gráficos.
function shootSample(g, f2at0, threshold, y1, nAmostras) {
  var h2 = y1 / nAmostras;
  var s = shootSeriesStart(SHOOT_Y0, f2at0);
  var ys = [0], fs = [1], dfs = [0];
  var y = SHOOT_Y0, f = s.f, df = s.df;
  ys.push(y); fs.push(f); dfs.push(df);
  while (y < y1 - 1e-9) {
    var hUse = Math.min(h2, y1 - y);
    var nxt = shootStep(y, f, df, hUse, g);
    y = y + hUse; f = Math.max(nxt.f, threshold); df = nxt.df;
    ys.push(y); fs.push(f); dfs.push(df);
  }
  return { ys: ys, fs: fs, dfs: dfs };
}
// solveShootingODE({g, f2at0, threshold, dy, ymax, nAmostras}) ->
// { y1, dfEnd, diverged, ys, fs, dfs }. dfEnd = f'(y1).
function solveShootingODE(opts) {
  var g = opts.g, f2at0 = opts.f2at0, threshold = opts.threshold || 0;
  var dy = opts.dy || SHOOT_DY, ymax = opts.ymax || SHOOT_YMAX;
  var nAmostras = opts.nAmostras || SHOOT_NAMOSTRAS;
  var surf = shootFindSurface(g, f2at0, threshold, dy, ymax);
  if (surf.diverged) {
    var samp0 = shootSample(g, f2at0, threshold, ymax, nAmostras);
    return { y1: null, dfEnd: null, diverged: true, ys: samp0.ys, fs: samp0.fs, dfs: samp0.dfs };
  }
  var samp = shootSample(g, f2at0, threshold, surf.y1, nAmostras);
  return { y1: surf.y1, dfEnd: surf.dfR, diverged: false, ys: samp.ys, fs: samp.fs, dfs: samp.dfs };
}
window.ShootingODE = { solve: solveShootingODE };
