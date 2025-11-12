import { expect, test } from 'vitest'
import { generatorHandler } from '@prisma/generator-helper'

test('generatorHandler', () => {
  expect(generatorHandler).toBeDefined()
})
