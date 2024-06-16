import { Metadata } from "@grpc/grpc-js";

export function tokenToMetadata(opts: {refresh?: string, auth?: string}) {
    const metadata = new Metadata()

    if (opts.refresh) {
        metadata.set('refresh-token', opts.refresh)
    }

    if (opts.auth) {
        metadata.set('auth-token', opts.auth)
    }

    return metadata
}