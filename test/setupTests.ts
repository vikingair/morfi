import { afterEach, beforeAll, beforeEach, describe } from "vitest";
// test utility to await all running promises
global.nextTick = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

(global as any).describe = describe;
beforeAll(async () => {
  const { Spy } = await import("spy4js");
  Spy.configure({ enforceOrder: true, useGenericReactMocks: true });
  beforeEach(() => {
    Spy.initMocks();
  });
  afterEach(() => {
    Spy.restoreAll();
    Spy.resetAll();
  });
});
