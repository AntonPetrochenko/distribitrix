import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { ProductClient, ProductSet, SearchRequest } from "./generated/search";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";

// ОШИБСЯ В ИМЕНОВАНИИ!!! Этот ProductClient содержит один метод Search
const searchClient = new ProductClient(process.env.SEARCH_ADDRESS ?? '', ChannelCredentials.createInsecure(), {})

export class SearchClientStub {
    search(query: string, cb: UnaryCallback<ProductSet>) {
        console.log('Trying for query',query)
        searchClient.Search(new SearchRequest({term: query}), new Metadata(), cb)
    }
}