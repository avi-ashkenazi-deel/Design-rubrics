import { useEffect, useRef, useState } from 'react';

const DEEL_VALUES = [
  { 
    title: 'Genuine Care', 
    description: 'Valuing customers deeply and understanding the impact of their work.',
    color: '#ff6b6b'
  },
  { 
    title: 'Deel Speed', 
    description: 'Moving quickly but building lasting, high-quality solutions.',
    color: '#feca57'
  },
  { 
    title: 'Default Optimism', 
    description: 'Maintaining a positive outlook, even during challenges.',
    color: '#48dbfb'
  },
  { 
    title: 'Work Smart', 
    description: 'Achieving more with fewer resources and being resourceful.',
    color: '#1dd1a1'
  },
  { 
    title: 'Exceed Expectations', 
    description: 'Taking ownership and always aiming to overachieve.',
    color: '#ff9ff3'
  },
  { 
    title: 'Together Everywhere', 
    description: 'Connecting globally and empowering teams regardless of location.',
    color: '#54a0ff'
  }
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface FloatingText {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  scale: number;
  text: string;
}

interface FloatingCard {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  value: typeof DEEL_VALUES[0];
  delay: number;
  floatPhase: number;
}

export function WelcomeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const cardsRef = useRef<FloatingCard[]>([]);
  const animationRef = useRef<number>();
  const revealProgressRef = useRef(0);
  const lastTextTime = useRef(0);
  const cardsInitialized = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (cardsInitialized.current) {
        // Update card base positions on resize
        const positions = [
          { x: 0.15, y: 0.22 },
          { x: 0.85, y: 0.22 },
          { x: 0.10, y: 0.52 },
          { x: 0.90, y: 0.52 },
          { x: 0.18, y: 0.82 },
          { x: 0.82, y: 0.82 },
        ];
        cardsRef.current.forEach((card, i) => {
          card.baseX = canvas.width * positions[i].x;
          card.baseY = canvas.height * positions[i].y;
        });
      }
    };
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.2 + 0.05,
          color: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 6)]
        });
      }
    };

    // Initialize floating cards ONCE
    const initCards = () => {
      if (cardsInitialized.current) return;
      
      const positions = [
        { x: 0.15, y: 0.22 },
        { x: 0.85, y: 0.22 },
        { x: 0.10, y: 0.52 },
        { x: 0.90, y: 0.52 },
        { x: 0.18, y: 0.82 },
        { x: 0.82, y: 0.82 },
      ];
      
      cardsRef.current = DEEL_VALUES.map((value, i) => ({
        x: canvas.width * positions[i].x,
        y: canvas.height * positions[i].y,
        baseX: canvas.width * positions[i].x,
        baseY: canvas.height * positions[i].y,
        rotation: (Math.random() - 0.5) * 0.08,
        rotationSpeed: (Math.random() - 0.5) * 0.0003,
        scale: 1, // Start fully visible
        value,
        delay: 0, // No delay
        floatPhase: Math.random() * Math.PI * 2
      }));
      cardsInitialized.current = true;
    };

    resizeCanvas();
    initParticles();
    initCards();
    window.addEventListener('resize', resizeCanvas);

    // Start reveal animation
    setTimeout(() => setRevealed(true), 300);

    // Animation loop
    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update reveal progress
      if (revealed && revealProgressRef.current < 1) {
        revealProgressRef.current += 0.02;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Spawn floating stroked text continuously
      if (time - lastTextTime.current > 600) {
        const texts = ['Deel', 'OS', 'Deel', 'OS'];
        floatingTextsRef.current.push({
          x: centerX + (Math.random() - 0.5) * 80,
          y: centerY + 30,
          vy: -0.6 - Math.random() * 0.3,
          alpha: 0.6,
          scale: 0.3 + Math.random() * 0.3,
          text: texts[Math.floor(Math.random() * texts.length)]
        });
        lastTextTime.current = time;
      }

      // Update and draw floating stroked text
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => {
        ft.y += ft.vy;
        ft.alpha -= 0.004;
        ft.x += Math.sin(time * 0.002 + ft.y * 0.01) * 0.2;

        if (ft.alpha <= 0) return false;

        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);
        ctx.globalAlpha = ft.alpha;
        ctx.font = ft.text === 'Deel' ? '600 48px Inter, system-ui, sans-serif' : 'bold 72px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.strokeText(ft.text, 0, 0);
        ctx.restore();

        return true;
      });

      // Draw and update particles (no mouse interaction)
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
      });

      // Draw subtle connections
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.globalAlpha = 0.03 * (1 - dist / 80);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;

      // Draw main text
      ctx.save();
      
      // Clip for reveal effect
      if (revealProgressRef.current < 1) {
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width * revealProgressRef.current, canvas.height);
        ctx.clip();
      }

      // Pulsing glow for love effect
      const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;

      // Draw "Deel" - smaller text on top
      ctx.font = '500 42px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = `rgba(255, 107, 107, ${pulse * 0.4})`;
      ctx.shadowBlur = 15 + pulse * 8;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Deel', centerX, centerY - 38);
      
      // Draw "OS" - sized to match width of "Deel"
      // Deel at 42px is about 85px wide, OS needs to match
      ctx.font = 'bold 68px Inter, system-ui, sans-serif';
      ctx.shadowColor = `rgba(255, 255, 255, ${pulse * 0.3})`;
      ctx.shadowBlur = 20 + pulse * 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('OS', centerX, centerY + 30);
      
      ctx.restore();

      // Draw floating cards (always fully visible, gentle float + mouse parallax)
      cardsRef.current.forEach((card) => {
        // Gentle floating motion
        const floatX = Math.sin(time * 0.0006 + card.floatPhase) * 6;
        const floatY = Math.cos(time * 0.0004 + card.floatPhase) * 4;

        // Mouse parallax effect - cards shift slightly based on mouse position
        const mouseOffsetX = (mouseRef.current.x - canvas.width / 2) / canvas.width;
        const mouseOffsetY = (mouseRef.current.y - canvas.height / 2) / canvas.height;
        
        // Cards on opposite sides move in opposite directions for depth effect
        const cardSide = card.baseX < canvas.width / 2 ? -1 : 1;
        const parallaxX = mouseOffsetX * 15 * cardSide;
        const parallaxY = mouseOffsetY * 10;

        // Smooth movement to float position with parallax
        const targetX = card.baseX + floatX + parallaxX;
        const targetY = card.baseY + floatY + parallaxY;
        card.x += (targetX - card.x) * 0.05;
        card.y += (targetY - card.y) * 0.05;

        card.rotation += card.rotationSpeed;

        // Draw card
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.rotation);
        ctx.globalAlpha = 0.92;

        const cardWidth = 190;
        const cardHeight = 85;
        
        // Card shadow
        ctx.shadowColor = card.value.color;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 6;

        // Card background
        ctx.fillStyle = 'rgba(18, 18, 18, 0.95)';
        ctx.beginPath();
        ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = card.value.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Color accent bar
        ctx.fillStyle = card.value.color;
        ctx.beginPath();
        ctx.roundRect(-cardWidth / 2, -cardHeight / 2, 4, cardHeight, [12, 0, 0, 12]);
        ctx.fill();

        // Title
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(card.value.title, -cardWidth / 2 + 16, -cardHeight / 2 + 14);

        // Description
        ctx.fillStyle = '#999999';
        ctx.font = '11px Inter, system-ui, sans-serif';
        const words = card.value.description.split(' ');
        let line = '';
        let y = -cardHeight / 2 + 34;
        const maxY = cardHeight / 2 - 10;
        for (const word of words) {
          const testLine = line + word + ' ';
          if (ctx.measureText(testLine).width > cardWidth - 32) {
            if (y < maxY) {
              ctx.fillText(line.trim(), -cardWidth / 2 + 16, y);
              line = word + ' ';
              y += 14;
            }
          } else {
            line = testLine;
          }
        }
        if (line && y <= maxY) {
          ctx.fillText(line.trim(), -cardWidth / 2 + 16, y);
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [revealed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  return (
    <div 
      ref={containerRef}
      className="welcome-canvas-container"
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="welcome-canvas" />
      <div className="welcome-hint">
        <span>Select a section from the sidebar to get started</span>
      </div>
    </div>
  );
}
