/**
 * Register service.
 * @description Stores instances in `global` to prevent memory leaks in development.
 * @arg {string} name Service name.
 * @arg {function} initFn Function returning the service instance.
 * @return {*} Service instance.
 */
export default function registerService(name, initFn) {
    if (process.env.NODE_ENV === "development") {
        if (!(name in global)) {
            global[name] = initFn();
        }
        return global[name];
    }
    return initFn();
}
