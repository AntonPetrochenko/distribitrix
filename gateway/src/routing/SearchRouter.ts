import { Router } from "express"
import { SearchClientStub } from "../grpc/SearchClientStub"
import { handleServiceFailure } from "../util/handleServiceFailure"
import { AuthClientStub } from "../grpc/AuthClientStub"
import { protectWithAuthService } from "../middleware/auth"
import { COOKIE_TOKEN_AUTH } from "../util/constants"

export const SearchRouter = Router()

const searchClient = new SearchClientStub()

// TODO: Пока заведём тут ещё один экземпляр authClient, потом переделаем их загрузку
const authClient = new AuthClientStub() 

SearchRouter.get('/', protectWithAuthService, (req, res) => {
    authClient.isAdmin(req.cookies[COOKIE_TOKEN_AUTH] ?? '', (err, data) => {
        if (err) {
            handleServiceFailure(err, res)
        } else if (data) {
                if (typeof req.query.query == "string") {
                    searchClient.search(req.query.query, data.isAdmin, (err, data) => {
                        if (err) {
                            handleServiceFailure(err, res)
                        } else {
                            res.status(200).send(data?.toObject())
                        }
                    })
                } else {
                    res.status(400).send()
                }
            }
        })
})