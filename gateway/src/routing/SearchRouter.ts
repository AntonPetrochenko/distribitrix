import { Router } from "express"
import { SearchClientStub } from "../grpc/SearchClientStub"
import { handleServiceFailure } from "../util/handleServiceFailure"

export const SearchRouter = Router()

const searchClient = new SearchClientStub()

SearchRouter.get('/', (req, res) => {
    if (typeof req.query.query == "string") {
        searchClient.search(req.query.query, (err, data) => {
            if (err) {
                handleServiceFailure(err, res)
            } else {
                res.status(200).send(data?.toObject())
            }
        })
    } else {
        res.status(400).send()
    }
})