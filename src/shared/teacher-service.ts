import {RpcService} from "../rpc-service";

export interface TeacherService extends RpcService {
    getAllTeachers(): [string];
}