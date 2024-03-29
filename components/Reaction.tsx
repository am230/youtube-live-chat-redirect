import { useEffect } from "react";
import styles from "./Reaction.module.css";


const particles: { [key: number]: { x: number, y: number } } = {}
const Reaction = (props: { id: string, value: string }) => {
    const id = `reaction-${props.id}`
    if (!(id in particles)) {
        particles[id] = {
            x: Math.random() * (window.innerWidth - 100),
            y: Math.random() * (window.innerHeight - 300) + 250,
            age: 0,
            vx: Math.random() - 0.5
        }
    }

    useEffect(() => {
        const animationFrame = requestAnimationFrame(updatePosition);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const updatePosition = () => {
        const element = document.getElementById(id)
        const particle = particles[id]
        particle.age++;
        particle.y -= Math.pow(particle.age, 0.2);
        particle.vx += Math.sin(particle.age / 15) / 3
        particle.vx *= 0.8;
        particle.x += particle.vx
        if (!element) return
        element.style.left = `${particle.x}px`
        element.style.top = `${particle.y}px`
        // element.style.opacity = `${Math.min(1, particle.age / 10) - Math.max(0, (particle.age - 50) / 50)}`
        element.style.color = `rgba(255, 255, 255, ${Math.min(1, particle.age / 10) - Math.max(0, (particle.age - 50) / 50)})`
        element.style.scale = `${(Math.min(1, Math.pow(particle.age, 1.5) / 20) - Math.max(0, (particle.age - 70) / 30))}`
        element.style.transform = `rotate(${Math.sin(particle.age / 15 + 1) * 5}deg)`;

        requestAnimationFrame(updatePosition);
    };

    return <div className={`${styles.reaction} emoji`} id={id}>
        {props.value}
    </div>
}

export default Reaction