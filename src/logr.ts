/**
    bla
*/
export function logb(text: string): void {
    console.group(text);
}
/**
    bla
*/
export function loge(): void {
    console.groupEnd();
}

/**
    bla
*/
export function logr(text: string): void {
    console.log(text);
}

/**
    bla
*/
export function loga() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const targetMethod = descriptor.value;

        descriptor.value = function (...args: any[]): any {
            //const a = args.map(a => JSON.stringify(a)).join();
            // logb(`${target.constructor.name}.${propertyKey}` + (includeArguments ? ` (${a})` : ''));
            logb(`${target.constructor.name}.${propertyKey}`);
            const result = targetMethod.apply(this, args);
            loge();

            return result;
        };

        return descriptor;
    };
}
