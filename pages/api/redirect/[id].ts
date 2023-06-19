import {NextApiRequest, NextApiResponse} from "next"
import {DOMParser} from 'xmldom'
import {getChannelId} from "../channel_id";
function fetchLastVideoUrl(channelId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
            .then((response) => response.text())
            .then((data) => {
                const doc = new DOMParser().parseFromString(data)
                const link = doc.getElementsByTagName('entry')[0].getElementsByTagName('link')[0].getAttribute('href')
                if (!link || !link.includes("v=")) {
                    return reject(new Error('No id found'))
                }
                return resolve(link.split("v=")[1])
            })
    })
}

interface Query {
    id: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    let {id} = req.query as unknown as Query
    if (id.includes('@')) {
        id = await getChannelId(id)
    }
    fetchLastVideoUrl(id)
        .then((url) => res.redirect(`https://www.youtube.com/live_chat?is_popout=1&v=${url}`))
        .catch((err) => {
            res.status(500).json(err)
        })
}
