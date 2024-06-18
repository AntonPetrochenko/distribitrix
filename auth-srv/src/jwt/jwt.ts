import { JWTPayload, JWTVerifyResult, SignJWT, jwtDecrypt, jwtVerify } from "jose";
import fs from 'node:fs'
import { UserModel } from "../db/models/UserModel";

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

export async function issueAuthentication(login: string) {
    return await (new SignJWT()
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setSubject(login)
        .setIssuer(URN_AUTH)
        .setAudience(URN_SERVICE)
        .setExpirationTime('2h')
        .sign(secret))
}


async function verifyInternal(jwt: string, audience: string): Promise<false | JWTVerifyResult<JWTPayload>> {
    console.log('In method', jwt)
    try {
        return await jwtVerify(jwt, secret, {
            audience,
            issuer: URN_AUTH,
            requiredClaims: ['sub']
        })
    } catch (e) {
        console.info('Refresh denied', e)
        return false
    }
}

export async function verifyAuth(jwt: string) {
    return verifyInternal(jwt, URN_SERVICE)
}

export async function verifyRefresh(jwt: string) {
    return verifyInternal(jwt, URN_AUTH)
}

export async function authorize(jwt: string): Promise<boolean> {
    try {
        const payload = (await jwtVerify(jwt, secret, {
            audience: URN_SERVICE,
            issuer: URN_AUTH,
            requiredClaims: ['sub']
        })).payload

        if (payload.sub) { // чтобы TS не ругался, его выше проверили
            const user = await UserModel.byLogin(payload.sub)
            return !!user && user.isAdmin
        }

        return false
    } catch (e) {
        console.info('Is not an admin', e)
        return false
    }
}