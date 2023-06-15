/**
 * @fileoverview checks if imports from external modules are made from public api (index.ts)
 * @author ylsv
 */
"use strict"

const { isPathRelative } = require('../helpers')
const micromatch = require('micromatch')
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const PUBLIC_ERROR = 'PUBLIC_ERROR'
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR'

module.exports = {
  meta: {
    type: null,
    docs: {
      description: "checks if imports from external modules are made from public api (index.ts)",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    messages: {
      [PUBLIC_ERROR]: 'absolute import is allowed only from public api (index.ts)',
      [TESTING_PUBLIC_ERROR]: 'testing data should be imported from public api (testing.ts)',
    },
    schema: [{
      type: 'object',
      properties: {
        alias: {
          type: 'string',
        },
        testFiles: {
          type: 'array',
        }
      }
    }],
  },

  create(context) {
    const { alias = '', testFiles = [] } = context.options[0] || {}

    const allowedLayers = {
      'entities': 'entities',
      'features': 'features',
      'pages': 'pages',
      'widgets': 'widgets',
    }

    return {
      ImportDeclaration(node) {
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, '') : value

        if (isPathRelative(importTo)) return

        // [entities, article, model, types]
        const segments = importTo.split('/')
        const layer = segments[0]
        const slice = segments[1]
        if (!allowedLayers[layer]) return

        const isImportNotFromPublicApi = segments.length > 2
        // [entities, article, testing]
        const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => (
              fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`)
            )
          })
        }

        if (isTestingPublicApi) {
          const currentFilePath = context.getFilename()

          const isCurrentFileTesting = testFiles.some(pattern => micromatch.isMatch(currentFilePath, pattern))

          if (!isCurrentFileTesting) {
            context.report({node, messageId: TESTING_PUBLIC_ERROR})
          }
        }
      }
    }
  },
}
