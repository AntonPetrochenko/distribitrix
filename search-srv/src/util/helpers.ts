import crypto from 'crypto'

export function makeSearchHash(req: SearchRequest) {
    return `listing_` + req + crypto.createHash('md5').update(JSON.stringify(req)).digest('hex')
}