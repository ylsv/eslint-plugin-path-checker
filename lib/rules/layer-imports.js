/**
 * @fileoverview checks if imports are made correctly in accordance with FSD rules (upper-lower layers)
 * @author ylsv
 */
"use strict"
const path = require('path')
const { isPathRelative } = require('../helpers')
const micromatch = require('micromatch')
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "checks if imports are made correctly in accordance with FSD rules (upper-lower layers)",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreImportPatterns: {
            type: 'array',
          }
        },
      }
    ],
  },

  create(context) {
    const layers = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entities'],
      'pages': ['widgets', 'features', 'shared', 'entities'],
      'widgets': ['features', 'shared', 'entities'],
      'features': ['shared', 'entities'],
      'entities': ['shared', 'entities'],
      'shared': ['shared'],
    }

    const availableLayers = {
      'app': 'app',
      'entities': 'entities',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }


    const { alias = '', ignoreImportPatterns = [] } = context.options[0] || {}

    const getCurrentFileLayer = () => {
      const currentFilePath = context.getFilename()

      const normalizedPath = path.toNamespacedPath(currentFilePath)
      const projectPath = normalizedPath && normalizedPath.split('src')[1]
      const segments = projectPath && projectPath.split('\\')

      return segments && segments[1]
    }

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, '') : value
      const segments = importPath && importPath.split('/')

      return segments && segments[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const currentFileLayer = getCurrentFileLayer()
        const importLayer = getImportLayer(importPath)

        if (isPathRelative(importPath)) {
          return
        }

        if (!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return
        }

        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        })

        if (isIgnored) {
          return
        }

        if (!layers[currentFileLayer].includes(importLayer)) {
          context.report(node, 'only below layers can be imported (shared, entities, features, widgets, pages, app)')
        }
      }
    }
  },
}
