// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env?: Record<string, unknown>;
			cf?: IncomingRequestCfProperties;
			ctx?: {
				waitUntil(promise: Promise<unknown>): void;
				passThroughOnException(): void;
			};
		}
	}
}

export {};
