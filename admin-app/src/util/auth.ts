import { globalAxios } from "./networking";

export async function verifyAuth() {
    const res = await globalAxios.get('/auth/refresh')
    return res.status > 200 && res.status < 400
}