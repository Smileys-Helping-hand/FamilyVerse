declare module 'drizzle-orm' {
	export const sql: any;
	export const eq: any;
	export const and: any;
	export const or: any;
	export const asc: any;
	export const desc: any;
	export const lt: any;
	export const count: any;
	export const inArray: any;
	export const relations: any;
}

declare module 'drizzle-orm/pg-core' {
	export type ColumnBuilder = {
		notNull: () => ColumnBuilder;
		default: (value?: any) => ColumnBuilder;
		defaultNow: () => ColumnBuilder;
		primaryKey: () => ColumnBuilder;
		unique: () => ColumnBuilder;
		references: (...args: any[]) => ColumnBuilder;
		defaultRandom: () => ColumnBuilder;
		$type: <T>() => ColumnBuilder;
	};

	export function pgTable(name: string, columns: Record<string, ColumnBuilder>): any;
	export function text(name: string): ColumnBuilder;
	export function timestamp(name: string): ColumnBuilder;
	export function boolean(name: string): ColumnBuilder;
	export function integer(name: string): ColumnBuilder;
	export function jsonb(name: string): ColumnBuilder;
	export function varchar(name: string, opts?: any): ColumnBuilder;
	export function serial(name: string): ColumnBuilder;
	export function bigint(name: string, opts?: any): ColumnBuilder;
	export function uuid(name: string): ColumnBuilder;
}

declare module 'drizzle-orm/neon-http' {
	export const drizzle: any;
}

declare module 'firebase/firestore' {
	export type Timestamp = any;
	export const Timestamp: { now: () => any; fromDate: (date: Date) => any };
	export type Firestore = any;
	export const getFirestore: any;
	export const collection: any;
	export const doc: any;
	export const addDoc: any;
	export const setDoc: any;
	export const updateDoc: any;
	export const serverTimestamp: any;
	export const query: any;
	export const where: any;
	export const getDocs: any;
	export const getDoc: any;
	export const limit: any;
	export const writeBatch: any;
	export const onSnapshot: any;
	export const orderBy: any;
}

declare module 'firebase/storage' {
	export type FirebaseStorage = any;
	export const getStorage: any;
	export const ref: any;
	export const uploadBytes: any;
	export const getDownloadURL: any;
}

declare module 'livekit-server-sdk' {
	export class AccessToken {
		constructor(apiKey: string, apiSecret: string, opts: any);
		addGrant(grant: any): void;
		toJwt(): string;
	}
}

declare module 'livekit-client' {
	export class Room {
		participants: Map<string, any>;
		localParticipant: { publishTrack: (track: any) => void };
		connect: (url: string, token: string) => Promise<void>;
		disconnect: () => void;
		on: (event: string, handler: (...args: any[]) => void) => Room;
	}
	export function createLocalTracks(opts: any): Promise<any[]>;
}
