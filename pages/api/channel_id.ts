import {NextApiRequest, NextApiResponse} from "next"

function getChannelId(url: string): Promise<string> {
    const match = url.match(/^@(.+)$/)
    if (match) {
        url = `https://www.youtube.com/@${match[1]}`
    }
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response) => response.text())
            .then((data) => {
                const match = data.match(/<meta itemprop="identifier" content="([\w-]+)">/)
                if (!match) {
                    return reject(new Error('Channel not found...'))
                }
                return resolve(match[1])
            })
            .catch((err) => reject(new Error(err.toString())))
    })
}

interface Body {
    url: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse,) {
    const {url} = req.body as unknown as Body
    getChannelId(url)
        .then(id => {
            res.status(200).json(id)
        })
        .catch((err) => {
            res.status(500).json(err)
        })
}
