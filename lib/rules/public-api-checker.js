/**
 * @fileoverview checks if imports from external modules are made from public api (index.ts)
 * @author ylsv
 */
"use strict"

const { isPathRelative } = require('../helpers')
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null,
    docs: {
      description: "checks if imports from external modules are made from public api (index.ts)",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [{
      type: 'object',
      properties: {
        alias: {
          type: 'string',
        }
      }
    }],
  },

  create(context) {
    const alias = context.options[0]?.alias || ''

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
        if (!allowedLayers[layer]) return

        const isImportNotFromPublicApi = segments.length > 2

        if (isImportNotFromPublicApi) {
          context.report(node, 'absolute import is allowed only from public api (index.ts)')
        }
      }
    }
  },
}
