import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { SearchClient, ProductSet, SearchRequest } from "./generated/search";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";

const searchClient = new SearchClient(process.env.SEARCH_ADDRESS ?? '', ChannelCredentials.createInsecure(), {})

export class SearchClientStub {
    search(query: string, includeDisabled: boolean, cb: UnaryCallback<ProductSet>) {
        console.log('Trying for query',query)
        searchClient.Search(new SearchRequest({term: query, includeDisabled}), new Metadata(), cb)
    }
}