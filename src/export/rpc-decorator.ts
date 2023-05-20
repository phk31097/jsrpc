export function Rpc(target: Function) {
    if (!target.prototype !== undefined) {
        throw new Error('Not supported on this element');
    }
}