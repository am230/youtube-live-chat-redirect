import { NextApiRequest, NextApiResponse } from "next";

interface Query {
    key: string
    continue_str: string
}

function processReactions(data: any) {
    if (!data['frameworkUpdates']) {
        return new Map<string, number>()
    }
    const reactions = new Map<string, number>()
    const updates = data['frameworkUpdates']['entityBatchUpdate']['mutations']
    for (const update of updates) {
        if (!('payload' in update)) {
            continue
        }
        const payload = update['payload']
        if (!('emojiFountainDataEntity' in payload)) {
            continue
        }
        const emoji = payload['emojiFountainDataEntity']
        for (const bucket of emoji['reactionBuckets']) {
            for (const reaction of bucket['reactions'] ?? []) {
                reactions.set(reaction['key'], reaction['value'])
            }
            for (const reaction of bucket['reactionsData'] ?? []) {
                reactions.set(reaction['unicodeEmojiId'], reaction['reactionCount'])
            }
        }
    }
    return Object.fromEntries(reactions)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse,) {
    let { key, continue_str } = req.query as unknown as Query
    let payload = {
        "context": {
            "client": {
                "clientName": "WEB",
                "clientVersion": "2.20230622.06.00",
            }
        },
        "continuation": continue_str,
    }

    const data = await fetch(`https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${key}&prettyPrint=False`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
        }
    }).then(response => response.json());
    if (!data['continuationContents']) {
        res.status(200).json({
            continue_str: null,
            reactions: []
        })
        return
    }
    const liveChatContinuation = data['continuationContents']['liveChatContinuation'];
    const continuation = liveChatContinuation.continuations[0];
    const invalidationContinuationData = continuation["invalidationContinuationData"] || continuation.timedContinuationData;
    if (!invalidationContinuationData) {
        res.status(200).json({
            continue_str: null,
            reactions: []
        })
        return
    }
    continue_str = invalidationContinuationData["continuation"];
    let reactions = {}
    if ('frameworkUpdates' in data) {
        reactions = processReactions(data)
    }
    res.status(200).json({
        continue_str,
        reactions
    });
}
