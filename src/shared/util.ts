export const createUpdateExpressions = (item: { [key: string]: any }) => {
  const updateExpression: string[] = []
  const expressionAttribute: { [key: string]: any } = {}
  const expressionAttributeNames: { [key: string]: any } = {}
  Object.keys(item).map((key) => {
    const placeholder = `:${key}`
    const alias = `#${key}`
    updateExpression.push(`${alias} = ${placeholder}`)
    expressionAttribute[placeholder] = item[key]
    expressionAttributeNames[alias] = key
  })
  return { updateExpression, expressionAttribute, expressionAttributeNames }
}
