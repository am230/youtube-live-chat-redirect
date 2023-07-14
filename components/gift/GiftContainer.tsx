import Gift, {GiftData} from "./Gift";
import {ReactElement, useEffect, useState} from "react";
import Reaction from "../reaction/Reaction";

export interface GiftData {
    id: string;
    type: string;
    message: string;
    plainMessage: string;
    item: {
        name: string; image: string; detailImage: string; effectCommand: string; showsSenderInfo: boolean;
    };
    sender: {
        id: string; name: string; screenName: string; profileImage: string; grade: number;
    };
    isForMovie: boolean;
    isPaidGift: boolean;
    createdAt: number;
    dango: {
        amount: number; isEmphasized: boolean;
    };
}

interface Entry {
    age: number
    element: ReactElement
}

const data = {
    reactions: [], spawnQueue: [], render: 0
}

const GiftContainer = (props: { reactions: GiftData[] }) => {
    const [render, setRender] = useState(0)

    useEffect(() => {
        const animationFrame = requestAnimationFrame(updatePosition);
        setInterval(() => {
            while (data.spawnQueue.length > 30) {
                data.spawnQueue.pop()()
            }
            if (data.spawnQueue.length) data.spawnQueue.pop()()
        }, 300)
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const create = (gift: GiftData): Entry[] => {
        console.log(gift)
        data.spawnQueue.push(() => {
            if (data.reactions.length > 300) return

            data.render++;
            data.reactions.push({
                age: 0, element: <Gift id={data.render} imageUrl={gift.item.image}/>
            })
        })

        for (let i = 0; i < gift.dango.amount; i++) {
            data.render++;
            data.reactions.push({
                age: 0, element: <Reaction id={data.render} value={'🍡'}/>
            })
        }
    }

    const updatePosition = () => {
        props.reactions.map(data => create(data))
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

export default GiftContainer