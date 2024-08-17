import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { Students } from 'students'
import { randomUUID } from 'crypto'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const studentsTable = process.env.IS_OFFLINE
  ? 'record-management-dev-students'
  : process.env.STUDENTS_TABLE

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const body = getBodyFromEvent(event)

    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid payload' }),
        headers: {
          'content-type': 'application/json',
        },
      }
    }

    const studentId = randomUUID()
    const createdAt = new Date().toISOString()

    const command = new PutCommand({
      TableName: studentsTable,
      Item: {
        StudentId: studentId,
        LastModifiedDate: createdAt,
        isDeleted: 'no',
        StudentName: body.StudentName.trim(),
        Course: body.Course,
        Address: body.Address,
        TelNo: body.TelNo,
      },
    })

    await docClient.send(command)

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        createdAt,
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
      headers: {
        'content-type': 'application/json',
      },
    }
  }
}

const getBodyFromEvent = (event: APIGatewayProxyEvent): Students.Student | undefined => {
  if (!event.body) {
    return undefined
  }
  try {
    if (event.isBase64Encoded === true) {
      return JSON.parse(Buffer.from(event.body, 'base64').toString()) as Students.Student
    } else {
      return JSON.parse(event.body) as Students.Student
    }
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const handler = main
