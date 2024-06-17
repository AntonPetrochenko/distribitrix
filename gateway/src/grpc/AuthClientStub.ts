import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { Claim, Credentials, TokenPair, UserClient, UserInfo } from "./generated/auth";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";
import { tokenToMetadata } from "../util/tokenToMetadata";


const userClient = new UserClient(process.env.USER_ADDRESS ?? '', ChannelCredentials.createInsecure(), {})


export class AuthClientStub {
    auth(login: string, password: string, cb: UnaryCallback<TokenPair>) {
        userClient.Auth(new Credentials({login, password}),new Metadata({}),{},cb)
    }
    
    register(login: string, password: string, cb: UnaryCallback<TokenPair>) {
        userClient.Register(new Credentials({login, password}), new Metadata({}), cb)
    }

    refresh(login: string, refreshToken: string, cb: UnaryCallback<TokenPair>) {
        userClient.Refresh(new Claim({login}), tokenToMetadata({refresh: refreshToken}), cb)
    }

    modify(authToken: string, login: string, password: string, admin: boolean, cb: UnaryCallback<{}>) {
        userClient.Modify(new UserInfo({
            login,
            password,
            admin
        }),tokenToMetadata({auth: authToken}), cb)
    }
}