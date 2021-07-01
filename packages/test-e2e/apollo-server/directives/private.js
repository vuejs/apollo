const { SchemaDirectiveVisitor } = require('graphql-tools')
const { defaultFieldResolver } = require('graphql')
const { ApolloError } = require('apollo-server-express')

module.exports = class PrivateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field
    field.resolve = (root, args, context, info) => {
      if (!context.userId) throw new ApolloError('Unauthorized', 'unauthorized')
      return resolve(root, args, context, info)
    }
  }
}
