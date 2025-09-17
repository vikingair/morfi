import { afterEach, beforeEach, expect } from "vitest";
import { Spy } from "spy4js";
// test utility to await all running promises
global.nextTick = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

Spy.setup({ beforeEach, afterEach, expect });

// (global as any).describe = describe;
// beforeAll(async () => {
//   const { Spy } = await import("spy4js");
//   Spy.configure({ enforceOrder: true, useGenericReactMocks: true });
//   beforeEach(() => {
//     Spy.initMocks();
//   });
//   afterEach(() => {
//     Spy.restoreAll();
//     Spy.resetAll();
//   });
// });
