import { SignJWT, jwtVerify } from "jose";
import fs from 'node:fs'

const secret = Uint8Array.from(fs.readFileSync('/var/run/secrets/jwt_secret'));
const alg = 'HS256'

const URN_AUTH = 'urn:distribitrix:auth'
const URN_SERVICE = 'urn:distribitrix:services'


export async function issueRefresher(login: string) {
    return await (new SignJWT()
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setSubject(login)
        .setIssuer(URN_AUTH)
        .setAudience(URN_AUTH) // от себя себе
        .setExpirationTime('24h')
        .sign(secret))
}

export async function issueAccess(login: string) {
    return await (new SignJWT()
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setSubject(login)
        .setIssuer(URN_AUTH)
        .setAudience(URN_SERVICE)
        .setExpirationTime('2h')
        .sign(secret))
}

export async function verifyRefresh(jwt: string) {
    console.log('In method', jwt)
    try {
        return await jwtVerify(jwt, secret, {
            audience: URN_AUTH,
            issuer: URN_AUTH,
            requiredClaims: ['sub']
        })
    } catch (e) {
        return false
    }
}

export async function verifyAccess(jwt: string) {
    try {
        return await jwtVerify(jwt, secret, {
            audience: URN_SERVICE,
            issuer: URN_AUTH,
            requiredClaims: ['sub']
        })
    } catch (e) {
        return e
    }
}