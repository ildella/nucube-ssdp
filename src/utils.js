export const mapToJsonArray = map => Object.values(Object.fromEntries(map))

export const randomInt = ({max = 1_000_000, positive = true} = {}) => {
  const randomValue = Math.floor(Math.random() * max)
  if (positive) {
    return randomValue
  }
  return Math.random() > 0.5 ? randomValue : -randomValue
}
