import { NextApiRequest, NextApiResponse } from "next"
import { getChannelId } from "./channel_id";
import { DOMParser } from 'xmldom'

const regex = /"VIDEO_ID":"([\w\d_-]+)"/;

function fetchLastVideoUrlOld(channelId: string): Promise<string> {
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
            .catch(reason => {
                return reject(new Error('良く分からないエラーが出ました…'))
            })
    })
}
function fetchLastVideoUrl(channelId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(`https://www.youtube.com/embed/live_stream?channel=${channelId}`)
            .then((response) => response.text())
            .then((data) => {
                const match = data.match(regex)

                if (!match.length) {
                    return reject(new Error('配信を見つけられませんでした…'))
                }
                if (match[1] === 'live_stream') {
                    fetchLastVideoUrlOld(channelId)
                        .then(resolve)
                        .catch(reject)
                    return
                }
                return resolve(match[1])
            })
            .catch(reason => {
                return reject(reason)
            })
    })
}

interface Query {
    id: string
}

export const getLive = async (id: string) => {
    if (id.includes('@')) {
        id = await getChannelId(id)
    }
    return await fetchLastVideoUrl(id)
}

export interface GetLiveResponse {
    ok: boolean
    message?: string
    url?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetLiveResponse>,) {
    const { id } = req.query as unknown as Query
    return getLive(id)
        .then((url) => {
            res.status(200).json({
                url, ok: true
            })
        })
        .catch((err) => {
            res.status(200).json({
                message: err.toString(), ok: false
            })
        })
}
