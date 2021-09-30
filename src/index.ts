import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';
import { buildSchema, ObjectType, Field, Query, Resolver } from 'type-graphql';
import { ApolloServer } from 'apollo-server';

// --- Injected controlled ---

class ApiController {}

abstract class Controller {
    @Inject('ApiController')
    protected readonly api!: ApiController;

    constructor(apiController: ApiController) {
        this.api = apiController;
    }
}

// --- Album resolver ---

@ObjectType()
export class Album {
    @Field({ nullable: false })
    public id!: number;
}

@Service()
@Resolver(() => Album)
export class AlbumController extends Controller {
    @Query(() => Album, { name: 'album' })
    public album(): Album {
        return {
            id: 666,
        };
    }
}

async function startServer(): Promise<void> {
    Container.set('ApiController', new ApiController());

    const schema = await buildSchema({
        resolvers: [AlbumController],
        emitSchemaFile: true,
        // Used to inject `ApiController` into controller instances.
        container: Container,
        // Avoids warning when class-validator is not used in the code.
        validate: false,
        // All fields are nullable by default per webapi documentation.
        nullableByDefault: true,
    });

    const server = new ApolloServer({
        schema,
        debug: true,
        playground: true,
    });

    server.listen().then(({ url }) => {
        console.info(`🚀 Server ready at ${url}`);
    });
}

startServer();
