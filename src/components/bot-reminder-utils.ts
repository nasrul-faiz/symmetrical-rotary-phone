export function normalizeReminderNumber(value: string): string {
  const digits = String(value || '').trim().replace(/[^0-9]/g, '')
  return digits
}

export function mergeReminderTargetChats(existing: string, incoming: string): string {
  const values = String(existing || '')
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  const normalizedIncoming = normalizeReminderNumber(incoming)
  if (!normalizedIncoming) return values.join(',')

  const normalizedIncomingWithSuffix = `${normalizedIncoming}`
  const nextValues = values.filter((value) => normalizeReminderNumber(value) !== normalizedIncomingWithSuffix)
  nextValues.push(normalizedIncomingWithSuffix)

  return nextValues.join(',')
}
