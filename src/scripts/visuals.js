/* Canvas visuals.
   Every thread visual runs on one small physics engine: each point of a thread is pushed away
   by the cursor, pulled back to its home by a spring, and damped. Threads near the cursor light
   up in warm, dispersed colour and fade back slowly. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LITE = window.innerWidth < 900;
  var TAU = Math.PI * 2;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function smooth(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  /* ---------- Pointer, shared by every canvas ---------- */

  var pointer = { x: 0, y: 0, on: false };
  window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true; }, { passive: true });
  var pointerOff = function () { pointer.on = false; };
  document.documentElement.addEventListener('mouseleave', pointerOff);
  window.addEventListener('blur', pointerOff);
  window.addEventListener('pointercancel', pointerOff);
  window.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') pointer.on = false; });

  // Sizes the canvas to its box, and only animates while it is on screen.
  function mount(canvas, draw) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, raf = 0, visible = false, start = performance.now(), last = start;
    var mouse = { x: 0, y: 0, on: false };

    function frame(now) {
      raf = 0;
      var dt = Math.min(0.034, Math.max(0.001, (now - last) / 1000)); last = now;
      if (w && h) {
        var r = canvas.getBoundingClientRect();
        mouse.x = pointer.x - r.left; mouse.y = pointer.y - r.top;
        mouse.on = pointer.on && mouse.x > -120 && mouse.y > -120 && mouse.x < w + 120 && mouse.y < h + 120;
        draw(ctx, w, h, (now - start) / 1000, dt, mouse, reduce);
      }
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      // large canvases render at a lower density; the threads are soft enough not to show it
      var dpr = Math.min(window.devicePixelRatio || 1, w * h > 500000 ? 1.5 : 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) frame(performance.now());
    }
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }, { rootMargin: '120px' }).observe(canvas);
  }

  /* ---------- Thread engine ---------- */

  // Colours a thread takes on near the cursor: mostly warm gold, with a few dispersed hues.
  var PALETTE = [[255, 196, 110], [255, 196, 110], [255, 170, 100], [255, 214, 150], [255, 150, 96], [126, 222, 208], [140, 178, 255], [255, 146, 190]];

  /* cfg.layout(t, tx, ty, depth, aux, N, K) writes each thread's home positions in unit space.
     Node 0 is the bright end of a thread. */
  function field(cfg) {
    var N = Math.max(60, Math.round(cfg.count * (LITE ? 0.6 : 1))), K = cfg.nodes, M = N * K;
    var rand = rng(cfg.seed);
    var px = new Float32Array(M), py = new Float32Array(M), vx = new Float32Array(M), vy = new Float32Array(M);
    var tx = new Float32Array(M), ty = new Float32Array(M);
    var depth = new Float32Array(N).fill(1), aux = new Float32Array(N);
    var hi = new Float32Array(N), op = new Float32Array(N), delay = new Float32Array(N), hold = new Float32Array(N), soft = new Float32Array(N).fill(1);
    var r1 = new Float32Array(N), r2 = new Float32Array(N), r3 = new Float32Array(N), tint = new Uint8Array(N);
    for (var i = 0; i < N; i++) { delay[i] = rand() * cfg.maxDelay; r1[i] = rand(); r2[i] = rand(); r3[i] = rand(); tint[i] = Math.floor(rand() * PALETTE.length); }
    var clock = 0, seeded = false;
    var SPRING = 60, DAMPING = 6, LEVELS = 14, ALPHA_MAX = 0.7;
    var BASE = cfg.rgb || [250, 250, 249], BASE_STR = BASE.join(',');

    function draw(ctx, w, h, t, dt, mouse, still) {
      var R = cfg.scale(w, h), cx = w * cfg.cx, cy = h * cfg.cy, i, j, k;
      cfg.layout(t, tx, ty, depth, aux, N, K);

      if (!seeded) {
        seeded = true;
        for (j = 0; j < M; j++) { px[j] = tx[j] * cfg.launch + (rand() - 0.5) * cfg.jitter; py[j] = ty[j] * cfg.launch + (rand() - 0.5) * cfg.jitter; }
      }

      if (still) {
        px.set(tx); py.set(ty); op.fill(1);
      } else {
        clock += dt;
        var mx = (mouse.x - cx) / R, my = (mouse.y - cy) / R, on = mouse.on;
        var springStep = Math.min(SPRING * dt, 0.6), damp = Math.exp(-DAMPING * dt);
        var radius = cfg.radius, strength = cfg.strength, maxV = cfg.maxVelocity;
        for (i = 0; i < N; i++) {
          var act = Math.min(1, Math.max(0, (clock - delay[i]) / (cfg.fade || 0.5)));
          op[i] += (act - op[i]) * Math.min((cfg.fade ? 8 : 2) * dt, 1);
          var free = clock >= hold[i];
          if (free && soft[i] < 1) soft[i] = Math.min(1, soft[i] + dt * 0.9);
          var pull = springStep * act * (free ? soft[i] : 0);

          var j0 = i * K;
          var hx = tx[j0] - mx, hy = ty[j0] - my;
          var want = on ? 1 - smooth(0, cfg.hiRadius, Math.sqrt(hx * hx + hy * hy)) : 0;
          hi[i] += (want - hi[i]) * Math.min((want > hi[i] ? 10 : 1.6) * dt, 1);

          for (k = 0; k < K; k++) {
            j = j0 + k;
            if (on) {
              var dx = px[j] - mx, dy = py[j] - my, d = Math.sqrt(dx * dx + dy * dy);
              if (d < radius) {
                var push = (1 - smooth(0, radius, d)) * strength * dt / (d > 0.0001 ? d : 1);
                vx[j] += dx * push; vy[j] += dy * push;
              }
            }
            var sp = Math.sqrt(vx[j] * vx[j] + vy[j] * vy[j]);
            if (sp > maxV) { vx[j] *= maxV / sp; vy[j] *= maxV / sp; }
            vx[j] -= (px[j] - tx[j]) * pull; vy[j] -= (py[j] - ty[j]) * pull;
            vx[j] *= damp; vy[j] *= damp;
            px[j] += vx[j] * dt; py[j] += vy[j] * dt;
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineWidth = cfg.width;
      var rev = cfg.reverse, levels = [], b;
      for (b = 0; b < LEVELS; b++) levels.push(new Path2D());
      for (i = 0; i < N; i++) {
        var o = op[i];
        if (o < 0.01) continue;
        var a0 = i * K, al = a0 + K - 1;
        var x0 = cx + px[a0] * R, y0 = cy + py[a0] * R, x1 = cx + px[al] * R, y1 = cy + py[al] * R;
        var dp = depth[i], g = hi[i];
        var flick = cfg.flicker ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.6 + r2[i] * 1.8) + r1[i] * TAU)) : 1;
        var sweep = cfg.sweep ? Math.pow(0.5 + 0.5 * Math.cos((aux[i] - t * 0.07) * TAU), 6) * cfg.sweep : 0;
        var a = (cfg.alpha * (0.3 + 0.7 * r1[i]) * flick + sweep) * dp * o;
        var cr = BASE[0], cg = BASE[1], cb = BASE[2];
        if (g > 0.02) {
          var c = PALETTE[tint[i]], m = Math.min(1, g * 1.5);
          cr += (c[0] - cr) * m; cg += (c[1] - cg) * m; cb += (c[2] - cb) * m;
          a = Math.min(1, a + g * cfg.hiAlpha * (0.35 + 0.65 * r2[i]) * (0.5 + 0.5 * dp) * o);
        }
        var qx, qy, mx2, my2;
        if (g > 0.02) {
          // Lit threads are few, so each gets its own colour gradient.
          var col = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ',';
          var grad = ctx.createLinearGradient(x0, y0, x1, y1);
          if (rev) { grad.addColorStop(0, col + '0)'); grad.addColorStop(0.6, col + a.toFixed(3) + ')'); grad.addColorStop(1, col + (a * 0.5).toFixed(3) + ')'); }
          else { grad.addColorStop(0, col + a.toFixed(3) + ')'); grad.addColorStop(1, col + (a * g * 0.25).toFixed(3) + ')'); }
          ctx.strokeStyle = grad;
          ctx.beginPath(); ctx.moveTo(x0, y0);
          for (k = 1; k < K - 1; k++) {
            qx = cx + px[a0 + k] * R; qy = cy + py[a0 + k] * R;
            ctx.quadraticCurveTo(qx, qy, (qx + cx + px[a0 + k + 1] * R) / 2, (qy + cy + py[a0 + k + 1] * R) / 2);
          }
          ctx.lineTo(x1, y1); ctx.stroke();
        } else {
          // Everything else is sorted into a few brightness levels and stroked in one go per level;
          // each thread fades along its length by stepping its pieces down through the levels.
          var sx = x0, sy = y0;
          for (k = 1; k < K; k++) {
            var frac = (k - 0.5) / (K - 1);
            var pa = a * (rev ? (frac < 0.6 ? frac / 0.6 : 1 - (frac - 0.6) * 1.25) : 1 - frac);
            var level = levels[Math.min(LEVELS - 1, (pa * LEVELS / ALPHA_MAX) | 0)];
            if (k < K - 1) {
              qx = cx + px[a0 + k] * R; qy = cy + py[a0 + k] * R;
              mx2 = (qx + cx + px[a0 + k + 1] * R) / 2; my2 = (qy + cy + py[a0 + k + 1] * R) / 2;
              if (pa >= 0.004) { level.moveTo(sx, sy); level.quadraticCurveTo(qx, qy, mx2, my2); }
              sx = mx2; sy = my2;
            } else if (pa >= 0.004) { level.moveTo(sx, sy); level.lineTo(x1, y1); }
          }
        }

        if (r3[i] < cfg.dots) {
          var ex = rev ? x1 : x0, ey = rev ? y1 : y0;
          var tw = 0.55 + 0.45 * Math.sin(t * 1.7 * (0.5 + r2[i]) + r1[i] * 40);
          var da = Math.min(1, (cfg.dotAlpha * tw * dp + g * 0.8) * o);
          var sz = cfg.dotSize * (0.6 + 0.8 * r1[i]) * (0.6 + 0.4 * dp) * (1 + g * 0.6);
          if (g > 0.12) {
            // chromatic split, as if the light were dispersing
            var e = 1 + g * 2.4;
            ctx.fillStyle = 'rgba(255,80,80,' + (da * 0.65).toFixed(3) + ')'; ctx.fillRect(ex - e - sz / 2, ey - sz / 2, sz, sz);
            ctx.fillStyle = 'rgba(80,150,255,' + (da * 0.65).toFixed(3) + ')'; ctx.fillRect(ex + e - sz / 2, ey - sz / 2, sz, sz);
          }
          ctx.fillStyle = (r2[i] < 0.1 ? 'rgba(249,201,122,' : r2[i] < 0.2 ? 'rgba(160,205,255,' : 'rgba(' + BASE_STR + ',') + da.toFixed(3) + ')';
          ctx.fillRect(ex - sz / 2, ey - sz / 2, sz, sz);
        }

        if (r2[i] < cfg.pulse) {
          // a point of light travelling along the thread
          var u = (r1[i] * 9 + t * (0.1 + r3[i] * 0.12) * cfg.pulseSpeed) % 1, f = u * (K - 1), k0 = Math.min(K - 2, f | 0), fr = f - k0;
          var pxx = cx + (px[a0 + k0] + (px[a0 + k0 + 1] - px[a0 + k0]) * fr) * R, pyy = cy + (py[a0 + k0] + (py[a0 + k0 + 1] - py[a0 + k0]) * fr) * R;
          ctx.fillStyle = 'rgba(255,225,190,' + (Math.sin(u * Math.PI) * 0.9 * o * dp).toFixed(3) + ')';
          ctx.fillRect(pxx - 0.9, pyy - 0.9, 1.8, 1.8);
        }
      }
      for (b = 0; b < LEVELS; b++) {
        ctx.strokeStyle = 'rgba(' + BASE_STR + ',' + ((b + 0.5) / LEVELS * ALPHA_MAX).toFixed(3) + ')';
        ctx.stroke(levels[b]);
      }
      if (cfg.after) cfg.after(ctx, cx, cy, R, t, dt, mouse, still);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Throw every thread outward and let it spring back to (possibly new) homes, softly and staggered.
    draw.kick = function (speed) {
      for (var i = 0; i < N; i++) {
        hold[i] = clock + r2[i] * 0.28; soft[i] = 0.05;
        var ang = rand() * TAU, s = speed * (0.25 + rand());
        for (var k = 0; k < K; k++) { vx[i * K + k] += Math.cos(ang) * s; vy[i * K + k] += Math.sin(ang) * s; }
      }
    };
    draw.count = N;
    return draw;
  }

  /* ---------- Hero: an atom whose orbits are bands of threads ---------- */

  function atom() {
    var rand = rng(11), per = null, TILT = 1.16;
    var A = [0, 0, 0];

    // Nucleus: a glossy blue sphere at the centre of the orbits, with a soft glow and a few
    // slowly turning meridians so it reads as a rotating solid.
    var grown = 0, lit = 0;
    function nucleus(ctx, cx, cy, R, t, dt, mouse, still) {
      grown = still ? 1 : Math.min(1, grown + dt * 1.4); // swells into place as the orbits assemble
      var ease = grown * grown * (3 - 2 * grown);
      var want = mouse.on && !still ? 1 - smooth(0.04, 0.5, Math.hypot((mouse.x - cx) / R, (mouse.y - cy) / R)) : 0;
      lit += (want - lit) * Math.min((want > lit ? 8 : 1.6) * dt, 1);
      var rad = R * 0.15 * (0.35 + 0.65 * ease) * (1 + 0.025 * Math.sin(t * 1.6) + lit * 0.1);
      ctx.globalCompositeOperation = 'source-over';

      var glow = ctx.createRadialGradient(cx, cy, rad * 0.6, cx, cy, rad * 3.6);
      glow.addColorStop(0, 'rgba(40,110,230,' + ((0.26 + 0.14 * lit) * ease).toFixed(3) + ')');
      glow.addColorStop(0.35, 'rgba(30,80,210,' + (0.08 * ease).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(10,40,200,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - rad * 3.6, cy - rad * 3.6, rad * 7.2, rad * 7.2);

      var body = ctx.createRadialGradient(cx - rad * 0.38, cy - rad * 0.42, rad * 0.05, cx, cy, rad);
      body.addColorStop(0, 'rgba(190,230,255,' + ease.toFixed(3) + ')');
      body.addColorStop(0.3, 'rgba(80,150,235,' + ease.toFixed(3) + ')');
      body.addColorStop(0.75, 'rgba(24,70,170,' + ease.toFixed(3) + ')');
      body.addColorStop(1, 'rgba(6,28,120,' + ease.toFixed(3) + ')');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.clip();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(200,230,255,' + (0.4 * ease).toFixed(3) + ')';
      var spin = t * 0.5;
      for (var m = 0; m < 3; m++) {
        var ang = spin + m * Math.PI / 3;
        ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5, Math.abs(Math.cos(ang)) * rad), rad, -0.35, 0, TAU); ctx.stroke();
      }
      ctx.beginPath(); ctx.ellipse(cx, cy, rad, rad * 0.32, -0.35, 0, TAU); ctx.stroke();
      ctx.restore();

      var spec = ctx.createRadialGradient(cx - rad * 0.4, cy - rad * 0.45, 0, cx - rad * 0.4, cy - rad * 0.45, rad * 0.3);
      spec.addColorStop(0, 'rgba(255,255,255,' + (0.9 * ease).toFixed(3) + ')');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = spec;
      ctx.beginPath(); ctx.arc(cx - rad * 0.4, cy - rad * 0.45, rad * 0.3, 0, TAU); ctx.fill();
    }

    // Three flat elliptical orbits, 60 degrees apart. Each is a tight stream of short light trails running
    // along the orbit, with an electron circling it; the whole figure turns slowly about the nucleus.
    var AX = 0.92, BX = 0.34, ELECTRONS = [0.55, -0.4, 0.3];
    function orbitPoint(o, th, t, off) {
      var cth = Math.cos(th), sth = Math.sin(th), az = o * Math.PI / 3 + t * 0.06, ca = Math.cos(az), sa = Math.sin(az);
      var nx = BX * cth, ny = AX * sth, nl = Math.sqrt(nx * nx + ny * ny);
      var x = AX * cth + nx / nl * off, y = BX * sth + ny / nl * off;
      return [x * ca - y * sa, x * sa + y * ca];
    }
    function electrons(ctx, cx, cy, R, t, still) {
      var show = still ? 1 : smooth(1.6, 2.4, t);
      if (show <= 0) return;
      ctx.globalCompositeOperation = 'lighter';
      for (var o = 0; o < 3; o++) {
        for (var tr = 0; tr < 8; tr++) {
          var th = t * ELECTRONS[o] + o * 2.1 - tr * 0.07 * Math.sign(ELECTRONS[o]), q = orbitPoint(o, th, t, 0);
          var a = (1 - tr / 8) * show, r = (tr === 0 ? 3.4 : 2.2 * a + 0.5);
          var g = ctx.createRadialGradient(cx + q[0] * R, cy + q[1] * R, 0, cx + q[0] * R, cy + q[1] * R, r * 3);
          g.addColorStop(0, 'rgba(220,245,255,' + (a * (tr === 0 ? 1 : 0.5)).toFixed(3) + ')');
          g.addColorStop(0.35, 'rgba(90,200,255,' + (a * 0.45).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(60,160,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(cx + q[0] * R - r * 3, cy + q[1] * R - r * 3, r * 6, r * 6);
        }
      }
    }
    return field({
      after: function (ctx, cx, cy, R, t, dt, mouse, still) { electrons(ctx, cx, cy, R, t, still); nucleus(ctx, cx, cy, R, t, dt, mouse, still); },
      seed: 3, count: 1000, nodes: 6, rgb: [120, 190, 225], maxDelay: 0.6, fade: 0.35, launch: 0.12, jitter: 0.5,
      cx: 0.5, cy: 0.5, scale: function (w, h) { return Math.min(w, h) * 0.34; },
      radius: 0.2, strength: 7, maxVelocity: 4, hiRadius: 0.4, hiAlpha: 0.85,
      width: 0.8, alpha: 0.6, dots: 0.12, dotAlpha: 0.9, dotSize: 2, pulse: 0, pulseSpeed: 1.4,
      layout: function (t, tx, ty, depth, aux, N, K) {
        if (!per) {
          per = [];
          var each = Math.floor(N / 3);
          for (var n = 0; n < N; n++) per.push({ o: n % 3, u: (Math.floor(n / 3) + rand() * 0.9) / each, off: (rand() + rand() - 1) * 0.045, len: 0.05 + rand() * 0.07 });
        }
        for (var i = 0; i < N; i++) {
          var s = per[i], dir = s.o === 1 ? -1 : 1;
          var th = s.u * TAU + t * 0.035 * dir;
          for (var k = 0; k < K; k++) {
            var q = orbitPoint(s.o, th + dir * s.len * k / (K - 1), t, s.off);
            tx[i * K + k] = q[0]; ty[i * K + k] = q[1];
          }
          depth[i] = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(th * 2 + s.o * 2.1 - t * 0.5));
        }
      }
    });
  }

  /* ---------- Outlines drawn as short flickering threads ---------- */

  // Extend a path from its last point: a straight run, or a quadratic bend, in n short steps.
  function run(p, x1, y1, n) {
    var a = p[p.length - 1];
    for (var i = 1; i <= n; i++) p.push([a[0] + (x1 - a[0]) * i / n, a[1] + (y1 - a[1]) * i / n]);
    return p;
  }
  function bend(p, qx, qy, x1, y1, n) {
    var a = p[p.length - 1];
    for (var i = 1; i <= n; i++) { var t = i / n, u = 1 - t; p.push([u * u * a[0] + 2 * u * t * qx + t * t * x1, u * u * a[1] + 2 * u * t * qy + t * t * y1]); }
    return p;
  }

  var SHAPES = {
    // radar: outer ring with an offset inner arc
    discover: function () {
      var a = [], b = [], i;
      for (i = 0; i <= 200; i++) { var th = i / 200 * TAU; a.push([Math.cos(th) * 0.92, Math.sin(th) * 0.92]); }
      for (i = 0; i <= 150; i++) { var t2 = -0.5 + i / 150 * (Math.PI + 1); b.push([Math.cos(t2) * 0.74 - 0.08, Math.sin(t2) * 0.74 + 0.06]); }
      return [a, b];
    },
    // shield
    protect: function () {
      var p = [], i, t;
      for (i = 0; i <= 40; i++) { t = i / 40; p.push([-0.74 + 1.48 * t, -0.78 - 0.12 * Math.sin(t * Math.PI)]); }
      for (i = 1; i <= 20; i++) { t = i / 20; p.push([0.74, -0.78 + 0.86 * t]); }
      for (i = 1; i <= 50; i++) { t = i / 50; var u = 1 - t; p.push([u * u * 0.74 + 2 * u * t * 0.7, u * u * 0.08 + 2 * u * t * 0.72 + t * t * 0.96]); }
      for (i = 1; i <= 50; i++) { t = i / 50; var v = 1 - t; p.push([2 * v * t * -0.7 + t * t * -0.74, v * v * 0.96 + 2 * v * t * 0.72 + t * t * 0.08]); }
      for (i = 1; i <= 20; i++) { t = i / 20; p.push([-0.74, 0.08 - 0.86 * t]); }
      return [p];
    },
    // two overlapping rings: from classical to post-quantum
    migrate: function () {
      var a = [], b = [], i;
      for (i = 0; i <= 180; i++) { var th = i / 180 * TAU; a.push([Math.cos(th) * 0.66 - 0.3, Math.sin(th) * 0.66]); b.push([Math.cos(th) * 0.66 + 0.3, Math.sin(th) * 0.66]); }
      return [a, b];
    },
    // three overlapping rings: three areas of work, one company
    trio: function () {
      var rings = [], c, i;
      for (c = 0; c < 3; c++) {
        var ang = -Math.PI / 2 + c * TAU / 3, ox = Math.cos(ang) * 0.34, oy = Math.sin(ang) * 0.34 + 0.06, ring = [];
        for (i = 0; i <= 180; i++) { var th = i / 180 * TAU; ring.push([ox + Math.cos(th) * 0.56, oy + Math.sin(th) * 0.56]); }
        rings.push(ring);
      }
      return rings;
    },
    // open book: two pages bowing away from a centre spine
    book: function () {
      function page(s) { return bend(run(bend([[0, -0.54]], s * 0.4, -0.82, s * 0.92, -0.7, 50), s * 0.92, 0.56, 50), s * 0.4, 0.44, 0, 0.72, 50); }
      return [page(-1).reverse(), page(1), run([[0, -0.54]], 0, 0.72, 40)];
    },
    // flask: a neck, sloping shoulders and a level line across the body
    flask: function () {
      var body = run([[0.2, -0.86]], 0.2, -0.3, 24);
      bend(run(body, 0.8, 0.66, 44), 0.91, 0.84, 0.68, 0.84, 14);
      bend(run(body, -0.68, 0.84, 50), -0.91, 0.84, -0.8, 0.66, 14);
      run(run(body, -0.2, -0.3, 44), -0.2, -0.86, 24);
      var level = [];
      for (var i = 0; i <= 60; i++) { var t = i / 60; level.push([-0.66 + 1.32 * t, 0.5 + 0.03 * Math.sin(t * TAU * 1.5)]); }
      return [body, run([[-0.34, -0.86]], 0.34, -0.86, 20), level];
    }
  };

  // Spread `count` ticks evenly along a shape's paths; each tick points along the path normal.
  function sample(name, count, rand) {
    var paths = SHAPES[name](), total = 0, lens = [], segs = [], out = [];
    paths.forEach(function (pts) {
      var seg = [], len = 0;
      for (var i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); len += d; }
      segs.push(seg); lens.push(len); total += len;
    });
    paths.forEach(function (pts, p) {
      var share = p === paths.length - 1 ? count - out.length : Math.round(count * lens[p] / total), seg = segs[p], acc = 0, k = 0;
      for (var n = 0; n < share; n++) {
        var target = (n + rand() * 0.9) / share * lens[p];
        while (k < seg.length - 1 && acc + seg[k] < target) { acc += seg[k]; k++; }
        var f = (target - acc) / (seg[k] || 1), p0 = pts[k], p1 = pts[k + 1];
        var ex = p1[0] - p0[0], ey = p1[1] - p0[1], el = Math.hypot(ex, ey) || 1;
        out.push({ x: p0[0] + ex * f, y: p0[1] + ey * f, nx: -ey / el, ny: ex / el, u: target / lens[p], len: 0.012 + Math.pow(rand(), 3) * 0.075, off: (rand() - 0.5) * 0.02 });
      }
    });
    return out;
  }

  function outline(names) {
    var rand = rng(71), sets = null, order = null, current = 0;
    var visual = field({
      seed: 9, count: 560, nodes: 3, maxDelay: 1.2, launch: 0.5, jitter: 0.6,
      cx: 0.5, cy: 0.5, scale: function (w, h) { return Math.min(w, h) * 0.46; },
      radius: 0.22, strength: 8, maxVelocity: 5, hiRadius: 0.44, hiAlpha: 0.9,
      width: 1, alpha: 0.5, flicker: true, sweep: 0.45, dots: 0.3, dotAlpha: 0.85, dotSize: 1.8, pulse: 0, pulseSpeed: 1,
      layout: function (t, tx, ty, depth, aux, N, K) {
        if (!sets) {
          sets = names.map(function (name) { return sample(name, N, rand); });
          order = new Int32Array(N); for (var n = 0; n < N; n++) order[n] = n;
        }
        var set = sets[current];
        for (var i = 0; i < N; i++) {
          var s = set[order[i]];
          aux[i] = s.u;
          for (var k = 0; k < K; k++) { var d = s.off + s.len * k / (K - 1); tx[i * K + k] = s.x + s.nx * d; ty[i * K + k] = s.y + s.ny * d; }
        }
      }
    });
    // Morph: every thread is dealt a new home on the next shape, so the outline scatters and re-forms.
    visual.show = function (index) {
      if (index === current || !sets || !names[index]) { current = names[index] ? index : current; return; }
      current = index;
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
      visual.kick(1.5);
    };
    return visual;
  }

  /* ---------- CTA: fibres bursting out from behind the headline ---------- */

  function burst() {
    var rand = rng(29), fibres = null;
    return field({
      seed: 5, count: 400, nodes: 8, maxDelay: 1.4, launch: 0.04, jitter: 0.1,
      cx: 0.5, cy: 0.62, scale: function (w, h) { return Math.max(w * 0.3, h * 0.52); },
      radius: 0.18, strength: 7, maxVelocity: 5, hiRadius: 0.34, hiAlpha: 0.8,
      width: 0.85, alpha: 0.17, reverse: true, dots: 0.5, dotAlpha: 0.9, dotSize: 1.9, pulse: 0.55, pulseSpeed: 1.6,
      layout: function (t, tx, ty, depth, aux, N, K) {
        if (!fibres) {
          fibres = [];
          for (var n = 0; n < N; n++) {
            var fan = (rand() + rand() + rand()) / 3; // bias toward straight up
            fibres.push({
              ang: rand() < 0.72 ? -Math.PI * (0.02 + fan * 0.96) : rand() * TAU,
              len: 0.35 + Math.pow(rand(), 1.6) * 1.25, bend: (rand() - 0.5) * 0.9,
              ox: (rand() - 0.5) * 0.1, oy: (rand() - 0.5) * 0.06, ph: rand() * TAU, sp: 0.2 + rand() * 0.5
            });
          }
        }
        for (var i = 0; i < N; i++) {
          var f = fibres[i], ang = f.ang + Math.sin(t * f.sp + f.ph) * 0.035, len = f.len;
          var ex = f.ox + Math.cos(ang) * len * 1.35, ey = f.oy + Math.sin(ang) * len * 0.82;
          var bend = f.bend + Math.sin(t * f.sp * 0.8 + f.ph) * 0.14;
          var mx = (f.ox + ex) / 2 - Math.sin(ang) * len * bend * 0.5, my = (f.oy + ey) / 2 + Math.cos(ang) * len * bend * 0.5 - len * 0.12;
          for (var k = 0; k < K; k++) {
            var u = k / (K - 1), v = 1 - u;
            tx[i * K + k] = v * v * f.ox + 2 * v * u * mx + u * u * ex;
            ty[i * K + k] = v * v * f.oy + 2 * v * u * my + u * u * ey;
          }
        }
      }
    });
  }

  /* ---------- Dotted wave field: the cursor presses a dent into it ---------- */

  function waves() {
    var NX = LITE ? 60 : 90, NZ = LITE ? 22 : 30;
    var glow = 0;
    return function (ctx, w, h, t, dt, mouse) {
      ctx.clearRect(0, 0, w, h);
      glow += ((mouse.on ? 1 : 0) - glow) * Math.min(dt * 5, 1);
      var reach = 150;
      for (var j = 0; j < NZ; j++) {
        var z = j / (NZ - 1), persp = 1 / (0.35 + z * 1.3);
        for (var i = 0; i < NX; i++) {
          var x = (i / (NX - 1) - 0.5) * 2;
          var y = Math.sin(x * 3.2 + t * 0.5 + z * 5) * 0.11 + Math.sin(x * 7.5 - t * 0.35 + z * 2) * 0.045 + Math.cos(z * 9 + t * 0.4 + x) * 0.05;
          var sx = w / 2 + x * w * 0.36 * persp;
          var sy = h * 0.5 + (y + 0.16) * h * 0.62 * persp;
          if (sx < -4 || sx > w + 4 || sy > h + 4) continue;
          var edge = 1 - Math.pow(Math.abs(x), 3);
          var a = (0.04 + 0.2 * (1 - z)) * edge * (0.6 + 0.4 * Math.sin(y * 20 + t));
          var s = 0.7 + (1 - z) * 1.1, near = 0;
          if (glow > 0.01) {
            var dx = sx - mouse.x, dy = sy - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < reach) {
              near = Math.pow(1 - d / reach, 2) * glow;
              var k = near * 22 / (d || 1);
              sx += dx * k; sy += dy * k;
              a += near * 0.75; s += near * 1.4;
            }
          }
          if (a < 0.012) continue;
          ctx.fillStyle = near > 0.05 ? 'rgba(' + (214 + 41 * near | 0) + ',' + (211 - 15 * near | 0) + ',' + (209 - 99 * near | 0) + ',' + Math.min(1, a).toFixed(3) + ')' : 'rgba(214,211,209,' + a.toFixed(3) + ')';
          ctx.fillRect(sx, sy, s, s);
        }
      }
    };
  }

  /* ---------- Mount ---------- */

  // AEGIS, Sthitha Academy, Research & Innovation
  var AREAS = ['protect', 'book', 'flask'];
  var FACTORY = {
    atom: atom,
    waves: waves,
    burst: burst,
    discover: function () { return outline(['discover']); },
    protect: function () { return outline(['protect']); },
    migrate: function () { return outline(['migrate']); },
    book: function () { return outline(['book']); },
    flask: function () { return outline(['flask']); },
    trio: function () { return outline(['trio']); },
    // one canvas shared by the three areas; it morphs as the active area changes
    areas: function () {
      var visual = outline(AREAS);
      window.addEventListener('features:change', function (e) { visual.show(e.detail); });
      return visual;
    }
  };

  document.querySelectorAll('canvas[data-visual]').forEach(function (canvas) {
    var make = FACTORY[canvas.getAttribute('data-visual')];
    if (make) mount(canvas, make());
  });
})();
