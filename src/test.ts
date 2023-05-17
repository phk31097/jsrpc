import {RpcCodeGenerator} from "./code-generator";
import {RpcClientFactory} from "./client-factory";
import {SyllabusServiceClient} from "./client/syllabus-service";

new RpcClientFactory().getClient(SyllabusServiceClient).getAllCourses('Hello', 123);

new RpcCodeGenerator({
    baseDirectory: 'src',
    sharedDirectory: 'shared',
    clientDirectory: 'client',
    serverDirectory: 'server',
}).generate();