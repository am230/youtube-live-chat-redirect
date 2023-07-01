import styles from "./Reaction.module.css"
import {useEffect} from "react";

export interface ReactionData {
    reactions: { "key": string, "value": number }[],
    totalReactions: number,
    duration: { seconds: string },
    intensityScore: number
}

const particles: { [key: number]: { x: number, y: number } } = {}

const Reaction = (props: { id: number, value: string }) => {
    const id = `reaction-${props.id}`
    if (!(id in particles)) {
        particles[id] = {x: Math.random() * (window.innerWidth - 200) + 100, y: Math.random() * window.innerHeight / 2 + window.innerHeight / 2 - 100, age: 0, vx: Math.random() - 0.5}
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
        particle.age ++;
        particle.y -= Math.pow(particle.age, 0.2);
        particle.vx += Math.sin(particle.age / 15) / 3
        particle.vx *= 0.8;
        particle.x += particle.vx
        if (!element) return
        element.style.left = `${particle.x}px`
        element.style.top = `${particle.y}px`
        element.style.opacity = `${Math.min(1, particle.age / 10) - Math.max(0, (particle.age - 50) / 50)}`
        element.style.fontSize = `${Math.pow(particle.age, 0.5) + 20}px`

        requestAnimationFrame(updatePosition);
    };

    return <div className={`${styles.reaction} emoji`} id={id}>
        {props.value}
    </div>
}

export default Reaction