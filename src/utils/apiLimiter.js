const queue = [];
const MAX_REQUESTS = 90; // Petite marge sous la limite
const TIME_WINDOW = 120000; // 2 minutes

export async function makeRequest(fn) {
    return new Promise((resolve) => {
        const execute = async () => {
            if (queue.length >= MAX_REQUESTS) {
                const now = Date.now();
                const oldest = queue[0];
                
                if (now - oldest < TIME_WINDOW) {
                    const delay = TIME_WINDOW - (now - oldest);
                    await new Promise(res => setTimeout(res, delay));
                    queue.shift();
                }
            }
            
            queue.push(Date.now());
            resolve(await fn());
        };
        
        execute();
    });
}