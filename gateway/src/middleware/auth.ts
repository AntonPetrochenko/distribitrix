import { AuthClientStub } from "../grpc/AuthClientStub";

import { Request, Response, NextFunction } from "express";
import { handleServiceFailure } from "../util/handleServiceFailure";
import { COOKIE_TOKEN_AUTH } from "../util/constants";

const authClient = new AuthClientStub()

export function protectWithAuthService(req: Request, res: Response, next: NextFunction) {

    // Сначала я хотел сделать просто хелпер, а потом я КАААААААААААААК понял и осознал

    authClient.isAuthenticated(req.cookies[COOKIE_TOKEN_AUTH] ?? '', (err, data) => {
        if (err) {
            handleServiceFailure(err, res)
        } else {
            if (data && data.isAuthenticated) {
                next()
            } else {
                res.status(401).send()
            }
        }
    })
}