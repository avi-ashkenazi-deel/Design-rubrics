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

interface PulseText {
  scale: number;
  alpha: number;
  startTime: number;
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
  isCentered: boolean;
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
  const [centeredCardIndex, setCenteredCardIndex] = useState<number | null>(null);
  const mainTextScaleRef = useRef(1);
  const mainTextAlphaRef = useRef(1);
  const pulsesRef = useRef<PulseText[]>([]);

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
        scale: 1,
        value,
        delay: 0,
        floatPhase: Math.random() * Math.PI * 2,
        isCentered: false
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

      // Calculate main text scale (zoom out when card is centered)
      const mainTextTargetScale = centeredCardIndex !== null ? 0.6 : 1;
      const mainTextTargetAlpha = centeredCardIndex !== null ? 0.25 : 1;
      
      // Smooth animation for main text
      mainTextScaleRef.current += (mainTextTargetScale - mainTextScaleRef.current) * 0.08;
      mainTextAlphaRef.current += (mainTextTargetAlpha - mainTextAlphaRef.current) * 0.08;

      // Floating motion for main text when zoomed out
      const mainFloatX = centeredCardIndex !== null ? Math.sin(time * 0.001) * 3 : 0;
      const mainFloatY = centeredCardIndex !== null ? Math.cos(time * 0.0008) * 2 : 0;

      // Draw main text
      ctx.save();
      ctx.translate(centerX + mainFloatX, centerY + mainFloatY);
      ctx.scale(mainTextScaleRef.current, mainTextScaleRef.current);
      
      // Apply blur effect when zoomed out (using shadow trick)
      const isZoomedOut = mainTextScaleRef.current < 0.9;
      
      // Clip for reveal effect
      if (revealProgressRef.current < 1) {
        ctx.beginPath();
        ctx.rect(-canvas.width, -canvas.height, canvas.width * 2 * revealProgressRef.current, canvas.height * 2);
        ctx.clip();
      }

      // Pulsing glow for love effect
      const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;
      ctx.globalAlpha = mainTextAlphaRef.current;

      // Draw "Deel" - smaller text on top
      ctx.font = '500 42px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = `rgba(255, 107, 107, ${pulse * 0.5})`;
      ctx.shadowBlur = isZoomedOut ? 8 : (15 + pulse * 8);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Deel', 0, -38);
      
      // Draw "OS" - sized to match width of "Deel"
      ctx.font = 'bold 68px Inter, system-ui, sans-serif';
      ctx.shadowColor = `rgba(255, 255, 255, ${pulse * 0.4})`;
      ctx.shadowBlur = isZoomedOut ? 10 : (20 + pulse * 10);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('OS', 0, 30);
      
      ctx.restore();

      // Draw pulse animations
      pulsesRef.current = pulsesRef.current.filter(pulseAnim => {
        const elapsed = time - pulseAnim.startTime;
        const duration = 1500; // 1.5 seconds
        const progress = elapsed / duration;
        
        if (progress >= 1) return false;
        
        // Easing - starts fast, slows down
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const pulseScale = 1 + easeOut * 3; // Scale from 1x to 4x
        const pulseAlpha = 1 - easeOut; // Fade out
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulseScale, pulseScale);
        ctx.globalAlpha = pulseAlpha * 0.8;
        
        // Stroked "Deel"
        ctx.font = '500 42px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.9)';
        ctx.lineWidth = 2 / pulseScale; // Keep consistent stroke width as it scales
        ctx.strokeText('Deel', 0, -38);
        
        // Stroked "OS"
        ctx.font = 'bold 68px Inter, system-ui, sans-serif';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2.5 / pulseScale;
        ctx.strokeText('OS', 0, 30);
        
        ctx.restore();
        
        return true;
      });

      // Calculate zoom out effect when a card is centered
      const hasCardCentered = centeredCardIndex !== null;

      // Draw floating cards (always fully visible, gentle float + mouse parallax)
      cardsRef.current.forEach((card, index) => {
        const isCentered = centeredCardIndex === index;
        
        // Target position - center if centered, otherwise base position with effects
        let targetX: number;
        let targetY: number;
        let targetRotation: number;
        let targetScale: number;

        if (isCentered) {
          targetX = canvas.width / 2;
          targetY = canvas.height / 2;
          targetRotation = 0;
          targetScale = 1.5; // Bigger when centered
        } else {
          // Gentle floating motion - continues even when zoomed out
          const floatX = Math.sin(time * 0.0006 + card.floatPhase) * (hasCardCentered ? 8 : 6);
          const floatY = Math.cos(time * 0.0004 + card.floatPhase) * (hasCardCentered ? 6 : 4);

          // Mouse parallax effect (reduced when zoomed out)
          const mouseOffsetX = (mouseRef.current.x - canvas.width / 2) / canvas.width;
          const mouseOffsetY = (mouseRef.current.y - canvas.height / 2) / canvas.height;
          const cardSide = card.baseX < canvas.width / 2 ? -1 : 1;
          const parallaxStrength = hasCardCentered ? 0.5 : 1;
          const parallaxX = mouseOffsetX * 15 * cardSide * parallaxStrength;
          const parallaxY = mouseOffsetY * 10 * parallaxStrength;

          // When another card is centered, push this card outward (zoom out effect)
          const pushOutX = hasCardCentered ? (card.baseX - canvas.width / 2) * 0.2 : 0;
          const pushOutY = hasCardCentered ? (card.baseY - canvas.height / 2) * 0.2 : 0;

          targetX = card.baseX + floatX + parallaxX + pushOutX;
          targetY = card.baseY + floatY + parallaxY + pushOutY;
          targetRotation = card.rotation + card.rotationSpeed;
          targetScale = hasCardCentered ? 0.7 : 1; // Normal when no card centered, smaller when in background
        }

        // Smooth movement
        card.x += (targetX - card.x) * 0.08;
        card.y += (targetY - card.y) * 0.08;
        card.rotation += (targetRotation - card.rotation) * 0.1;
        card.scale += (targetScale - card.scale) * 0.08;

        // Draw card
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.rotation);
        ctx.scale(card.scale, card.scale);
        
        const isInBackground = hasCardCentered && !isCentered;
        // Full opacity when no card centered, reduced only for background cards
        ctx.globalAlpha = isCentered ? 1 : (isInBackground ? 0.35 : 1);

        const cardWidth = 190;
        const cardHeight = 75;
        
        // Card shadow/glow
        ctx.shadowColor = card.value.color;
        ctx.shadowBlur = isCentered ? 40 : (isInBackground ? 30 : 18);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Card background
        ctx.fillStyle = 'rgba(18, 18, 18, 0.98)';
        ctx.beginPath();
        ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
        ctx.fill();
        
        // Extra blur passes for background cards to simulate depth of field blur
        if (isInBackground) {
          ctx.shadowBlur = 20;
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.shadowBlur = 35;
          ctx.globalAlpha = 0.1;
          ctx.fill();
          ctx.globalAlpha = 0.35;
        }

        // Border
        ctx.strokeStyle = card.value.color;
        ctx.lineWidth = isCentered ? 3 : 1.5;
        ctx.shadowBlur = isInBackground ? 15 : 0;
        ctx.stroke();

        // Color accent bar
        ctx.shadowBlur = 0;
        ctx.fillStyle = card.value.color;
        ctx.beginPath();
        ctx.roundRect(-cardWidth / 2, -cardHeight / 2, 4, cardHeight, [12, 0, 0, 12]);
        ctx.fill();

        // Title with colored glow
        ctx.shadowColor = card.value.color;
        ctx.shadowBlur = isCentered ? 10 : (isInBackground ? 8 : 5);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(card.value.title, -cardWidth / 2 + 16, -cardHeight / 2 + 12);

        // Description with subtle colored glow
        ctx.shadowColor = card.value.color;
        ctx.shadowBlur = isCentered ? 6 : (isInBackground ? 5 : 3);
        ctx.fillStyle = isCentered ? '#dddddd' : '#cccccc';
        ctx.font = '11px Inter, system-ui, sans-serif';
        const words = card.value.description.split(' ');
        let line = '';
        let y = -cardHeight / 2 + 30;
        const maxY = cardHeight / 2 - 8;
        const lineHeight = 13;
        for (const word of words) {
          const testLine = line + word + ' ';
          if (ctx.measureText(testLine).width > cardWidth - 32) {
            if (y < maxY) {
              ctx.fillText(line.trim(), -cardWidth / 2 + 16, y);
              line = word + ' ';
              y += lineHeight;
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
  }, [revealed, centeredCardIndex]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!rect || !canvas) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check if clicking on centered card to dismiss it
    if (centeredCardIndex !== null) {
      setCenteredCardIndex(null);
      return;
    }

    // Check if clicking on Deel OS text area (center of screen)
    const textAreaWidth = 150;
    const textAreaHeight = 120;
    if (Math.abs(clickX - centerX) < textAreaWidth / 2 && Math.abs(clickY - centerY) < textAreaHeight / 2) {
      // Trigger pulse animation
      pulsesRef.current.push({
        scale: 1,
        alpha: 1,
        startTime: performance.now()
      });
      return;
    }

    // Check if clicking on any card
    const cardWidth = 190;
    const cardHeight = 75;
    
    for (let i = 0; i < cardsRef.current.length; i++) {
      const card = cardsRef.current[i];
      const dx = clickX - card.x;
      const dy = clickY - card.y;
      
      // Simple bounding box check (accounting for rotation would be more complex)
      if (Math.abs(dx) < cardWidth / 2 && Math.abs(dy) < cardHeight / 2) {
        setCenteredCardIndex(i);
        return;
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="welcome-canvas-container"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <canvas ref={canvasRef} className="welcome-canvas" />
      <div className="welcome-hint">
        <span>Select a section from the sidebar to get started</span>
      </div>
    </div>
  );
}
