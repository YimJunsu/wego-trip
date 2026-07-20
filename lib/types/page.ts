/** App Router 페이지 공통 props. searchParams는 Next 15부터 Promise다. */
export type PageProps<Params = Record<string, never>> = {
  params: Promise<Params>
  searchParams: Promise<{ state?: string }>
}
