import axios from 'axios';
import {NextApiRequest, NextApiResponse} from "next";
import * as vm from "vm";

export const runtime = "edge";

async function fetchLive(target) {
    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67',
    };
    const params = {
        target: target,
        mode: 'client',
    };

    const response = await axios.get('https://twitcasting.tv/streamserver.php', {
        params: params,
        headers: headers,
        withCredentials: true,
    });
    return response.data;
}

async function fetchWs(movieId) {
    const wsKey = Math.random().toString(32).substring(2)

    const headers = {
        'Content-Type': `multipart/form-data; boundary=----${wsKey}`,
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67',
    };

    const __n = Math.floor(Date.now() / 1000);

    const data = `------${wsKey}\r\nContent-Disposition: form-data; name="movie_id"\r\n\r\n${movieId}\r\n------${wsKey}\r\nContent-Disposition: form-data; name="__n"\r\n\r\n${__n}\r\n------${wsKey}\r\nContent-Disposition: form-data; name="password"\r\n\r\n\r\n------${wsKey}--\r\n`;

    const response = await axios.post('https://twitcasting.tv/eventpubsuburl.php', data, {
        headers: headers,
        withCredentials: true,
    });
    return response.data.url;
}

export interface TwicastResponse {
    ok: boolean
    url?: string
    message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TwicastResponse>) {
    const target = req.query.target;
    const live = await fetchLive(target);
    if (!live.movie)
        return res.status(200).json({
            ok: false,
            message: '配信が見つかりませんでした'
        });
    const url = await fetchWs(live.movie.id);
    return res.status(200).json({
        ok: true,
        url
    });
}
