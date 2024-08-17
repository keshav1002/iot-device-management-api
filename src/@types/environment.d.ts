declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string
      STUDENTS_TABLE: string
    }
  }
}
export {}
