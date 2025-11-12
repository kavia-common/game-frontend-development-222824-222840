import React, { useEffect, useRef, useState } from "react";
import "../../styles/game-canvas.css";

/**
 * PUBLIC_INTERFACE
 * GameCanvas - Dream Dash: Cloud Chaser
 *
 * A self-contained multilayer canvas mini-game with a 60s session timer, AI event scheduler,
 * risk-reward star collection, hazards, bonuses, keyboard and mobile swipe controls, and a HUD overlay.
 *
 * Notes:
 * - No external dependencies. Uses requestAnimationFrame and simple arrays for entities.
 * - Ocean Professional palette via CSS variables. Background gradient subtly shifts hue.
 * - DPR capped at 2 for performance.
 */
export default function GameCanvas() {
  // Layered canvas refs
  const bgRef = useRef(null);   // background + gradient + far clouds
  const midRef = useRef(null);  // world: player, hazards, stars, particles
  const fgRef = useRef(null);   // effects: zaps, gust arrows, tornado indicators, jump trail
  const uiRef = useRef(null);   // HUD text, countdown, score, overlays

  // State for restart and accessibility
  const [sessionKey, setSessionKey] = useState(0); // increment to reset hooks cleanly

  useEffect(() => {
    const bg = bgRef.current?.getContext("2d");
    const mid = midRef.current?.getContext("2d");
    const fg = fgRef.current?.getContext("2d");
    const ui = uiRef.current?.getContext("2d");
    if (!bg || !mid || !fg || !ui) return;

    let disposed = false;

    // Utility theme colors
    const css = (v, fb) =>
      getComputedStyle(document.documentElement).getPropertyValue(v)?.trim() || fb;
    const CLR_PRIMARY = css("--color-primary-500", "#3B82F6");
    const CLR_PRIMARY600 = css("--color-primary", "#2563EB");
    const CLR_AMBER = css("--color-secondary", "#F59E0B");
    const CLR_TEXT = css("--color-text", "#111827");
    const CLR_SURFACE = css("--color-surface", "#ffffff");

    // DPR capped
    const getDpr = () => Math.min(2, window.devicePixelRatio || 1);

    // Viewport and metrics
    const wrapper = bgRef.current.parentElement;
    const view = {
      w: 1280,
      h: 720,
      dpr: getDpr(),
    };

    // Player props
    const player = {
      x: 150,
      y: 520,
      vx: 0,
      vy: 0,
      w: 36,
      h: 46,
      speed: 0.6,
      jump: 12,
      onGround: false,
      stunnedUntil: 0,
      invincibleUntil: 0,
      bonusUntil: 0,
      trail: [], // recent positions for rainbow arc
    };

    // World
    const gravity = 0.6;
    const floorY = () => view.h - 64;

    // Entities
    const stars = [];         // {x,y,r,vy,glowUntil}
    const particles = [];     // sparkle particles on collect
    const storms = [];        // {x,y,r,lightningAt,active}
    const gusts = [];         // {x,y,w,h,ax,until}
    const tornados = [];      // {x,y,r,power,until,angle}
    const clouds = [];        // simple cloud puffs: {x,y,w,h,dx,dy}
    const orbs = [];          // bonus or invincibility: {x,y,r,type,until,vy}

    // Score, time, and flow
    let score = 0;
    const startTime = performance.now();
    const totalDuration = 60000; // 60s
    let lastEventTime = 0;
    let eventInterval = 2600; // will reduce slightly over time for intensity
    let running = true;
    let timeUpShown = false;

    // Input
    const keys = { left: false, right: false, up: false };
    let swipe = { active: false, startX: 0, startY: 0, lastX: 0, lastY: 0, t0: 0 };

    // Resize and DPR setup
    const applySize = () => {
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      view.w = Math.floor(rect.width);
      view.h = Math.floor(rect.height);
      view.dpr = getDpr();

      [bgRef, midRef, fgRef, uiRef].forEach((r) => {
        if (!r.current) return;
        r.current.width = Math.floor(view.w * view.dpr);
        r.current.height = Math.floor(view.h * view.dpr);
        r.current.style.width = `${view.w}px`;
        r.current.style.height = `${view.h}px`;
      });

      [bg, mid, fg, ui].forEach((ctx) => {
        ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      });
    };
    applySize();
    const resizeObs = new ResizeObserver(applySize);
    resizeObs.observe(wrapper);

    // Helpers
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Background gradient hue shift
    const drawBackground = (now) => {
      const t = (now - startTime) / totalDuration; // 0..1
      const hueShift = 210 + t * 30; // blue to slightly teal
      const grad = bg.createLinearGradient(0, 0, 0, view.h);
      grad.addColorStop(0, `hsla(${hueShift}, 90%, 64%, 0.18)`);
      grad.addColorStop(1, `rgba(249,250,251,0.95)`);
      bg.fillStyle = grad;
      bg.fillRect(0, 0, view.w, view.h);

      // far clouds
      bg.globalAlpha = 0.6;
      bg.fillStyle = "rgba(255,255,255,0.9)";
      clouds.forEach((c) => {
        bg.beginPath();
        bg.ellipse(c.x, c.y, c.w, c.h, 0, 0, Math.PI * 2);
        bg.fill();
      });
      bg.globalAlpha = 1;
    };

    // Initialize some clouds
    for (let i = 0; i < 10; i++) {
      clouds.push({
        x: rnd(0, view.w),
        y: rnd(20, view.h * 0.35),
        w: rnd(50, 110),
        h: rnd(16, 28),
        dx: rnd(-0.15, 0.15),
        dy: rnd(-0.05, 0.05),
      });
    }

    const moveClouds = () => {
      clouds.forEach((c) => {
        c.x += c.dx;
        c.y += c.dy;
        if (c.x < -120) c.x = view.w + 120;
        if (c.x > view.w + 120) c.x = -120;
        if (c.y < 10 || c.y > view.h * 0.4) c.dy *= -1;
      });
    };

    // Stars spawning cadence with risk-reward: more spawn near hazards (storms)
    let lastStarSpawn = 0;
    let starInterval = 950;
    const maybeSpawnStar = (now) => {
      if (now - lastStarSpawn < starInterval) return;
      lastStarSpawn = now;

      // decide spawn zone: if storms exist, spawn one near storm
      let x = rnd(40, view.w - 40);
      let y = rnd(view.h * 0.25, view.h * 0.8);
      if (storms.length && Math.random() < 0.6) {
        const s = storms[(Math.random() * storms.length) | 0];
        const r = s.r * rnd(0.8, 1.2);
        const angle = rnd(0, Math.PI * 2);
        x = clamp(s.x + Math.cos(angle) * r, 20, view.w - 20);
        y = clamp(s.y + Math.sin(angle) * r, 20, floorY() - 20);
      }
      stars.push({
        x,
        y,
        r: rnd(6, 9),
        vy: rnd(-0.2, 0.2),
        glowUntil: 0,
      });
      // keep small
      if (stars.length > 50) stars.splice(0, stars.length - 50);
    };

    // Particles on star collect
    const spawnSparkles = (x, y, color) => {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x,
          y,
          vx: rnd(-1.5, 1.5),
          vy: rnd(-2.5, -0.5),
          life: rnd(300, 650),
          born: performance.now(),
          color,
        });
      }
      if (particles.length > 120) particles.splice(0, particles.length - 120);
    };

    // Hazards and bonuses
    const spawnStormCloud = () => {
      const r = rnd(40, 80);
      storms.push({
        x: rnd(r, view.w - r),
        y: rnd(90, view.h * 0.5),
        r,
        lightningAt: performance.now() + rnd(900, 1800),
        active: true,
      });
      if (storms.length > 3) storms.shift();
    };
    const createWindGust = () => {
      const w = rnd(160, 260);
      const h = rnd(80, 120);
      const ax = Math.random() < 0.5 ? -0.35 : 0.35;
      gusts.push({
        x: rnd(0, view.w - w),
        y: rnd(view.h * 0.4, floorY() - h - 10),
        w,
        h,
        ax,
        until: performance.now() + rnd(2000, 3800),
      });
      if (gusts.length > 3) gusts.shift();
    };
    const spawnTornado = () => {
      const r = rnd(50, 90);
      tornados.push({
        x: rnd(r, view.w - r),
        y: rnd(view.h * 0.45, floorY() - 20),
        r,
        power: rnd(0.45, 0.75),
        until: performance.now() + rnd(2500, 4200),
        angle: 0,
      });
      if (tornados.length > 2) tornados.shift();
    };
    const moveCloudRandomly = () => {
      // Slight shift of existing clouds to emulate platform drift
      clouds.forEach((c) => {
        c.dx += rnd(-0.04, 0.04);
        c.dy += rnd(-0.02, 0.02);
        c.dx = clamp(c.dx, -0.25, 0.25);
        c.dy = clamp(c.dy, -0.08, 0.08);
      });
    };
    const maybeDropBonusOrb = () => {
      const type = Math.random() < 0.5 ? "bonus" : "invincible";
      const x = rnd(30, view.w - 30);
      const y = -10;
      orbs.push({
        x,
        y,
        r: 10,
        type,
        until: performance.now() + 6000,
        vy: rnd(1.2, 1.8),
      });
      if (orbs.length > 3) orbs.shift();
    };

    // AI event scheduler
    const runEventScheduler = (now) => {
      const t = (now - startTime) / totalDuration; // 0..1
      // Increase intensity slightly
      eventInterval = 2600 - t * 800; // ~2600ms to ~1800ms
      if (now - lastEventTime < eventInterval) return;
      lastEventTime = now;

      const r = Math.random();
      if (r < 0.22) spawnStormCloud();
      else if (r < 0.44) createWindGust();
      else if (r < 0.64) moveCloudRandomly();
      else if (r < 0.8) spawnTornado();
      else if (r < 0.92) maybeDropBonusOrb();
      // remaining chance: no-op
    };

    // Drawing helpers
    const drawStars = (now) => {
      mid.save();
      stars.forEach((s) => {
        s.y += s.vy;
        mid.beginPath();
        mid.fillStyle = "rgba(255,255,255,0.95)";
        mid.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        mid.fill();

        // glow when bonus active
        if (now < player.bonusUntil) {
          mid.shadowBlur = 12;
          mid.shadowColor = CLR_AMBER;
          mid.globalAlpha = 0.75;
          mid.beginPath();
          mid.arc(s.x, s.y, s.r + 3, 0, Math.PI * 2);
          mid.fillStyle = CLR_AMBER;
          mid.fill();
          mid.globalAlpha = 1;
          mid.shadowBlur = 0;
        }
      });
      mid.restore();
    };

    const drawStorms = (now) => {
      storms.forEach((s) => {
        // cloud body
        mid.fillStyle = "rgba(30,41,59,0.6)";
        mid.beginPath();
        mid.ellipse(s.x, s.y, s.r, s.r * 0.6, 0, 0, Math.PI * 2);
        mid.fill();

        // occasional lightning
        if (now > s.lightningAt) {
          // flash
          fg.save();
          fg.globalCompositeOperation = "lighter";
          fg.strokeStyle = "rgba(255,255,255,0.95)";
          fg.lineWidth = 3;
          const segments = 5 + (Math.random() * 3) | 0;
          let lx = s.x;
          let ly = s.y + s.r * 0.5;
          for (let i = 0; i < segments; i++) {
            const nx = lx + rnd(-20, 20);
            const ny = ly + rnd(18, 36);
            fg.beginPath();
            fg.moveTo(lx, ly);
            fg.lineTo(nx, ny);
            fg.stroke();
            lx = nx;
            ly = ny;
          }
          fg.restore();

          // next zap schedule
          s.lightningAt = now + rnd(1200, 2200);

          // lightning punish window: if player near, stun and score -1
          const dx = player.x - s.x;
          const dy = player.y - (s.y + s.r * 0.5);
          const dist = Math.hypot(dx, dy);
          if (dist < s.r * 0.9 && now > player.invincibleUntil) {
            player.stunnedUntil = now + 700;
            player.vx += Math.sign(dx || 1) * 3;
            player.vy -= 6;
            score = Math.max(0, score - 1);
          }
        }
      });
    };

    const drawGusts = (now) => {
      // arrows indicating push
      gusts.forEach((g) => {
        if (now > g.until) return;
        fg.save();
        fg.globalAlpha = 0.6;
        fg.strokeStyle = g.ax > 0 ? CLR_PRIMARY : CLR_PRIMARY600;
        fg.lineWidth = 2;
        const arrows = 6;
        for (let i = 0; i < arrows; i++) {
          const y = g.y + (i + 1) * (g.h / (arrows + 1));
          const dir = g.ax > 0 ? 1 : -1;
          const x1 = g.x + (g.w * (i + 1)) / (arrows + 1) - dir * 14;
          const x2 = x1 + dir * 28;
          fg.beginPath();
          fg.moveTo(x1, y);
          fg.lineTo(x2, y);
          fg.moveTo(x2 - dir * 8, y - 6);
          fg.lineTo(x2, y);
          fg.lineTo(x2 - dir * 8, y + 6);
          fg.stroke();
        }
        fg.restore();
      });
    };

    const drawTornados = (now) => {
      tornados.forEach((t) => {
        if (now > t.until) return;
        t.angle += 0.12;
        // swirl indicator
        fg.save();
        fg.globalAlpha = 0.8;
        fg.strokeStyle = "rgba(99,102,241,0.8)";
        fg.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const r = t.r * (i / 6);
          fg.beginPath();
          fg.arc(t.x, t.y, r, t.angle + i * 0.4, t.angle + i * 0.4 + Math.PI * 0.7);
          fg.stroke();
        }
        fg.restore();
      });
    };

    const drawOrbs = (now) => {
      orbs.forEach((o) => {
        o.y += o.vy;
        const color = o.type === "bonus" ? CLR_AMBER : "#34D399";
        mid.save();
        mid.shadowBlur = 10;
        mid.shadowColor = color;
        mid.fillStyle = color;
        mid.beginPath();
        mid.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        mid.fill();
        mid.restore();
      });
    };

    const drawParticles = (now) => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.born;
        if (age > p.life) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        const a = 1 - age / p.life;
        fg.fillStyle = p.color;
        fg.globalAlpha = Math.max(0, a);
        fg.fillRect(p.x, p.y, 2, 2);
        fg.globalAlpha = 1;
      }
    };

    const drawPlayer = (now) => {
      // rainbow jump trail
      fg.save();
      if (player.trail.length > 1) {
        for (let i = 1; i < player.trail.length; i++) {
          const a = (i / player.trail.length) * 0.7;
          const px = player.trail[i - 1];
          const py = player.trail[i];
          const x1 = px.x, y1 = px.y;
          const x2 = py.x, y2 = py.y;
          const grd = fg.createLinearGradient(x1, y1, x2, y2);
          grd.addColorStop(0, "#F59E0B");
          grd.addColorStop(0.5, "#3B82F6");
          grd.addColorStop(1, "#10B981");
          fg.strokeStyle = grd;
          fg.globalAlpha = a;
          fg.lineWidth = 6;
          fg.beginPath();
          fg.moveTo(x1 + player.w / 2, y1 + player.h / 2);
          fg.lineTo(x2 + player.w / 2, y2 + player.h / 2);
          fg.stroke();
        }
      }
      fg.restore();

      // character
      const stunned = now < player.stunnedUntil;
      const inv = now < player.invincibleUntil;
      mid.save();
      mid.fillStyle = inv ? "rgba(16,185,129,0.85)" : CLR_PRIMARY;
      mid.strokeStyle = "rgba(0,0,0,0.15)";
      mid.lineWidth = 2;
      mid.beginPath();
      mid.roundRect(player.x, player.y, player.w, player.h, 10);
      mid.fill();
      mid.stroke();

      // face
      mid.fillStyle = "#fff";
      mid.beginPath();
      mid.arc(player.x + player.w * 0.35, player.y + player.h * 0.35, 3, 0, Math.PI * 2);
      mid.arc(player.x + player.w * 0.65, player.y + player.h * 0.35, 3, 0, Math.PI * 2);
      mid.fill();
      mid.strokeStyle = stunned ? "#EF4444" : "#111827";
      mid.lineWidth = 1.5;
      mid.beginPath();
      mid.moveTo(player.x + player.w * 0.3, player.y + player.h * 0.65);
      mid.quadraticCurveTo(
        player.x + player.w * 0.5,
        player.y + player.h * (stunned ? 0.4 : 0.75),
        player.x + player.w * 0.7,
        player.y + player.h * 0.65
      );
      mid.stroke();

      // aura when bonus active
      if (now < player.bonusUntil) {
        mid.save();
        mid.globalAlpha = 0.6;
        mid.strokeStyle = CLR_AMBER;
        mid.lineWidth = 4;
        mid.beginPath();
        mid.roundRect(player.x - 6, player.y - 6, player.w + 12, player.h + 12, 12);
        mid.stroke();
        mid.restore();
      }
      mid.restore();
    };

    const drawHUD = (now) => {
      const elapsed = now - startTime;
      const remain = Math.max(0, totalDuration - elapsed);
      const seconds = Math.ceil(remain / 1000);
      const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
      const ss = String(seconds % 60).padStart(2, "0");

      ui.clearRect(0, 0, view.w, view.h);
      ui.fillStyle = "rgba(0,0,0,0.55)";
      ui.font = "700 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";

      // Top-left: Timer
      ui.fillStyle = "rgba(0,0,0,0.6)";
      ui.fillRect(12, 12, 120, 38);
      ui.fillStyle = "#fff";
      ui.fillText(`⏱ ${mm}:${ss}`, 20, 36);

      // Top-center: Score and Multiplier
      const mult = now < player.bonusUntil ? "x2" : "x1";
      ui.fillStyle = "rgba(0,0,0,0.6)";
      const sw = 170;
      ui.fillRect(view.w / 2 - sw / 2, 12, sw, 38);
      ui.fillStyle = "#fff";
      ui.textAlign = "center";
      ui.fillText(`⭐ Score: ${score}  ·  ${mult}`, view.w / 2, 36);
      ui.textAlign = "left";

      // Top-right: Status badges
      let status = "Ready";
      if (now < player.stunnedUntil) status = "Stunned!";
      else if (now < player.invincibleUntil) status = "Invincible";
      else if (now < player.bonusUntil) status = "Bonus";

      const statusW = 130;
      ui.fillStyle = "rgba(0,0,0,0.6)";
      ui.fillRect(view.w - statusW - 12, 12, statusW, 38);
      ui.fillStyle = "#fff";
      ui.fillText(status, view.w - statusW + 10, 36);

      // Time up overlay
      if (!running && !timeUpShown) {
        // will be set later when stopping
      }
      if (timeUpShown) {
        ui.save();
        ui.fillStyle = "rgba(17,24,39,0.75)";
        ui.fillRect(0, 0, view.w, view.h);
        ui.fillStyle = "#fff";
        ui.textAlign = "center";
        ui.font = "800 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ui.fillText("Time Up!", view.w / 2, view.h / 2 - 20);
        ui.font = "700 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ui.fillText(`Final Score: ${score}`, view.w / 2, view.h / 2 + 12);
        ui.font = "600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ui.fillText("Press Enter or Tap to Restart", view.w / 2, view.h / 2 + 40);
        ui.restore();
      }

      // bottom line - Ocean Professional hint
      ui.fillStyle = "rgba(17,24,39,0.45)";
      ui.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
      ui.fillText("Ocean Professional • Arrow keys or swipe to move; up/swipe up to jump", 14, view.h - 12);
    };

    // Collisions
    const rectCircleIntersects = (rx, ry, rw, rh, cx, cy, cr) => {
      const testX = clamp(cx, rx, rx + rw);
      const testY = clamp(cy, ry, ry + rh);
      const dx = cx - testX;
      const dy = cy - testY;
      return dx * dx + dy * dy <= cr * cr;
    };

    // Keyboard controls
    const onKeyDown = (e) => {
      if (!running && e.key === "Enter") {
        restart();
        return;
      }
      if (nowTimeUp()) return;

      if (e.key === "ArrowLeft") keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;
      if (e.key === "ArrowUp") keys.up = true;
    };
    const onKeyUp = (e) => {
      if (e.key === "ArrowLeft") keys.left = false;
      if (e.key === "ArrowRight") keys.right = false;
      if (e.key === "ArrowUp") keys.up = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Touch controls: swipe left/right/jump
    const onTouchStart = (e) => {
      if (!running && timeUpShown) {
        restart();
        return;
      }
      const t = e.changedTouches[0];
      swipe = { active: true, startX: t.clientX, startY: t.clientY, lastX: t.clientX, lastY: t.clientY, t0: performance.now() };
    };
    const onTouchMove = (e) => {
      if (!swipe.active) return;
      const t = e.changedTouches[0];
      swipe.lastX = t.clientX;
      swipe.lastY = t.clientY;
      const dx = swipe.lastX - swipe.startX;
      const dy = swipe.lastY - swipe.startY;
      keys.left = dx < -20;
      keys.right = dx > 20;
      // up swipe triggers jump impulse once per swipe
      if (dy < -40) {
        keys.up = true;
      }
    };
    const onTouchEnd = () => {
      swipe.active = false;
      keys.left = false;
      keys.right = false;
      keys.up = false;
    };

    uiRef.current.addEventListener("touchstart", onTouchStart, { passive: true });
    uiRef.current.addEventListener("touchmove", onTouchMove, { passive: true });
    uiRef.current.addEventListener("touchend", onTouchEnd, { passive: true });

    // Restart logic
    const restart = () => {
      if (disposed) return;
      setSessionKey((k) => k + 1);
    };

    // Timer helpers
    const nowTimeUp = () => {
      const now = performance.now();
      return now - startTime >= totalDuration;
    };

    // Physics and world update
    const updatePlayer = (now, dt) => {
      const stunned = now < player.stunnedUntil;
      const inv = now < player.invincibleUntil;

      // input
      const ax = stunned ? 0 : (keys.left ? -player.speed : 0) + (keys.right ? player.speed : 0);
      player.vx += ax * dt * 0.06;

      // gust push
      gusts.forEach((g) => {
        if (now > g.until) return;
        if (player.x + player.w > g.x && player.x < g.x + g.w && player.y + player.h > g.y && player.y < g.y + g.h) {
          player.vx += g.ax * dt * 0.04;
        }
      });

      // tornado pull
      tornados.forEach((t) => {
        if (now > t.until) return;
        const dx = t.x - (player.x + player.w / 2);
        const dy = t.y - (player.y + player.h / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < t.r * 1.35) {
          const f = (t.power * (1 - dist / (t.r * 1.35))) * dt * 0.08;
          player.vx += (dx / (dist || 1)) * f;
          player.vy += (dy / (dist || 1)) * f;
        }
      });

      // movement
      player.vx *= 0.96;
      player.vy += gravity;
      // jump
      if (!stunned && keys.up && player.onGround) {
        player.vy = -player.jump;
        keys.up = false; // consume
      }
      player.x += player.vx;
      player.y += player.vy;

      // bounds and ground
      if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
      }
      if (player.x + player.w > view.w) {
        player.x = view.w - player.w;
        player.vx = 0;
      }
      if (player.y + player.h >= floorY()) {
        player.y = floorY() - player.h;
        player.vy = 0;
        player.onGround = true;
      } else {
        player.onGround = false;
      }

      // storms contact (body collision)
      storms.forEach((s) => {
        // treat storm as circle, body shock if overlap
        if (rectCircleIntersects(player.x, player.y, player.w, player.h, s.x, s.y, s.r * 0.9)) {
          if (!inv) {
            player.stunnedUntil = now + 600;
            player.vx += Math.sign(player.x + player.w / 2 - s.x || 1) * 2.5;
            player.vy -= 4.5;
            score = Math.max(0, score - 1);
          }
        }
      });

      // collect stars
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        if (rectCircleIntersects(player.x, player.y, player.w, player.h, s.x, s.y, s.r + 2)) {
          const bActive = now < player.bonusUntil;
          score += bActive ? 2 : 1;
          s.glowUntil = now + 250;
          spawnSparkles(s.x, s.y, bActive ? CLR_AMBER : "#ffffff");
          stars.splice(i, 1);
        }
      }

      // collect orbs
      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i];
        if (rectCircleIntersects(player.x, player.y, player.w, player.h, o.x, o.y, o.r + 1)) {
          if (o.type === "bonus") {
            player.bonusUntil = now + 5000;
          } else {
            player.invincibleUntil = now + 5000;
          }
          spawnSparkles(o.x, o.y, o.type === "bonus" ? CLR_AMBER : "#34D399");
          orbs.splice(i, 1);
        } else if (now > o.until || o.y - o.r > view.h) {
          orbs.splice(i, 1);
        }
      }

      // jump trail points
      player.trail.push({ x: player.x, y: player.y, t: now });
      // keep recent 15
      if (player.trail.length > 15) player.trail.shift();
    };

    // Main loop
    let last = performance.now();
    const loop = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = clamp(now - last, 16, 48); // ms
      last = now;

      // check time
      if (running && nowTimeUp()) {
        running = false;
        timeUpShown = true;
      }

      // clear layers
      bg.clearRect(0, 0, view.w, view.h);
      mid.clearRect(0, 0, view.w, view.h);
      fg.clearRect(0, 0, view.w, view.h);

      // background and far clouds
      drawBackground(now);
      moveClouds();

      if (running) {
        // AI scheduling
        runEventScheduler(now);
        // star spawn
        maybeSpawnStar(now);
        // update world
        updatePlayer(now, dt);
      }

      // world draw
      drawStars(now);
      drawStorms(now);
      drawOrbs(now);
      drawGusts(now);
      drawTornados(now);
      drawParticles(now);
      drawPlayer(now);
      drawHUD(now);

      if (!disposed) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // Cleanup
    return () => {
      disposed = true;
      try {
        resizeObs.disconnect();
      } catch {}
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (uiRef.current) {
        uiRef.current.removeEventListener("touchstart", onTouchStart);
        uiRef.current.removeEventListener("touchmove", onTouchMove);
        uiRef.current.removeEventListener("touchend", onTouchEnd);
      }
    };
  }, [sessionKey]);

  // Render layered canvases
  return (
    <div className="game-canvas-host surface" role="region" aria-label="Game Canvas">
      <div className="game-canvas-wrapper-169" role="application" aria-label="Dream Dash: Cloud Chaser">
        <canvas ref={bgRef} className="layer" aria-hidden="true" />
        <canvas ref={midRef} className="layer" aria-hidden="true" />
        <canvas ref={fgRef} className="layer" aria-hidden="true" />
        <canvas ref={uiRef} className="layer" aria-label="UI Overlay (Timer, Score, Status)" />
      </div>
    </div>
  );
}
