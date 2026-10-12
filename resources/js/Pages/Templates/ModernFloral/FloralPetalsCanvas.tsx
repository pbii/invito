import React, { useEffect, useRef } from 'react';

interface Petal {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    rotation: number;
    rotSpeed: number;
    flip: number;
    flipSpeed: number;
    color: string;
    opacity: number;
}

export default function FloralPetalsCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Petal colors: soft rose, blush, peach, champagne
        const petalColors = [
            'rgba(244, 114, 182, 0.75)', // pink-400
            'rgba(251, 113, 133, 0.7)',  // rose-400
            'rgba(253, 164, 175, 0.8)',  // rose-300
            'rgba(254, 205, 211, 0.85)', // rose-200
            'rgba(254, 240, 138, 0.5)',  // yellow/champagne
            'rgba(255, 228, 230, 0.9)',  // rose-100
        ];

        const petalCount = Math.min(28, Math.floor(window.innerWidth / 35));
        const petals: Petal[] = [];

        const createPetal = (startY?: number): Petal => {
            return {
                x: Math.random() * width,
                y: startY !== undefined ? startY : Math.random() * height,
                size: Math.random() * 8 + 8, // 8px - 16px
                speedY: Math.random() * 1.2 + 0.8,
                speedX: Math.random() * 0.8 - 0.4,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 1.5,
                flip: Math.random() * Math.PI,
                flipSpeed: Math.random() * 0.03 + 0.015,
                color: petalColors[Math.floor(Math.random() * petalColors.length)],
                opacity: Math.random() * 0.4 + 0.6,
            };
        };

        for (let i = 0; i < petalCount; i++) {
            petals.push(createPetal());
        }

        // Scroll velocity tracking
        let lastScrollY = window.scrollY;
        let scrollBoost = 0;
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            // Add wind effect according to scroll direction & speed
            scrollBoost = Math.max(-6, Math.min(6, delta * 0.25));

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                scrollBoost = 0;
            }, 120);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Optional tap/click effect to spawn petals
        const handleClick = (e: MouseEvent) => {
            for (let i = 0; i < 4; i++) {
                const burstPetal: Petal = {
                    x: e.clientX + (Math.random() - 0.5) * 40,
                    y: e.clientY + (Math.random() - 0.5) * 40,
                    size: Math.random() * 7 + 8,
                    speedY: Math.random() * 1.5 + 1.2,
                    speedX: (Math.random() - 0.5) * 2,
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 3,
                    flip: Math.random() * Math.PI,
                    flipSpeed: Math.random() * 0.05 + 0.02,
                    color: petalColors[Math.floor(Math.random() * petalColors.length)],
                    opacity: 0.9,
                };
                petals.push(burstPetal);
                if (petals.length > petalCount + 12) {
                    petals.shift();
                }
            }
        };
        window.addEventListener('click', handleClick);

        // Draw individual organic petal
        const drawPetal = (p: Petal) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            const scaleX = Math.cos(p.flip);
            ctx.scale(scaleX, 1);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            // Curved petal shape using bezier curves
            ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.7, p.size * 0.9, p.size * 0.7, 0, p.size * 1.2);
            ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.7, -p.size * 0.8, -p.size * 0.7, 0, 0);

            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(244, 114, 182, 0.25)';
            ctx.shadowBlur = 4;
            ctx.fill();

            // Subtle petal central vein
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, p.size * 0.9);
            ctx.stroke();

            ctx.restore();
        };

        // Main animation loop
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Smoothly ease scrollBoost back to zero
            scrollBoost *= 0.94;

            for (let i = 0; i < petals.length; i++) {
                const p = petals[i];

                // Update position
                p.y += p.speedY + scrollBoost;
                p.x += p.speedX + Math.sin(p.y * 0.01) * 0.6 + scrollBoost * 0.3;
                p.rotation += p.rotSpeed;
                p.flip += p.flipSpeed;

                // Wrap around edges
                if (p.y > height + 20) {
                    p.y = -20;
                    p.x = Math.random() * width;
                } else if (p.y < -30) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                if (p.x > width + 20) {
                    p.x = -20;
                } else if (p.x < -20) {
                    p.x = width + 20;
                }

                drawPetal(p);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-20 h-full w-full"
            aria-hidden="true"
        />
    );
}
