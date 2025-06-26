export class AppError extends Error {
  public statusCode: number
  public status: "fail" | "error"
  public isOperational: boolean
  public errors: any | null

  constructor(message: string, statusCode: number, errors: any | null = null) {
    super(message)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
    this.isOperational = true
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}
