import {NextApiRequest, NextApiResponse} from "next"

interface Body {
    video_id: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse,) {
    const {id} = req.query

    return fetch(`https://www.youtube.com/live_chat?is_popout=1&v=${id}`, {
        headers: {
            'User-Agent': 'Mozilla/5.4 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    })
        .then(response => response.text())
        .then(text => {
            const key = text.match(/"INNERTUBE_API_KEY":\s?"([\w\d_]{39})"/)[1];
            const continue_str = text.match(/"continuation":\s?"([\d\w%-]+)"/)[1];
            res.status(200).json({
                key, continue_str
            })
        });
}

