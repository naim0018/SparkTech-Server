declare module 'node-global-storage' {
    export function set(key: string, value: any): void;
    export function get(key: string): any;
} 