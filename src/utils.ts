export const defaultPageSize = 5

// Needs tests!
export const Pager = (offset: number, total: number, pageSize: number = defaultPageSize) => {
  const totalPages = Math.ceil(total / pageSize)
  const actualPage = Math.floor(offset / pageSize)
  const pages = Array(totalPages)
    .fill(false)
    .map((_, i) => i === actualPage) // Page Activities
  const computeOffset = (page: number) => page * pageSize

  return {
    totalPages,
    actualPage,
    pages,
    computeOffset,
  }
}

export const clampOffset = (offset: number, total: number, pageSize: number = defaultPageSize) => {
  if (offset < 0) {
    return 0
  }
  if (offset >= total && offset >= pageSize) {
    return offset - pageSize
  }
  return offset
}

export const prepareVal =
  <T extends any[]>(name: string, cb: (...args: T) => string | number | boolean) =>
  (...args: T) =>
    JSON.stringify({ [name]: cb(...args) })

export const makeNumber = (v: any, fallback: number) => {
  const n = Number(v)
  if (Number.isFinite(n)) {
    return n
  }
  return fallback
}
