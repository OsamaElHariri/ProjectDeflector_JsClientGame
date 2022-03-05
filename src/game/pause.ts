export async function pause(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(true), milliseconds);
    });
}