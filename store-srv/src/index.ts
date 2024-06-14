import { Database } from "./db/bootstrap";
import { init } from "./gprc/service";

Database.getInstance().then((s) => {
    init(s)
})