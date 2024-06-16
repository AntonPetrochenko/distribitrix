import { Database } from "./db/bootstrap";
import { init } from "./grpc/service";

Database.getInstance().then((s) => {
    init(s)
})