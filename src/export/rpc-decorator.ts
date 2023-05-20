export function rpc(target: Function) {
    if (!target.prototype !== undefined) {
        throw new Error('Not supported on this element');
    }
}