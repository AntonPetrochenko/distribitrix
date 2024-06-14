import { SignJWT, jwtVerify } from "jose";
import fs from 'node:fs'

const secret = Uint8Array.from(fs.readFileSync('/var/run/secrets/jwt_secret'));
const alg = 'HS256'

const URN_AUTH = 'urn:distribitrix:auth'
const URN_SERVICE = 'urn:distribitrix:services'

function claimTo(what: string, who: string) {
    return `__${what}_${who}`;
}

export async function issueRenewer(login: string) {
    return await (new SignJWT()
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setSubject(claimTo('renew', login))
        .setIssuer(URN_AUTH)
        .setAudience(URN_AUTH) // от себя себе
        .setExpirationTime('24h')
        .sign(secret))
}

export async function issueAccess(login: string) {
    return await (new SignJWT()
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setSubject(claimTo('access', login))
        .setIssuer(URN_AUTH)
        .setAudience(URN_SERVICE)
        .setExpirationTime('2h')
        .sign(secret))
}

export async function verifyRenew(jwt: string, login: string) {
    return await jwtVerify(jwt, secret, {
        audience: URN_AUTH,
        issuer: URN_AUTH,
        subject: claimTo('renew', login)
    })
}

export async function verifyAccess(jwt: string, login: string) {
    return await jwtVerify(jwt, secret, {
        audience: URN_SERVICE,
        issuer: URN_AUTH,
        subject: claimTo('access', login)
    })
}