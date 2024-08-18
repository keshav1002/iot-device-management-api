import { APIGatewayProxyResult } from 'aws-lambda'

export const errorResponse = (message: string, statusCode: number = 500): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({ message }),
    headers: {
      'content-type': 'application/json',
    },
  }
}

export const response = <T>(payload: T, statusCode: number = 200): APIGatewayProxyResult => {
  const body = typeof payload === 'object' ? payload : { message: payload }

  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
  return response
}
