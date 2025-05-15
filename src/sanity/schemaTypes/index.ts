import { type SchemaTypeDefinition } from 'sanity'
import question from './question'
import category from './category'

export const schemaTypes = [question, category]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [],
}
