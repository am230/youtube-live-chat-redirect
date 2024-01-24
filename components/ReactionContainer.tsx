import { ReactElement, useEffect, useState } from "react";
import Reaction from "./Reaction";

interface Entry {
    age: number
    element: ReactElement
}

const data = {
    reactions: [],
    spawnQueue: [],
    render: 0
}

const ReactionContainer = (props: {
    reactions: {
        key: string;
    }[]
}) => {
    const [render, setRender] = useState(0)

    useEffect(() => {
        const animationFrame = requestAnimationFrame(updatePosition);
        setInterval(() => {
            while (data.spawnQueue.length > 30) {
                data.spawnQueue.pop()()
            }
            if (data.spawnQueue.length)
                data.spawnQueue.pop()()
        }, 300)
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const updatePosition = () => {
        props.reactions.forEach((reaction, i) => {
            if (data.reactions.filter(r => r.key === reaction.key).length) return
            const element = <Reaction id={`${Date.now()}-${i}`} value={reaction.key} />
            data.reactions.push({
                age: 0,
                element
            })
            data.spawnQueue.push(() => {
                const element = <Reaction id={`${Date.now()}-${i}`} value={reaction.key} />
                data.reactions.push({
                    age: 0,
                    element
                })
                setRender(data.render++)
            })
        })
        const newReactions = [...data.reactions.filter(reaction => reaction.age++ < 100)]
        props.reactions.splice(0)
        data.reactions = newReactions
        setRender(data.render++)
        requestAnimationFrame(updatePosition);
    };

    return (<>
        {data.reactions.map(reaction => reaction.element)}
    </>);
}

export default ReactionContainer