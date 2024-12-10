import React, { useEffect, useRef, useState } from 'react';
import styles from './ReactionContainer.module.css';

export class Timer {
    private lastMS: number;

    public static now(): number {
        return performance.now();
    }

    public constructor() {
        this.lastMS = Timer.now();
    }

    public getElapsedMS(): number {
        const now = Timer.now();
        const elapsed = now - this.lastMS;
        return elapsed;
    }

    public delay(ms: number): boolean {
        return this.getElapsedMS() >= ms;
    }

    public tick(ms: number): number {
        const elapsed = this.getElapsedMS();
        const tick = Math.floor(elapsed / ms);
        this.lastMS += tick * ms;
        return tick;
    }

    public reset(): void {
        this.lastMS = Timer.now();
    }
}

interface Reaction {
    text: string;
    position: [number, number];
    velocity: [number, number];
    depth: number;
    opacity: number;
    rotation: number;
    age: number;
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

const MAX_REACTION_LIMIT = 100;
let reactionArray: Reaction[] = [];

const ReactionCanvas: React.FC<{
    listen: (callback: (reactions: { key: string }[]) => void) => void;
}> = ({ listen }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const spawnQueue = useRef<string[]>([]);
    const prevSpawnTime = useRef(Date.now());

    const resizeCanvas = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    };

    const spawnReaction = (text: string) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const reactionScale = 50;

        const x = lerp(reactionScale, canvas.width - reactionScale - 50, Math.random());
        const y = lerp(reactionScale + 300, canvas.height - reactionScale, Math.random());
        const z = lerp(0.5, 1, Math.random());
        const vx = Math.random() - 0.5;
        const vy = Math.random() - 0.5;

        const newReaction: Reaction = {
            text,
            position: [x, y],
            velocity: [vx, vy],
            depth: z,
            opacity: 1,
            rotation: 0,
            age: 0,
        };
        reactionArray.push(newReaction);
    };

    const updateReaction = (reaction: Reaction): Reaction => {
        const [vx, vy] = reaction.velocity;
        const [x, y] = reaction.position;
        const newVx = (vx + Math.sin(reaction.age / 15) / 3) * 0.8;
        const newVy = -Math.pow(reaction.age, 0.2);
        const newX = x + newVx * reaction.depth;
        const newY = y + newVy * reaction.depth;
        const newOpacity = Math.min(1, reaction.age / 10) - Math.max(0, (reaction.age - 50) / 50);
        const newRotation = (Math.sin(reaction.age / 15 + 1) * 5 * Math.PI) / 180;

        return { ...reaction, position: [newX, newY], velocity: [newVx, newVy], opacity: newOpacity, rotation: newRotation, age: reaction.age + 1 };
    };

    const drawCanvas = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        reactionArray.forEach(({ text, position, depth, opacity, rotation }) => {
            const [x, y] = position;
            if (opacity <= 0) return;

            ctx.font = `${60 * depth}px "Noto Color Emoji"`;
            ctx.save();
            ctx.globalAlpha = opacity * depth;
            ctx.translate(x, y);
            ctx.rotate(rotation);

            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, -textWidth / 2, 0);
            ctx.restore();
        });
    };

    const updateSpawn = () => {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - prevSpawnTime.current) / 1000;
        const spawnRate = Math.min(10, 1 / (spawnQueue.current.length || 1));

        if (elapsedTime < spawnRate) return;
        prevSpawnTime.current = currentTime;

        const toSpawnCount = Math.min(Math.floor(elapsedTime / spawnRate), spawnQueue.current.length);
        for (let i = 0; i < toSpawnCount; i++) {
            spawnReaction(spawnQueue.current.shift());
        }
    };

    function updatePosition() {
        reactionArray = reactionArray
            .map((reaction) => updateReaction(reaction))
            .filter(({ position }) => {
                const [x, y] = position;
                return x >= -50 && x <= (canvasRef.current?.width || 0) + 50 && y >= -50 && y <= (canvasRef.current?.height || 0) + 50;
            });
    }

    const timer = new Timer();

    useEffect(() => {
        const handleResize = () => resizeCanvas();
        window.addEventListener('resize', handleResize);
        resizeCanvas();

        const animationLoop = () => {
            updateSpawn();
            for (let i = 0, ticks = timer.tick(33); i < ticks; i++) {
                updatePosition();
            }
            drawCanvas();
            requestAnimationFrame(animationLoop);
        };

        const animationId = requestAnimationFrame(animationLoop);

        listen((reactions) => {
            if (reactionArray.length >= MAX_REACTION_LIMIT) return;
            spawnQueue.current.push(...reactions.map((r) => r.key));
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default ReactionCanvas;