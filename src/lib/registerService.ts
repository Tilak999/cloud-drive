/**
 * Register service.
 * @description Stores instances in `global` to prevent memory leaks in development.
 * @arg {string} name Service name.
 * @arg {function} initFn Function returning the service instance.
 * @return {*} Service instance.
 */

export default function registerService(name: string, initFn: () => any) {
    if (process.env.NODE_ENV === "development") {
        if (!(name in global)) {
            /*@ts-ignore*/
            global[name] = initFn();
        }
        /*@ts-ignore*/
        return global[name];
    }
    return initFn();
}
