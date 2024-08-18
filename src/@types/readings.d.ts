declare module 'readings' {
  namespace Readings {
    interface Reading {
      Temp: number
      TTL: number
      ErrorStatus?: string
    }

    interface ErrorStatus {
      ErrorStatus: string
    }
  }
}
