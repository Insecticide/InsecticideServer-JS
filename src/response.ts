import * as Deserialize from './deserialize'

export enum Types {
  STANDARD = 'Standard Response',
  FAILURE = 'Failure Response',
  INIT = 'Init Response',
  VARIABLES = 'Variables Response',
  STACK = 'Stack Response'
}

export interface BaseResponse {
  readonly type: Types
  readonly values: ReadonlyArray <string>
}

export interface StandardResponse extends BaseResponse {
  readonly type: Types.STANDARD
}

export interface FailureResponse extends BaseResponse {
  readonly type: Types.FAILURE
  readonly error: Error
  readonly code: number
}

export interface StackResponse extends BaseResponse {
  readonly type: Types.STACK
  readonly stack: Deserialize.Stack
}

export interface VariablesResponse extends BaseResponse {
  readonly type: Types.VARIABLES
  readonly variables: Deserialize.Variables
}

export interface InitResponse extends BaseResponse {
  readonly type: Types.INIT
  readonly id: string
  readonly path: string
}

type StandardOrFailure = StandardResponse | FailureResponse
export const standard = (resp: string): StandardOrFailure => {
  const msg = resp.split(';')
  const msgType = msg.shift()

  if (msgType === 'OK') {
    return {
      type: Types.STANDARD,
      values: msg
    }
  } else if (msgType === 'ERR') {
    let code = msg.shift()

    return {
      type: Types.FAILURE,
      error: new Error(msg.shift() || 'Unknown error'),
      code: code ? parseInt(code, 10) : 0,
      values: msg
    }
  } else {
    return {
      type: Types.FAILURE,
      error: new Error('Unknown format: "' + resp + '"'),
      code: 0,
      values: msg
    }
  }
}

type InitOrFailure = InitResponse | FailureResponse
export const init = (resp: string): InitOrFailure => {
  const parsed = standard(resp)

  if (parsed.type === Types.FAILURE) {
    return parsed
  } else {
    const values = parsed.values as string[]
    const id = values.shift()
    const path = values.shift()

    return {
      type: Types.INIT,
      id: id ? id : '',
      path: path ? path : '',
      values
    }
  }
}

type VariableOrFailure = VariablesResponse | FailureResponse
export const variables = (resp: string): VariableOrFailure => {
  const parsed = standard(resp)

  if (parsed.type === Types.FAILURE) {
    return parsed
  } else {
    const values = parsed.values as string[]
    const variables = Deserialize.variables(values.shift())

    return {
      type: Types.VARIABLES,
      values,
      variables
    }
  }
}

type StackOrFailure = StackResponse | FailureResponse
export const stack = (resp: string): StackOrFailure => {
  const parsed = standard(resp)

  if (parsed.type === Types.FAILURE) {
    return parsed
  } else {
    const values = parsed.values as string[]
    const stack = Deserialize.stack(values.shift())

    return {
      type: Types.STACK,
      values,
      stack
    }
  }
}
