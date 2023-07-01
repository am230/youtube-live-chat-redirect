import {NextApiRequest, NextApiResponse} from "next"

interface Query {
    key: string
    continue_str: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse,) {
    let {key, continue_str} = req.query as unknown as Query

    let payload = {
        context: {
            client: {
                clientName: 'WEB', clientVersion: '2.20230622.06.00'
            }
        }, continuation: continue_str
    };

    return fetch(`https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${key}&prettyPrint=False`, {
        method: 'POST', body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            console.log('frameworkUpdates' in data)
            let liveChatContinuation = data['continuationContents']['liveChatContinuation'];
            continue_str = liveChatContinuation['continuations'][0]["invalidationContinuationData"]["continuation"];
            let reactions = []
            if ('frameworkUpdates' in data) {
                reactions = data['frameworkUpdates']['entityBatchUpdate']['mutations'][0]['payload']['emojiFountainDataEntity']['reactionBuckets']
            }
            res.status(200).json({
                continue_str,
                reactions
            })
        });
}
