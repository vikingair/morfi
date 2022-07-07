const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export const Utils = { sleep };
