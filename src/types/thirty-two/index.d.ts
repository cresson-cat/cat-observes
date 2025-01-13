declare module 'thirty-two' {
  export function encode(input: string | Buffer | Uint8Array): string;
  export function decode(input: string): Buffer;
}
