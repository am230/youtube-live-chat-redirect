import React, {useEffect, useState} from 'react';
import axios from "axios";
import Reaction, {ReactionData} from "../components/reaction/Reaction";
import ReactionContainer from "../components/reaction/ReactionContainer";

interface Chat {
    key: string
    continue_str: string
}

interface Next {
    continue_str: string
    reactions: ReactionData[]
}

const test: ReactionData[] = [{
    "reactions": [{
        "key": "😳", "value": 1
    }, {
        "key": "🎉", "value": 1
    }, {
        "key": "😄", "value": 1
    }], "totalReactions": 3, "duration": {
        "seconds": "1"
    }, "intensityScore": 0.75
}, {
    "reactions": [{
        "key": "❤", "value": 1
    }], "totalReactions": 1, "duration": {
        "seconds": "1"
    }, "intensityScore": 0.75
},]
const lock = []

const Chat = () => {
    const [control, setControl] = useState<boolean>(true)
    const [id, setId] = useState<string>(null)
    const [chat, setChat] = useState<Chat | any>({})
    const [reactions, setReactions] = useState<ReactionData[]>([])
    const [transparent, setTransparent] = useState(false)
    const [message, setMessage] = useState('')

    const getChat = async (id: string) => {
        if (!id) {
            setMessage('idが入力されてません…')
            return
        }
        try {
            setMessage('接続中…')
            console.log(id)
            const video = await axios.get<string>(`/api/get?id=${id}`)
            console.log(video.data)
            const res = await axios.get<Chat>(`/api/chat/new/${video.data}`)
            const data = res.data
            chat.key = data.key
            chat.continue_str = data.continue_str
            console.log(chat)
            setMessage('接続しました！')
        } catch (e) {
            setMessage('エラーが発生しました…')
        }
    }

    useEffect(() => {
        let url = new URL(window.location.href);
        let params = url.searchParams;
        setTransparent(!params.get("transparent"))
        setControl(!params.get("noControl"))
        getChat(params.get("id"))
        if (lock.length) return
        lock.push(1)
        setTimeout(() => update(), 1000)
    }, [])

    const update = () => {
        if (chat.key) {
            axios.get<Next>(`/api/chat/next?key=${chat.key}&continue_str=${chat.continue_str}`)
                .then(res => res.data)
                .then(res => {
                    chat.continue_str = res.continue_str
                    reactions.push(...res.reactions)
                })
        }
        setTimeout(() => update(), 1000)
    }

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
        <ReactionContainer reactions={reactions}/>
    </>
};

export default Chat;
