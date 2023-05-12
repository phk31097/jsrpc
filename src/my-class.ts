import {RpcService} from "./rpc-service";

class MyClassHelloWorld {
    public helloWorld(): string {
        return 'asdf';
    }
}

interface MyInterface extends RpcService {
    thisIsMyProperty: () => string;
    anotherProperty: (param1: MyClassHelloWorld) => void;
}

interface Course {}

interface SyllabusService extends RpcService {
    getCourses(start: number, limit: number): Course[];
}