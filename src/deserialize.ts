import {unescape} from './utils'

export interface KeyValuePair {
  readonly key: Representation
  readonly value: Representation
}

export interface Representation {
  readonly type: string
  readonly data: string
  readonly reference: boolean
}

export type Variables = {
  references: Map <string, ReadonlyArray<KeyValuePair>>
  scopes: ReadonlyArray<string>
}

export type Stack = ReadonlyArray <Scope>

export interface Scope {
  path: string,
  function: string,
  line: number
}

const regs = {
  reference: /(.+?)`(.*?)`/g,
  keyValue: /(.+?)@(.*?)=(.+?)@(.*?),/g
}

const knownTypes = new Map ()
  .set('C', 'Coroutine')
  .set('F', 'Function')
  .set('U', 'Undefined')
  .set('T', 'Table')
  .set('M', 'Metatable')
  .set('B', 'Boolean')
  .set('N', 'Number')

// Format the type and representation into an object
const getRepresentation = (typ: string, val: string) => {
  let type: string
  let data: string
  let reference: boolean

  if (typ in knownTypes) {
    type = knownTypes.get(typ)
  } else {
    type = unescape(typ)
  }

  if (val[0] === '!') {
    data = unescape(val.slice(1))
    reference = true
  } else {
    data = unescape(val)
    reference = false
  }

  return {
    type,
    data,
    reference
  }
}

// Split key-value pairs
const getKeyValuePairs = (str: string): KeyValuePair[] => {
  const list: KeyValuePair[] = []
  let result = regs.keyValue.exec(str)

  while (result !== null) {
    const key = getRepresentation(result[1], result[2])
    const value = getRepresentation(result[3], result[4])

    list.push({
      key,
      value
    })

    result = regs.keyValue.exec(str)
  }

  return list
}

// Deserialize variables from string
export const variables = (str: string = ''): Variables => {
  const references = new Map()
  const scopes: string[] = []

  let result = regs.reference.exec(str)

  while (result !== null) {
    const vars = getKeyValuePairs(result[2])

    if (result[1][0] === '!') {
      const name = result[1].slice(1)
      references.set(name, vars)
      scopes.push(name)
    } else {
      references.set(result[1], vars)
    }

    result = regs.reference.exec(str)
  }

  return {
    references,
    scopes
  }
}

const pathLineFunction = /(.+?)@(.+?)=(.+?)/g

// Deserialize stack from string
export const stack = (str: string = ''): Stack => {
  const list: Array <Scope> = []

  str.split(',').forEach(scope => {
    const result = pathLineFunction.exec(scope)

    if (result) {
      list.push({
        path: result[1],
        line: parseInt(result[2],10),
        function: result[3]
      })
    }
  })

  return list
}
