export const writes = []
let writer = async () => true
export const setWriter = (next) => {
  writer = next
}
export const setStringAsync = (value) => {
  writes.push(value)
  return writer(value)
}
