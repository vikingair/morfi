declare global {
  var nextTick: () => Promise<void>;
}

export {};
