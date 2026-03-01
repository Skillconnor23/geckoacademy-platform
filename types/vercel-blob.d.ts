declare module '@vercel/blob' {
  export interface PutBlobResult {
    url: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;
  }
  export function put(
    pathname: string,
    body: Blob | File | ArrayBuffer | string | ReadableStream,
    options?: { access?: 'public' | 'private'; addRandomSuffix?: boolean }
  ): Promise<PutBlobResult>;
}
