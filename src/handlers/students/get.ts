import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const studentsTable = process.env.IS_OFFLINE
  ? 'record-management-dev-students'
  : process.env.STUDENTS_TABLE

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.pathParameters?.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid payload' }),
        headers: {
          'content-type': 'application/json',
        },
      }
    }
    const studentId = event.pathParameters.id

    const command = new QueryCommand({
      TableName: studentsTable,
      IndexName: 'StudentIsDeleted',
      KeyConditionExpression: '#StudentId = :StudentId AND #isDeleted = :isDeleted',
      ExpressionAttributeNames: {
        '#StudentId': 'StudentId',
        '#isDeleted': 'isDeleted',
      },
      ExpressionAttributeValues: {
        ':StudentId': studentId,
        ':isDeleted': 'no',
      },
      ScanIndexForward: false,
    })

    const result = await docClient.send(command)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student: result.Items }),
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

export const handler = main
