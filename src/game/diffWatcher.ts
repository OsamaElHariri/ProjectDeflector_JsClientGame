export function shouldUpdate(watchedValues: any, state: any): boolean {
    for (let i = 0; i < Object.keys(watchedValues).length; i++) {
        const key = Object.keys(watchedValues)[i];
        if (watchedValues[key] !== state[key]) return true;
    }
    return false;
}
