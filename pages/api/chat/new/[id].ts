import {NextApiRequest, NextApiResponse} from "next"

interface Body {
    video_id: string
}

export interface NewChatResponse {
    ok: boolean
    message?: string
    key?: string
    continue_str?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<NewChatResponse>,) {
    const {id} = req.query

    return fetch(`https://www.youtube.com/live_chat?v=${id}`, {
        headers: {
            'User-Agent': 'Mozilla/5.4 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    })
        .then(response => response.text())
        .then(text => {
            const key = text.match(/"INNERTUBE_API_KEY":\s?"([\w\d_]{39})"/);
            const continue_str = text.match(/"continuation":\s?"([\d\w%-]+)"/);
            if (!key || !continue_str) {
                return res.status(200).json({
                    ok: false,
                    message: 'チャットを見つけられませんでした…'
                })
            }
            res.status(200).json({
                ok: true,
                key: key[1],
                continue_str: continue_str[1],
            })
        });
}

