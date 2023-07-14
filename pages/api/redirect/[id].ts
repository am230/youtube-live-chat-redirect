import {NextApiRequest, NextApiResponse} from "next"
import {getChannelId} from "../channel_id";
import {getLive} from "../get"

export const runtime = "edge";
interface Query {
    id: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse,) {
    const {id} = req.query as unknown as Query
    return getLive(id)
        .then((url) => {
            res.redirect(`https://www.youtube.com/live_chat?is_popout=1&v=${url}`)
        })
        .catch((err) => {
            res.status(500).json(err)
        })
}
