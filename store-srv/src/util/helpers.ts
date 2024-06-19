import crypto from 'crypto'

export function makeListingHash(req: ListingRequest) {
    return `listing_` + crypto.createHash('md5').update(JSON.stringify(req)).digest('hex')
}