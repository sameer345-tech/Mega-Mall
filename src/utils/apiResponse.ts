class ApiResponse<T> {
  constructor( public success: boolean , public statusCode: number, public message: string, public data?: T) {
    
   
  }
}


export { ApiResponse }