// Mouse hover over goat -> breathes flame
// document.getElementById('kid1-img').addEventListener('mouseenter', () => {
    // document.getElementById('kid1-img').style.display = 'none';
    // document.getElementById('kid2-img').style.display = 'inline';
// });

// document.getElementById('kid2-img').addEventListener('mouseleave', () => {
//     document.getElementById('kid2-img').style.display = 'none';
//     document.getElementById('kid1-img').style.display = 'inline';
// });



// Threshold for “transparent enough” (α ≤ 0.1)
const TRANSPARENCY_THRESHOLD = 0.999;

const container = document.querySelector(".image-container");
let isHoveringOpaque = false; 

(function() {
  const registry = [];

  // Note: The CanvasSettings object also has a willReadFrequently boolean.
  // When a CanvasSettings object's willReadFrequently is true, the user agent
  // may optimize the canvas for readback operations.
  //
  // We pass { willReadFrequently: true } to getContext so that reading pixels
  // back (via getImageData) is as efficient as possible.
  
  // 1) Gather every .clickable-transparency and build its off‑screen canvas:
  document.querySelectorAll('.clickable-transparency').forEach(el => {
    let src, natW, natH;

    if (el.tagName === 'IMG') {
      src  = el.src;
      natW = el.naturalWidth;
      natH = el.naturalHeight;
    } else {
      const bg = getComputedStyle(el).backgroundImage.match(/url\(([^)]+)\)/);
      if (!bg) return;
      src = bg[1].replace(/['"]/g,'');
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const w = natW || img.naturalWidth;
      const h = natH || img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      // create context optimized for frequent readbacks:
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      registry.push({ el, canvas, ctx });
    };
  });

  // 2) On every pointer/touch event, sample the pixel and toggle pointer-events:
    function hitTest(e) {
        const x = e.clientX, y = e.clientY;
        registry.forEach(({ el, canvas, ctx }) => {
        const r = el.getBoundingClientRect();
        if (x < r.left || x > r.right || y < r.top || y > r.bottom) {
            // outside → restore normal behavior
            el.style.pointerEvents = 'auto';
            return;
        }
        // inside → map to canvas pixels
        const px = Math.floor((x - r.left) * canvas.width  / r.width);
        const py = Math.floor((y - r.top ) * canvas.height / r.height);
        const alpha = ctx.getImageData(px, py, 1, 1).data[3] / 255;

        
        if (alpha <= TRANSPARENCY_THRESHOLD) {
            // el.style.pointerEvents = 'none';   // click falls through
            // Mouse is hovering over transparent pixel
            if (isHoveringOpaque) {
                isHoveringOpaque = false;
                onOpaqueLeave();
                console.log("transparent pixel");
            }
        } else {
            // el.style.pointerEvents = 'auto';   // click catches here
            // Mouse is hovering over a non-transparent pixel
            if (!isHoveringOpaque) {
                isHoveringOpaque = true;
                onOpaqueEnter(); 
                console.log("non-transparent pixel");
            }
        }
        });
    }

    function onOpaqueLeave() {
        document.getElementById('kid2-img').style.display = 'none';
        document.getElementById('kid1-img').style.display = 'inline';
    }

    function onOpaqueEnter() {
        document.getElementById('kid1-img').style.display = 'none';
        document.getElementById('kid2-img').style.display = 'inline';
    }


  // 3) Use Pointer Events where supported (covers mouse/touch), else fall back:
  if (window.PointerEvent) {
    document.addEventListener('pointermove', hitTest, { passive: true });
    document.addEventListener('pointerdown', hitTest, { passive: true });
  } else {
    document.addEventListener('touchmove', hitTest, { passive: true });
    document.addEventListener('touchstart', hitTest, { passive: true });
  }
})();


container.addEventListener('mousemove', () => {
    console.log("mouse entered container");
    container.addEventListener('mousemove', hitTest())
});

container.addEventListener('mouseleave', () => {
    if (isHoveringOpaque) {
        isHoveringOpaque = false;
        onOpaqueLeave();
    }
});



const flameContainer = document.getElementById('flame-container');
let lastParticle = 0;

document.addEventListener('mousemove', (e) => {

    const now = Date.now();

    // Control particle frequency
    if (now - lastParticle < 0) return;
    lastParticle = now;

    const particle = document.createElement('div');
    particle.classList.add('light-particle');

    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;

    flameContainer.appendChild(particle);

    particle.addEventListener('animationend', () => {
        particle.remove();
    });
});

const canvas = document.getElementById('light-trail');
const ctx = canvas.getContext('2d');

let particles = [];
let previousMouse = null;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Create an ember
function createEmber(x, y) {
    const colors = [
        '#ff3b1f', // red
        '#ff6a00', // orange
        '#6b95e3'
    ];
    
    particles.push({
        x: x,
        y: y,

        // Random drifting movement
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1 - 0.4,

        size: Math.random() * 2 + 1,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,

        flicker: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)]

    });
}

// Spawn embers along mouse movement
document.addEventListener('mousemove', (e) => {
    if (previousMouse) {
        const dx = e.clientX - previousMouse.x;
        const dy = e.clientY - previousMouse.y;

        const distance = Math.hypot(dx, dy);
        const count = Math.ceil(distance / 8);

        for (let i = 0; i < count; i++) {
            const t = i / Math.max(count, 1);

            createEmber(
                previousMouse.x + dx * t,
                previousMouse.y + dy * t
            );
        }
    }

    previousMouse = {
        x: e.clientX,
        y: e.clientY
    };
});

// Animate embers
function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Slight upward acceleration
        p.vy -= 0.015;

        p.life -= p.decay;

        // Flickering brightness
        const flicker = 0.7 + Math.random() * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(255, ${Math.floor(150 + 80 * flicker)}, 65, ${Math.max(0, p.life) * flicker})`;

        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.fill();
    });

    particles = particles.filter(p => p.life > 0);

    requestAnimationFrame(animate);
}

animate();