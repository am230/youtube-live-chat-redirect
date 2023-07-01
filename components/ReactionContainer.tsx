import Reaction, {ReactionData} from "./Reaction";
import {ReactElement, useEffect, useState} from "react";

interface Entry {
    age: number
    element: ReactElement
}

const data = {
        reactions: [],
        spawnQueue: [],
        render: 0
    }

const ReactionContainer = (props: { reactions: ReactionData[] }) => {
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

    const create = (reaction: ReactionData): Entry[] => {
        if (!reaction.reactions)
            return
        reaction.reactions.forEach(reaction => {
            for (let i = 0; i < reaction.value; i++) {
                data.spawnQueue.push(() => {
                    data.render ++;
                    data.reactions.push({
                        age: 0, element: <Reaction id={data.render} value={reaction.key}/>
                    })
                })
            }
        })
    }

    const updatePosition = () => {
        props.reactions.map(data => create(data))
        const newReactions = [...data.reactions.filter(reaction => reaction.age++ < 100)]
        props.reactions.splice(0)
        data.reactions = newReactions
        setRender(data.render ++)
        requestAnimationFrame(updatePosition);
    };

    return (<>
        {data.reactions.map(reaction => reaction.element)}
    </>);
}

export default ReactionContainer