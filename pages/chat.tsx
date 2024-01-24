import axios from "axios";
import { useEffect, useState } from 'react';
import ReactionContainer from "../components/ReactionContainer";
import { NewChatResponse } from './api/youtube/chat/new';
import { GetLiveResponse } from './api/youtube/get_live';


interface Next {
    continue_str: string | null
    reactions: { [key: string]: number }
}
const lock = []

const Chat = () => {
    const [control, setControl] = useState<boolean>(true)
    const [chat, setChat] = useState<NewChatResponse | any>({})
    const [reactions, setReactions] = useState<{ key: string }[]>([])
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
            const video = await axios.get<GetLiveResponse>(`/api/youtube/get_live`, {
                params: {
                    id
                }
            })
            if (!video.data.ok) {
                setMessage(video.data.message)
                return
            }
            const res = await axios.get<NewChatResponse>(`/api/youtube/chat/new`, {
                params: {
                    id: video.data.url
                }
            })
            const data = res.data
            if (!data.ok) {
                setMessage(data.message)
                return
            }
            chat.key = data.key
            chat.continue_str = data.continue_str
            console.log(chat)
            setMessage('接続しました！')
        } catch (e) {
            setMessage(`エラーが発生しました…: ${e}`)
        }
    }

    useEffect(() => {
        let url = new URL(window.location.href);
        let params = url.searchParams;
        setTransparent(!params.get("transparent"))
        setControl(!params.get("noControl"))
        chat.id = params.get("id")
        getChat(params.get("id"))
        if (lock.length) return
        lock.push(1)
        setTimeout(() => update(), 1000)
    }, [])

    const update = () => {
        if (chat.key && chat.continue_str) {
            axios.get<Next>(`/api/youtube/chat/next?key=${chat.key}&continue_str=${chat.continue_str}`)
                .then(res => res.data)
                .then(res => {
                    chat.continue_str = res.continue_str
                    if (!res.reactions) return
                    Object.keys(res.reactions).forEach(key => {
                        for (let i = 0; i < res.reactions[key]; i++) {
                            reactions.push({ key })
                        }
                    })
                })
        }
        if (!chat.continue_str) {
            getChat(chat.id)
        }
        setTimeout(() => update(), 1000)
    }

    return <>
        {control && <div className="control-panel">
            <button onClick={async () => {
                let url = new URL(window.location.href);
                await navigator.clipboard.writeText(`${window.location.origin}${url.pathname}?transparent=true&noControl=true&id=${chat.id}`);
                setMessage('コピーしました！')
            }}>
                リンクをコピー
            </button>
            <button onClick={() => {
                reactions.push({ key: '♥' })
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
                onChange={(e) => chat.id = e.target.value}
                onBlur={(e) => getChat(e.target.value)}
            />
            <h4>{message}</h4>
        </div>}


        {!transparent && <style>{`body {background: transparent !important}`}</style>}
        <ReactionContainer reactions={reactions} />
    </>
};

export default Chat;
