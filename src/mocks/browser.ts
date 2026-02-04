import { setupWorker } from "msw/browser";

const devHandlers: [] = [];

export const worker = setupWorker(...devHandlers);
