import { ExtractSingleKey, IsUnion } from '../../../src/util/ExtractSingleKey'
import { MultiKeyExampleQuery, SingleKeyExampleQuery } from '../../fixtures/graphql-example-types'
import { assertExactType } from '../assertions'

// IsUnion

// When the type is a union, it should return true
const trueUnion: IsUnion<'id' | 'name'> = true
const numberTrueUnion: IsUnion<15 | 18> = true

// When the type is not a union, it should return false
const falseUnion: IsUnion<'id'> = false
const numberFalseUnion: IsUnion<15> = false
const arrayUnion: IsUnion<[string, number]> = false

// When the type is never, it should return never
let what: IsUnion<never>
assertExactType<typeof what, never>(what)

// ExtractSingleKey

// When the passed in type has a single key, it should return the type of that key
let singleKeyQuery: ExtractSingleKey<SingleKeyExampleQuery>
assertExactType<typeof singleKeyQuery, SingleKeyExampleQuery['example']>(singleKeyQuery)

// When the passed in type has multiple keys, it should return the type
let multiKeyQuery: ExtractSingleKey<MultiKeyExampleQuery>
assertExactType<typeof multiKeyQuery, MultiKeyExampleQuery>(multiKeyQuery)
