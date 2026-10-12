import React, { useEffect, useRef } from 'react';

interface GoldParticlesProps {
    className?: string;
    particleCount?: number;
}

export default function GoldParticles({ className = '', particleCount = 45 }: GoldParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
        let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Particle class
        const particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            opacitySpeed: number;
            color: string;
        }> = [];

        const colors = ['#DFCAAB', '#C5A880', '#E7E4DB', '#8C7350'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2.2 + 0.8,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: -(Math.random() * 0.5 + 0.2), // float upward
                opacity: Math.random() * 0.7 + 0.2,
                opacitySpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity += p.opacitySpeed;

                if (p.opacity > 0.85 || p.opacity < 0.15) {
                    p.opacitySpeed = -p.opacitySpeed;
                }

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
                ctx.fillStyle = p.color;
                ctx.shadowColor = '#C5A880';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [particleCount]);

    return <canvas ref={canvasRef} className={`particles-canvas ${className}`} />;
}
