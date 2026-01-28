// src/mocks/test-utils.ts
import type { RequestHandler } from "msw";

import { server } from "./server";

export const overrideHandlers = (...handlers: RequestHandler[]) => {
  server.use(...handlers);
};
