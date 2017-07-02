const regs = {
  escape: /([@`=,!$;]|[^\40-\176])/gm,
  unescape: /\$([\dabcde]{2})/gi
}

// Unescape characters
const tochar = (_: string, num: string) =>
  String.fromCharCode(parseInt(num, 16))

export const unescape = (str: string) =>
  str.replace(regs.unescape, tochar)

const tocode = (char: string) =>
  '$' + char.charCodeAt(0).toString(16).toUpperCase()

// Escape characters
export const escape = (str: string) =>
  str.replace(regs.escape, tocode)
