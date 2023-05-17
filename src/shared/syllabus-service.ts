import {RpcService} from "../rpc-service";

export interface SyllabusService extends RpcService {
    getAllCourses(filter: string): string[];
}