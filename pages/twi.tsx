import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chat from "./chat";
import GiftContainer from "../components/gift/GiftContainer";
import {TwicastResponse} from "./api/twicast";

const test = [
    {
        "id": "3145e5b1.64a7e924173632.86223726",
        "type": "gift",
        "message": "(+🍡20)",
        "plainMessage": "",
        "item": {
            "name": "お茶ｘ10",
            "image": "https://s01.twitcasting.tv/img/item_tea_10.png",
            "detailImage": "",
            "effectCommand": "flowitem(\"https://twitcasting.tv/img/anim/anim_tea_10\", 3000, 1, 2, 5)",
            "showsSenderInfo": true
        },
        "sender": {
            "id": "nrnetwork1025",
            "name": "むっちゃん",
            "screenName": "nrnetwork1025",
            "profileImage": "https://imagegw02.twitcasting.tv/image3s/pbs.twimg.com/profile_images/1636118633138233344/J7ipBFs__normal.jpg",
            "grade": 1
        },
        "isForMovie": false,
        "isPaidGift": false,
        "createdAt": 1688725796000,
        "dango": {
            "amount": 20,
            "isEmphasized": false
        }
    }
]

export default function IndexPage() {
    const [control, setControl] = useState<boolean>(true)
    const [id, setId] = useState<string>(null)
    const [chat, setChat] = useState<Chat | any>({})
    const [reactions, setReactions] = useState<[]>([])
    const [transparent, setTransparent] = useState(false)
    const [message, setMessage] = useState('')
    const [socket, setSocket] = useState<WebSocket | null>(null)


    const connect = async (target: string) => {
        if (socket) {
            socket.close()
        }
        const response = await axios.get('/api/twicast', {
            params: { target }
        });
        const data: TwicastResponse = response.data;
        if (!data.ok) {
            throw new Error(data.message)
        }
        const ws = new WebSocket(`${data.url}&gift=1`)
        ws.addEventListener('message', (message) => {
            const events = JSON.parse(message.data);
            for (const event of events) {
                if (event.type === 'comment') {
                    console.log(event.message);
                } else if (event.type === 'gift') {
                    console.log(event.message, event);
                    reactions.push(event)
                }
            }
        });
        setSocket(ws)
    };

    const getChat = async (id: string) => {
        if (!id) {
            setMessage('idが入力されてません…')
            return
        }
        try {
            setMessage('接続中…')
            await connect(id)
            setMessage('接続しました！')
        } catch (e) {
            setMessage(`エラーが発生しました…: ${e.message}`)
        }
    }

    useEffect(() => {
        let url = new URL(window.location.href);
        let params = url.searchParams;
        setTransparent(!params.get("transparent"))
        setControl(!params.get("noControl"))
        getChat(params.get("id"))
    }, [])

    return <>
        {control && <div className="control-panel">
            <button onClick={async () => {
                let url = new URL(window.location.href);
                await navigator.clipboard.writeText(`${window.location.origin}${url.pathname}?transparent=true&noControl=true&id=${id}`);
                setMessage('コピーしました！')
            }}>
                リンクをコピー
            </button>
            <button onClick={() => {
                reactions.push(...test)
            }}>
                お試しボタン
            </button>
            <button onClick={() => {
                setTransparent(!transparent)
            }}>
                背景透過切り替え
            </button>
            <input
                type="text"
                placeholder='@id...'
                onChange={(e) => setId(e.target.value)}
                onBlur={(e) => getChat(e.target.value)}
            />
            <h4>{message}</h4>
        </div>}


        {!transparent && <style>{`body {background: transparent !important}`}</style>}
        <GiftContainer reactions={reactions}/>
    </>
}
