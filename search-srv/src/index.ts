import { CacheContainer } from "./cache/bootstrap";
import { Database } from "./db/bootstrap";
import { init } from "./grpc/service";

(async () => {
    // а можно так, но не так хорошо
    init(
        await Database.getInstance(),
        await CacheContainer.getInstance()
    )
})()