import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Load Iconify
    const scriptId = "iconify-landing";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // --- Custom Cursor ---
    const cursor = root.querySelector("#lp-cursor") as HTMLElement;
    const follower = root.querySelector("#lp-cursor-follower") as HTMLElement;
    if (!cursor || !follower) return;

    let mouseX = window.innerWidth / 2,
      mouseY = window.innerHeight / 2;
    let followerX = mouseX,
      followerY = mouseY;
    let cursorRaf: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      root.querySelectorAll(".lp-machined-panel").forEach((panel) => {
        const p = panel as HTMLElement;
        const rect = p.getBoundingClientRect();
        p.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        p.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("mousemove", onMouseMove);

    function animateCursor() {
      followerX += (mouseX - followerX) * 0.25;
      followerY += (mouseY - followerY) * 0.25;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      cursorRaf = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- Magnetic buttons ---
    const magneticBtns = root.querySelectorAll(".lp-magnetic-btn");
    const btnMoveHandlers: Array<[Element, (e: Event) => void, () => void]> = [];
    magneticBtns.forEach((btn) => {
      const onMove = (e: Event) => {
        const me = e as MouseEvent;
        const rect = (btn as HTMLElement).getBoundingClientRect();
        const x = me.clientX - rect.left - rect.width / 2;
        const y = me.clientY - rect.top - rect.height / 2;
        (btn as HTMLElement).style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        const inner = btn.querySelector(".lp-magnetic-btn-inner") as HTMLElement;
        if (inner) inner.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      };
      const onLeave = () => {
        (btn as HTMLElement).style.transform = `translate(0px, 0px)`;
        const inner = btn.querySelector(".lp-magnetic-btn-inner") as HTMLElement;
        if (inner) inner.style.transform = `translate(0px, 0px)`;
      };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
      btnMoveHandlers.push([btn, onMove, onLeave]);
    });

    // --- 3D stage tracking ---
    const heroStage = root.querySelector("#lp-hero-3d-stage") as HTMLElement;
    const onStageMove = (e: MouseEvent) => {
      if (!heroStage) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const tiltX = (cy - e.clientY) / 40;
      const tiltY = (e.clientX - cx) / 40;
      heroStage.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    };
    window.addEventListener("mousemove", onStageMove);

    // --- WebGL background ---
    const canvas = root.querySelector("#lp-webgl-canvas") as HTMLCanvasElement;
    let webglRaf: number;
    let onResize: (() => void) | null = null;

    if (canvas) {
      const gl = canvas.getContext("webgl");
      if (gl) {
        onResize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener("resize", onResize);
        onResize();

        const vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(
          vs,
          `attribute vec3 pos;
          uniform float t;
          varying float vA;
          void main() {
            float freq1 = sin(pos.x * 3.0 + t * 2.0);
            float wave = (freq1 * 0.15) * sin(t * 0.5 + pos.x);
            float z = mod(pos.z - t * 0.05, 1.0);
            vec2 p = pos.xy / (z * 2.0);
            p.y += wave / z;
            gl_Position = vec4(p, 0.0, 1.0);
            gl_PointSize = (1.2 - z) * 3.0;
            vA = (1.0 - z) * 0.5;
          }`
        );
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(
          fs,
          `precision mediump float;
          varying float vA;
          void main() { gl_FragColor = vec4(0.12, 0.54, 0.44, vA * 0.8); }`
        );
        gl.compileShader(fs);

        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const particles = new Float32Array(9000);
        for (let i = 0; i < 9000; i += 3) {
          particles[i] = (Math.random() - 0.5) * 6.0;
          particles[i + 1] = (Math.random() - 0.5) * 2.0;
          particles[i + 2] = Math.random();
        }
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);
        const pLoc = gl.getAttribLocation(prog, "pos");
        gl.enableVertexAttribArray(pLoc);
        gl.vertexAttribPointer(pLoc, 3, gl.FLOAT, false, 0, 0);
        const tLoc = gl.getUniformLocation(prog, "t");

        const draw = (now: number) => {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(tLoc, now / 1000.0);
          gl.drawArrays(gl.POINTS, 0, 3000);
          webglRaf = requestAnimationFrame(draw);
        };
        draw(0);
      }
    }

    // --- Scroll parallax ---
    const parallaxLayers = root.querySelectorAll(".lp-parallax-layer");
    const onScroll = () => {
      const scrolled = window.pageYOffset;
      parallaxLayers.forEach((layer) => {
        const speed = parseFloat((layer as HTMLElement).dataset.speed || "0");
        (layer as HTMLElement).style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll);

    // --- Reveal animations ---
    root.querySelectorAll(".lp-reveal-text").forEach((el) => el.classList.add("active"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("active");
        });
      },
      { threshold: 0.05 }
    );
    root.querySelectorAll(".lp-reveal-3d").forEach((el) => observer.observe(el));

    const revealTimeout = setTimeout(() => {
      root.querySelectorAll("section:nth-of-type(1) .lp-reveal-3d").forEach((el) => el.classList.add("active"));
    }, 150);

    // --- Dashboard link clicks ---
    const dashboardLinks = root.querySelectorAll("[data-navigate]");
    const linkClickHandlers: Array<[Element, (e: Event) => void]> = [];
    dashboardLinks.forEach((el) => {
      const handler = (e: Event) => {
        e.preventDefault();
        navigate((el as HTMLElement).dataset.navigate || "/dashboard");
      };
      el.addEventListener("click", handler);
      linkClickHandlers.push([el, handler]);
    });

    return () => {
      cancelAnimationFrame(cursorRaf);
      if (webglRaf) cancelAnimationFrame(webglRaf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousemove", onStageMove);
      window.removeEventListener("scroll", onScroll);
      if (onResize) window.removeEventListener("resize", onResize);
      observer.disconnect();
      clearTimeout(revealTimeout);
      btnMoveHandlers.forEach(([btn, onMove, onLeave]) => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", onLeave);
      });
      linkClickHandlers.forEach(([el, handler]) => {
        el.removeEventListener("click", handler);
      });
    };
  }, [navigate]);

  const html = `
    <div id="lp-cursor" style="position:fixed;top:0;left:0;width:6px;height:6px;background:#D4AF37;border-radius:50%;pointer-events:none;z-index:9999;transition:width 0.2s,height 0.2s,background 0.2s;will-change:transform;"></div>
    <div id="lp-cursor-follower" style="position:fixed;top:0;left:0;width:36px;height:36px;border:1px solid rgba(212,175,55,0.5);border-radius:50%;pointer-events:none;z-index:9998;transition:width 0.2s,height 0.2s,border-color 0.2s,background-color 0.2s;will-change:transform;"></div>

    <div style="position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;">
      <canvas id="lp-webgl-canvas" style="position:absolute;inset:0;opacity:0.35;width:100%;height:100%;"></canvas>
      <div style="position:absolute;inset:0;opacity:0.05;mix-blend-mode:overlay;background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');"></div>
    </div>

    <main style="position:relative;width:100%;overflow-x:hidden;">

      <!-- NAV -->
      <nav style="position:fixed;top:24px;left:0;right:0;z-index:50;display:flex;justify-content:center;padding:0 24px;pointer-events:none;">
        <div class="lp-machined-panel" style="padding:12px 24px;display:flex;align-items:center;justify-content:space-between;width:100%;max-width:72rem;pointer-events:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);">
          <div style="font-size:1.25rem;font-weight:900;color:#072425;letter-spacing:-0.05em;display:flex;align-items:center;gap:8px;">
            <iconify-icon icon="solar:soundwave-circle-bold" style="color:#D4AF37;font-size:1.5rem;"></iconify-icon>
            Voice<span style="color:#1F8A70;">Qual</span>
          </div>
          <div style="display:none;gap:2.5rem;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;" class="lp-nav-links">
            <a data-navigate="/features" style="color:inherit;text-decoration:none;cursor:pointer;">How It Works</a>
            <a data-navigate="/features" style="color:inherit;text-decoration:none;cursor:pointer;">Features</a>
            <a data-navigate="/pricing" style="color:inherit;text-decoration:none;cursor:pointer;">Pricing</a>
            <a data-navigate="/docs" style="color:inherit;text-decoration:none;cursor:pointer;">Docs</a>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <a data-navigate="/dashboard" style="display:none;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#4b5563;text-decoration:none;cursor:pointer;" class="lp-signin-link">Sign In</a>
            <button class="lp-magnetic-btn" data-navigate="/dashboard" style="background:#072425;color:#fff;padding:10px 24px;border-radius:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border:none;cursor:none;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);">
              <span class="lp-magnetic-btn-inner">Open Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- HERO -->
      <section style="position:relative;min-height:100vh;display:flex;align-items:center;padding:128px 24px 80px;max-width:80rem;margin:0 auto;overflow:hidden;z-index:10;perspective:1200px;transform-style:preserve-3d;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;width:100%;" class="lp-hero-grid">

          <div style="max-width:42rem;" class="lp-parallax-layer" data-speed="0.05">
            <h1 class="lp-reveal-text" style="font-size:clamp(3.5rem,8vw,80px);font-weight:900;color:#072425;letter-spacing:-0.05em;line-height:0.95;margin-bottom:2rem;text-transform:uppercase;">
              <span style="transition-delay:0.1s;">Isolate</span><br>
              <span style="transition-delay:0.2s;">the</span><br>
              <span style="transition-delay:0.3s;color:#D4AF37;">signal.</span>
            </h1>

            <p class="lp-reveal-3d" style="font-size:1.125rem;color:#6b7280;margin-bottom:2.5rem;font-weight:500;line-height:1.75;max-width:28rem;transition-delay:0.4s;">
              VoiceQual automates BANT-based qualification through AI voice calls. Hot leads go to your CRM the moment a call ends. Your reps only talk to people ready to buy.
            </p>

            <div class="lp-reveal-3d" style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;transition-delay:0.5s;">
              <button class="lp-magnetic-btn" data-navigate="/dashboard" style="background:#072425;color:#fff;padding:16px 32px;border-radius:12px;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;border:none;cursor:none;box-shadow:0 20px 25px -5px rgba(0,0,0,.1);">
                <span class="lp-magnetic-btn-inner" style="display:flex;align-items:center;gap:8px;">Open Dashboard</span>
              </button>
              <button class="lp-magnetic-btn lp-machined-panel" style="color:#072425;padding:16px 32px;border-radius:12px;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;border:none;cursor:none;">
                <span class="lp-magnetic-btn-inner" style="display:flex;align-items:center;gap:8px;">
                  <iconify-icon icon="solar:play-circle-bold"></iconify-icon> Watch 2-Min Demo
                </span>
              </button>
            </div>

            <div class="lp-reveal-3d" style="display:flex;align-items:center;gap:2rem;margin-top:2.5rem;padding-top:2rem;border-top:1px solid rgba(228,228,231,0.5);transition-delay:0.6s;">
              <div>
                <div style="font-size:1.5rem;font-weight:900;color:#0F3D3E;">&lt; 5 min</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">To First Call</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:900;color:#0F3D3E;">14 pt</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">Avg BANT Lift</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:900;color:#166350;">3×</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">Pipeline ROI</div>
              </div>
            </div>
          </div>

          <!-- Right 3D Stage -->
          <div class="lp-reveal-3d lp-parallax-layer" data-speed="-0.03" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;transition-delay:0.3s;">
            <div id="lp-hero-3d-stage" style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;transition:transform 75ms ease-out;transform-style:preserve-3d;">

              <div style="position:absolute;z-index:40;width:128px;height:128px;border-radius:50%;background:#0F3D3E;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px rgba(15,61,62,0.5);border:4px solid rgba(31,138,112,0.2);animation:lp-float-slow 4s infinite ease-in-out;transform:translateZ(120px);">
                <iconify-icon icon="solar:phone-calling-bold" style="font-size:50px;color:#D4AF37;position:relative;z-index:10;"></iconify-icon>
                <div style="position:absolute;inset:0;border-radius:50%;border:1px solid rgba(166,124,46,0.4);animation:ping 2.5s cubic-bezier(0,0,.2,1) infinite;"></div>
              </div>

              <div class="lp-message-pill" style="top:15%;left:0%;animation:lp-orbit-pop 8s infinite ease-in-out;animation-delay:0s;">
                <span style="width:6px;height:6px;border-radius:50%;background:#1F8A70;display:inline-block;vertical-align:middle;margin-right:6px;animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite;"></span> Priya Menon — Infosys: <span style="color:#166350;">HOT (9.1)</span>
              </div>
              <div class="lp-message-pill" style="bottom:20%;right:0%;animation:lp-orbit-pop 9s infinite ease-in-out;animation-delay:2.5s;">
                <span style="width:6px;height:6px;border-radius:50%;background:#1F8A70;display:inline-block;vertical-align:middle;margin-right:6px;animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite;"></span> Arjun Sharma — Wipro: <span style="color:#166350;">HOT (8.5)</span>
              </div>
              <div class="lp-message-pill" style="top:35%;right:0%;animation:lp-orbit-pop 7s infinite ease-in-out;animation-delay:5s;">
                <span style="width:6px;height:6px;border-radius:50%;background:#D4AF37;display:inline-block;vertical-align:middle;margin-right:6px;animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite;"></span> Calls Made Today: 990
              </div>
              <div class="lp-message-pill" style="bottom:10%;left:20%;animation:lp-orbit-pop 8.5s infinite ease-in-out;animation-delay:1.5s;">
                <span style="width:6px;height:6px;border-radius:50%;background:#1F8A70;display:inline-block;vertical-align:middle;margin-right:6px;animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite;"></span> Conversion: 34.7%
              </div>

              <div class="lp-coil-ring" style="width:240px;height:240px;animation:lp-rotate-cw 22s linear infinite;transform:translateZ(80px);">
                <div style="position:absolute;inset:0;border:3px solid rgba(212,175,55,0.3);border-radius:50%;"></div>
                <div style="position:absolute;inset:4px;border:2px solid rgba(212,175,55,0.3);border-radius:50%;opacity:0.7;"></div>
                <div style="position:absolute;inset:8px;border:1px solid rgba(212,175,55,0.3);border-radius:50%;opacity:0.4;"></div>
                <div style="position:absolute;top:0;left:50%;width:16px;height:16px;background:#0F3D3E;border-radius:50%;box-shadow:0 0 15px rgba(0,0,0,0.5);transform:translate(-50%,-50%);border:1px solid #1F8A70;"></div>
              </div>

              <div class="lp-coil-ring" style="width:380px;height:380px;border-color:rgba(212,212,216,0.6);animation:lp-rotate-ccw 35s linear infinite;transform:translateZ(30px);">
                <div style="position:absolute;bottom:25%;right:0;width:16px;height:16px;background:#D4AF37;border-radius:50%;box-shadow:0 0 20px rgba(212,175,55,0.8);"></div>
                <div style="position:absolute;top:25%;left:0;width:12px;height:12px;background:#1F8A70;border-radius:50%;box-shadow:0 0 15px rgba(31,138,112,0.8);"></div>
              </div>

              <div class="lp-coil-ring" style="width:540px;height:540px;border-width:2px;border-color:rgba(212,212,216,0.4);animation:lp-rotate-cw 50s linear infinite;transform:translateZ(-40px);">
                <div style="position:absolute;top:0;left:50%;width:16px;height:32px;background:#a1a1aa;transform:translate(-50%,-50%);border-radius:2px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);"></div>
                <div style="position:absolute;bottom:0;left:50%;width:16px;height:32px;background:#a1a1aa;transform:translate(-50%,50%);border-radius:2px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);"></div>
                <div style="position:absolute;left:0;top:50%;width:32px;height:16px;background:#a1a1aa;transform:translate(-50%,-50%);border-radius:2px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);"></div>
                <div style="position:absolute;right:0;top:50%;width:32px;height:16px;background:#a1a1aa;transform:translate(50%,-50%);border-radius:2px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);"></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- STATS BAR -->
      <section style="padding:2rem 0;border-top:1px solid rgba(212,212,216,0.4);border-bottom:1px solid rgba(212,212,216,0.4);background:rgba(255,255,255,0.4);backdrop-filter:blur(8px);position:relative;z-index:10;">
        <div style="max-width:80rem;margin:0 auto;padding:0 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2rem;">
          <div>
            <div style="font-size:10px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Total Scale</div>
            <div style="font-size:1.25rem;font-weight:700;color:#0F3D3E;">97K+ <span style="font-size:0.875rem;font-weight:500;color:#6b7280;">Calls placed</span></div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Throughput</div>
            <div style="font-size:1.25rem;font-weight:700;color:#0F3D3E;">4.2M <span style="font-size:0.875rem;font-weight:500;color:#6b7280;">Leads scored</span></div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Performance</div>
            <div style="font-size:1.25rem;font-weight:700;color:#166350;">34% <span style="font-size:0.875rem;font-weight:500;color:#6b7280;">Avg conversion lift</span></div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Reliability</div>
            <div style="font-size:1.25rem;font-weight:700;color:#0F3D3E;">99.7% <span style="font-size:0.875rem;font-weight:500;color:#6b7280;">Uptime SLA</span></div>
          </div>
        </div>
      </section>

      <!-- MARQUEE -->
      <section style="padding:2.5rem 0;border-bottom:1px solid rgba(212,212,216,0.4);position:relative;z-index:10;overflow:hidden;background:rgba(255,255,255,0.6);backdrop-filter:blur(8px);">
        <div style="max-width:80rem;margin:0 auto;padding:0 24px 1.5rem;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">
          Trusted by high-velocity sales teams at
        </div>
        <div class="lp-mask-edge">
          <div class="lp-animate-marquee" style="display:flex;align-items:center;gap:6rem;white-space:nowrap;opacity:0.7;filter:grayscale(1);font-weight:900;font-size:1.875rem;letter-spacing:-0.025em;color:#1a5455;">
            <span>Infosys</span><span>Wipro</span><span>HCL Tech</span><span>TCS</span><span>Cognizant</span><span>Zomato</span><span>Razorpay</span><span>CRED</span><span>PhonePe</span><span>Meesho</span><span>Freshworks</span><span>Zepto</span>
            <span>Infosys</span><span>Wipro</span><span>HCL Tech</span><span>TCS</span><span>Cognizant</span><span>Zomato</span><span>Razorpay</span><span>CRED</span><span>PhonePe</span><span>Meesho</span><span>Freshworks</span><span>Zepto</span>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section style="padding:8rem 24px;max-width:80rem;margin:0 auto;position:relative;z-index:10;perspective:1200px;transform-style:preserve-3d;">
        <div class="lp-reveal-3d lp-parallax-layer" data-speed="0.02" style="margin-bottom:4rem;display:flex;flex-direction:column;">
          <div style="max-width:42rem;">
            <h2 style="font-size:clamp(2.25rem,5vw,3.75rem);font-weight:900;color:#072425;letter-spacing:-0.05em;margin-bottom:1rem;text-transform:uppercase;">Direct response.</h2>
            <p style="font-size:1.125rem;color:#6b7280;font-weight:500;">From lead capture to CRM entry—the entire qualification workflow runs autonomously. Reps only talk to the top 1%.</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:1.5rem;grid-auto-rows:340px;" class="lp-bento-grid">

          <div class="lp-machined-panel lp-reveal-3d lp-parallax-layer" data-speed="-0.02" style="grid-column:span 8;padding:2.5rem;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:10;">
              <div style="width:56px;height:56px;background:#0F3D3E;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#D4AF37;font-size:1.5rem;transform:translateZ(30px);">
                <iconify-icon icon="solar:inbox-in-bold-duotone"></iconify-icon>
              </div>
              <span style="font-size:2.25rem;font-weight:900;color:#e4e4e7;">01</span>
            </div>
            <div style="position:relative;z-index:10;transform:translateZ(40px);">
              <h3 style="font-size:1.875rem;font-weight:900;color:#072425;letter-spacing:-0.05em;margin-bottom:12px;text-transform:uppercase;">Lead enters pipeline</h3>
              <p style="color:#52525b;font-weight:500;max-width:28rem;font-size:0.875rem;line-height:1.75;">A new contact arrives from your website form, ad campaign, or CRM integration. VoiceQual intercepts it instantly.</p>
            </div>
          </div>

          <div class="lp-machined-panel lp-reveal-3d lp-parallax-layer" data-speed="0.03" style="grid-column:span 4;padding:2.5rem;display:flex;flex-direction:column;justify-content:space-between;transition-delay:0.1s;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;transform:translateZ(20px);">
              <div style="width:48px;height:48px;background:#fff;border:1px solid #e4e4e7;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#1a5455;font-size:1.5rem;">
                <iconify-icon icon="solar:phone-calling-bold-duotone"></iconify-icon>
              </div>
              <span style="font-size:2.25rem;font-weight:900;color:#e4e4e7;">02</span>
            </div>
            <div style="transform:translateZ(30px);">
              <h3 style="font-size:1.25rem;font-weight:900;color:#072425;letter-spacing:-0.05em;margin-bottom:8px;text-transform:uppercase;">AI places the call</h3>
              <p style="color:#6b7280;font-weight:500;font-size:0.875rem;">A natural-sounding voice call is placed within minutes to collect BANT data.</p>
            </div>
          </div>

          <div class="lp-machined-panel lp-reveal-3d lp-parallax-layer" data-speed="-0.03" style="grid-column:span 4;padding:2.5rem;display:flex;flex-direction:column;justify-content:space-between;transition-delay:0.2s;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;transform:translateZ(20px);">
              <div style="width:48px;height:48px;background:#fff;border:1px solid #e4e4e7;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#1a5455;font-size:1.5rem;">
                <iconify-icon icon="solar:chart-square-bold-duotone"></iconify-icon>
              </div>
              <span style="font-size:2.25rem;font-weight:900;color:#e4e4e7;">03</span>
            </div>
            <div style="transform:translateZ(30px);">
              <h3 style="font-size:1.25rem;font-weight:900;color:#072425;letter-spacing:-0.05em;margin-bottom:8px;text-transform:uppercase;">Score is calculated</h3>
              <p style="color:#6b7280;font-weight:500;font-size:0.875rem;">Budget, Authority, Need, and Timeline are scored automatically.</p>
            </div>
          </div>

          <div class="lp-machined-panel lp-reveal-3d lp-parallax-layer" data-speed="0.01" style="grid-column:span 8;padding:2.5rem;display:flex;flex-direction:column;justify-content:space-between;transition-delay:0.3s;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;transform:translateZ(20px);">
              <div style="width:48px;height:48px;background:#D4AF37;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;box-shadow:0 10px 15px -3px rgba(166,124,46,0.3);">
                <iconify-icon icon="solar:hand-shake-bold-duotone"></iconify-icon>
              </div>
              <span style="font-size:2.25rem;font-weight:900;color:#e4e4e7;">04</span>
            </div>
            <div style="transform:translateZ(30px);">
              <h3 style="font-size:1.5rem;font-weight:900;color:#072425;letter-spacing:-0.05em;margin-bottom:8px;text-transform:uppercase;">Team Engagement</h3>
              <p style="color:#6b7280;font-weight:500;font-size:0.875rem;max-width:24rem;">Sales reps only engage verified leads. Close rates improve because the manual heavy lifting is deleted.</p>
            </div>
          </div>

        </div>
      </section>

      <!-- BEFORE/AFTER -->
      <section style="padding:5rem 24px;max-width:80rem;margin:0 auto;position:relative;z-index:10;perspective:1200px;transform-style:preserve-3d;">
        <div class="lp-machined-panel lp-reveal-3d" style="padding:3rem;background:#072425;color:#fff;overflow:hidden;position:relative;">
          <div style="position:absolute;inset:0;background:radial-gradient(circle at center,rgba(16,185,129,0.15) 0%,transparent 70%);pointer-events:none;"></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3rem;position:relative;z-index:10;text-align:center;" class="lp-stats-grid">
            <div>
              <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:1rem;">Lead response time</div>
              <div style="font-size:3rem;font-weight:900;color:#1F8A70;margin-bottom:1rem;">−94%</div>
              <div style="display:flex;align-items:center;justify-content:center;gap:1rem;font-size:0.875rem;font-weight:700;">
                <span style="text-decoration:line-through;color:#52525b;">4.2 hrs</span>
                <iconify-icon icon="solar:arrow-right-linear" style="color:#6b7280;"></iconify-icon>
                <span>4 min</span>
              </div>
            </div>
            <div style="border-left:1px solid rgba(63,63,70,1);border-right:1px solid rgba(63,63,70,1);padding:0 1rem;">
              <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:1rem;">Qualified leads/rep/week</div>
              <div style="font-size:3rem;font-weight:900;color:#D4AF37;margin-bottom:1rem;">+3×</div>
              <div style="display:flex;align-items:center;justify-content:center;gap:1rem;font-size:0.875rem;font-weight:700;">
                <span style="text-decoration:line-through;color:#52525b;">18</span>
                <iconify-icon icon="solar:arrow-right-linear" style="color:#6b7280;"></iconify-icon>
                <span>54</span>
              </div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:1rem;">CRM completeness</div>
              <div style="font-size:3rem;font-weight:900;color:#1F8A70;margin-bottom:1rem;">+61 pts</div>
              <div style="display:flex;align-items:center;justify-content:center;gap:1rem;font-size:0.875rem;font-weight:700;">
                <span style="text-decoration:line-through;color:#52525b;">38%</span>
                <iconify-icon icon="solar:arrow-right-linear" style="color:#6b7280;"></iconify-icon>
                <span>99%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section style="padding:8rem 24px;position:relative;z-index:10;perspective:1200px;transform-style:preserve-3d;">
        <div style="max-width:56rem;margin:0 auto;" class="lp-parallax-layer" data-speed="0.04">
          <div class="lp-machined-panel lp-reveal-3d" style="padding:4rem 6rem;text-align:center;position:relative;overflow:hidden;background:rgba(255,255,255,0.8);box-shadow:0 25px 50px -12px rgba(0,0,0,.25);">
            <div style="position:relative;z-index:10;transform:translateZ(50px);">
              <div style="font-size:11px;font-weight:900;color:#166350;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:1rem;">Live in under 60 minutes</div>
              <h2 style="font-size:clamp(3rem,5vw,3.75rem);font-weight:900;color:#072425;letter-spacing:-0.05em;line-height:1;margin-bottom:2rem;text-transform:uppercase;">
                Go live<br>tonight.
              </h2>
              <p style="color:#6b7280;margin-bottom:3rem;font-weight:500;max-width:28rem;margin-left:auto;margin-right:auto;font-size:0.875rem;line-height:1.75;">
                Connect your CRM, configure rules, and go live. No engineering required.
              </p>
              <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1rem;">
                <button class="lp-magnetic-btn" data-navigate="/dashboard" style="background:#072425;color:#fff;padding:20px 40px;border-radius:12px;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;border:none;cursor:none;box-shadow:0 20px 25px -5px rgba(0,0,0,.1);">
                  <span class="lp-magnetic-btn-inner">Open Dashboard</span>
                </button>
                <button class="lp-magnetic-btn" style="background:transparent;border:2px solid #d4d4d8;color:#0F3D3E;padding:20px 40px;border-radius:12px;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;cursor:none;">
                  <span class="lp-magnetic-btn-inner">Book a demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer style="padding:5rem 0 2.5rem;border-top:1px solid rgba(212,212,216,0.5);position:relative;z-index:10;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);">
        <div style="max-width:80rem;margin:0 auto;padding:0 24px;">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2.5rem;margin-bottom:4rem;" class="lp-footer-grid">
            <div>
              <div style="font-size:1.25rem;font-weight:900;color:#072425;letter-spacing:-0.05em;text-transform:uppercase;display:flex;align-items:center;gap:8px;margin-bottom:1rem;">
                <iconify-icon icon="solar:soundwave-circle-bold" style="color:#D4AF37;font-size:1.5rem;"></iconify-icon>
                Voice<span style="color:#1F8A70;">Qual</span>
              </div>
              <p style="font-size:0.875rem;font-weight:500;color:#6b7280;max-width:20rem;">Automated BANT qualification for high-velocity sales teams.</p>
            </div>
            <div>
              <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#072425;margin-bottom:1.5rem;">Product</div>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;font-size:0.875rem;font-weight:500;color:#6b7280;">
                <li><a href="#" style="color:inherit;text-decoration:none;">Features</a></li>
                <li><a href="#" style="color:inherit;text-decoration:none;">Integrations</a></li>
                <li><a href="#" style="color:inherit;text-decoration:none;">Pricing</a></li>
              </ul>
            </div>
            <div>
              <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#072425;margin-bottom:1.5rem;">Resources</div>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;font-size:0.875rem;font-weight:500;color:#6b7280;">
                <li><a href="#" style="color:inherit;text-decoration:none;">Documentation</a></li>
                <li><a href="#" style="color:inherit;text-decoration:none;">Support</a></li>
              </ul>
            </div>
            <div>
              <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#072425;margin-bottom:1.5rem;">Company</div>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;font-size:0.875rem;font-weight:500;color:#6b7280;">
                <li><a href="#" style="color:inherit;text-decoration:none;">About</a></li>
                <li><a href="#" style="color:inherit;text-decoration:none;">Contact</a></li>
              </ul>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:2rem;border-top:1px solid rgba(228,228,231,0.6);font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">
            <div>© 2026 VoiceQual AI. All rights reserved.</div>
            <div style="display:flex;gap:1.5rem;">
              <a href="#" style="color:inherit;text-decoration:none;">Privacy</a>
              <a href="#" style="color:inherit;text-decoration:none;">Terms</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  `;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .lp-root {
          font-family: 'Inter', sans-serif !important;
          background: radial-gradient(circle at 50% 0%, #ffffff 0%, #e2e8f0 100%) !important;
          cursor: none;
          min-height: 100vh;
          color: #1a5455;
          position: relative;
        }
        .lp-root *, .lp-root *::before, .lp-root *::after {
          box-sizing: border-box;
        }

        .lp-reveal-text { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
        .lp-reveal-text span { display: inline-block; transform: translateY(100%); opacity: 0; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s; }
        .lp-reveal-text.active span { transform: translateY(0); opacity: 1; }

        .lp-reveal-3d {
          opacity: 0;
          transform: translateY(120px) translateZ(-200px) rotateX(-25deg);
          transform-origin: center top;
          transition: opacity 0.9s ease-out, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .lp-reveal-3d.active {
          opacity: 1;
          transform: translateY(0) translateZ(0) rotateX(0deg);
        }

        .lp-parallax-layer { transition: transform 0.1s linear; will-change: transform; }

        @keyframes lp-float-slow { 0%, 100% { transform: translateY(0px) translateZ(120px); } 50% { transform: translateY(-12px) translateZ(120px); } }
        @keyframes lp-rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes lp-rotate-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes pulse { 50% { opacity: .5; } }

        @keyframes lp-orbit-pop {
          0%, 100% { opacity: 0; transform: scale(0.7) translateZ(-100px) rotateX(15deg); filter: blur(8px); }
          15%, 85% { opacity: 1; transform: scale(1) translateZ(80px) rotateX(0deg); filter: blur(0px); }
          50% { transform: scale(1.05) translateZ(120px) rotateX(-5deg); }
        }

        .lp-message-pill {
          position: absolute;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #0F3D3E;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 40px rgba(15, 61, 62, 0.15);
          white-space: nowrap;
          z-index: 50;
          will-change: transform, opacity, filter;
        }

        .lp-machined-panel {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(15, 61, 62, 0.15);
          box-shadow: 0 12px 40px -5px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          transform-style: preserve-3d;
          position: relative;
        }
        .lp-machined-panel::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.08), transparent 40%);
          z-index: 0; pointer-events: none; opacity: 0; transition: opacity 0.3s;
          border-radius: inherit;
        }
        .lp-machined-panel:hover::before { opacity: 1; }
        .lp-machined-panel > * { position: relative; z-index: 1; }

        .lp-magnetic-btn { display: inline-flex; justify-content: center; align-items: center; will-change: transform; cursor: none; }
        .lp-magnetic-btn-inner { pointer-events: none; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes lp-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .lp-animate-marquee { animation: lp-marquee 35s linear infinite; }
        .lp-mask-edge { -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }

        .lp-coil-ring { position: absolute; border: 1px solid rgba(15, 61, 62, 0.15); border-radius: 50%; transform-style: preserve-3d; }

        .lp-root:hover #lp-cursor-follower { border-color: rgba(212, 175, 55, 1); width: 48px; height: 48px; }

        /* Responsive */
        @media (max-width: 1024px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-bento-grid > * { grid-column: span 12 !important; }
          .lp-stats-grid { grid-template-columns: 1fr !important; }
          .lp-stats-grid > div { border-left: none !important; border-right: none !important; border-bottom: 1px solid rgba(63,63,70,0.3); padding-bottom: 1.5rem !important; }
          .lp-stats-grid > div:last-child { border-bottom: none; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 768px) {
          .lp-nav-links { display: flex !important; }
          .lp-signin-link { display: block !important; }
        }
      `}</style>
      <div
        className="lp-root"
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
