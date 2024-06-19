import { CacheContainer } from "./cache/bootstrap";
import { DatabaseContainer } from "./db/bootstrap";
import { init } from "./grpc/service";

// Можно так
Promise.all([
    DatabaseContainer.getInstance(),
    CacheContainer.getInstance()
]).then( services => init(services[0], services[1]))