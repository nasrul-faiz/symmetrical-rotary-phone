import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeReminderTargetChats } from './bot-reminder-utils.ts'

test('appends a WhatsApp number to an existing target chat list', () => {
  assert.equal(
    mergeReminderTargetChats('60123456789,1203630xxxx@g.us', '60198765432'),
    '60123456789,1203630xxxx@g.us,60198765432'
  )
})

test('does not duplicate the same WhatsApp number', () => {
  assert.equal(
    mergeReminderTargetChats('60123456789, 60198765432', '60198765432'),
    '60123456789,60198765432'
  )
})

test('returns the number when no existing target chats are present', () => {
  assert.equal(mergeReminderTargetChats('', '60123456789'), '60123456789')
})
