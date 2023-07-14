import {NextApiRequest, NextApiResponse} from "next"

export const runtime = "edge";

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
};

export function getChannelId(url: string): Promise<string> {
    if (!url) {
        return Promise.reject(new Error('入力できてないかもしれません...'))
    }
    const match = url.match(/^@(.+)$/)
    if (match) {
        url = `https://www.youtube.com/@${match[1]}`
    }
    if (!isValidUrl(url)) {
        return Promise.reject(new Error('URLが間違ってるかもです...'))
    }
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response) => response.text())
            .then((data) => {
                const match = data.match(/<meta itemprop="identifier" content="([\w-]+)">/)
                if (!match) {
                    return reject(new Error('チャンネルが見つかりませんでした...'))
                }
                return resolve(match[1])
            })
            .catch((err) => reject(new Error(err.toString())))
    })
}

interface Body {
    url: string
}

export interface Response {
    id?: string
    error?: string
    ok: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>,) {
    const {url} = req.body as unknown as Body
    getChannelId(url)
        .then(id => {
            res.status(200).json({
                id, ok: true
            })
        })
        .catch((err) => {
            res.status(200).json({
                error: err.toString(), ok: false
            })
        })
}
