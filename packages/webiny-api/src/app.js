// @flow
import debug from "debug";
import cls from "cls-hooked";
import compose from "webiny-compose";
import { ServiceManager } from "webiny-service-manager";
import GraphQL from "./graphql/GraphQL";
import { Entity } from "./index";

// Attributes registration functions
import registerBufferAttribute from "./attributes/registerBufferAttribute";
import registerFileAttributes from "./attributes/registerFileAttributes";
import registerImageAttributes from "./attributes/registerImageAttributes";

class Api {
    config: Object;
    graphql: GraphQL;
    services: ServiceManager;
    namespace: cls$Namespace;
    apps: Array<Function>;

    constructor() {
        this.config = {};
        this.graphql = new GraphQL();
        this.services = new ServiceManager();
        this.apps = [];
    }

    getRequest(): express$Request {
        return this.namespace.get("req");
    }

    configure(config: Object) {
        this.config = config;

        // Configure Entity layer
        if (config.entity) {
            // Register Entity driver
            Entity.driver = config.entity.driver;
            // Register attributes
            config.entity.attributes &&
                config.entity.attributes({
                    bufferAttribute: registerBufferAttribute,
                    fileAttributes: registerFileAttributes,
                    imageAttributes: registerImageAttributes
                });
        }
    }

    use(app: Function) {
        this.apps.push(app);
    }

    middleware(middleware: Array<Function>): Function {
        compose(this.apps)({ app: this });

        const log = debug("webiny-api");
        this.namespace = cls.createNamespace(Date.now().toString());

        const webinyMiddleware = compose(middleware);

        // Route request
        return async (req: express$Request, res: express$Response) => {
            log("Received new request");
            this.namespace.run(async () => {
                return (async () => {
                    this.namespace.set("req", req);

                    webinyMiddleware({ req, res });
                })();
            });
        };
    }
}

export default Api;
