declare module 'students' {
  namespace Students {
    interface Student {
      StudentId: string
      LastModifiedDate: string
      StudentName: string
      Course: string
      Address: string
      TelNo: string
      isDeleted: boolean
    }
  }
}
