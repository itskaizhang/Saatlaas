const cursor = document.getElementById("custom-cursor");
    const canvas = document.getElementById("light-trail");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const points = [];
    const maxPoints = 35;

    window.addEventListener("mousemove", (e) => {
      // Move the custom cursor element
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      // Record points for the light trail
      points.push({ x: e.clientX, y: e.clientY });
      if (points.length > maxPoints) points.shift();
    });

    // Change cursor shape when hovering over buttons or links
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < points.length; i++) {
          const progress = i / points.length;
          ctx.beginPath();
          ctx.moveTo(points[i - 1].x, points[i - 1].y);
          ctx.lineTo(points[i].x, points[i].y);
          ctx.lineWidth = progress * 8;
          ctx.strokeStyle = `rgba(0, 240, 255, ${progress})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#00f0ff";
          ctx.stroke();
        }
      }

      if (points.length > 0) points.shift();
      requestAnimationFrame(animate);
    }

    animate();