declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string
    }
  }
}
export {}
