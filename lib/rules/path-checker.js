/**
 * @fileoverview feature sliced relative path checker
 * @author ylsv
 */
"use strict"

const path = require('path')
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [{
      type: 'object',
      properties: {
        alias: {
          type: 'string',
        }
      }
    }], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    const alias = context.options[0]?.alias || ''
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        // example @/app/entities/Article
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, '') : value

        // example C:\Users\yulisov\Projects\test\ulbitv-project\src\entities\Article
        const fromFilename = context.getFilename()

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report(node, 'import inside one slice should be relative')
        }
      }
    }
  },
}

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../')
}

const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
}

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) return false

  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0] // entities
  const toSlice = toArray[1] // Article

  if (!toLayer || !toSlice || !layers[toLayer]) return false

  // example C:\Users\yulisov\Projects\test\ulbitv-project\src\entities\Article
  const normalizedPath = path.toNamespacedPath(from)
  const projectFrom = normalizedPath.split('src')[1] // \entities\Article
  const fromArray = projectFrom.split('\\')
  const fromLayer = fromArray[1]
  const fromSlice = fromArray[2]

  if (!fromLayer || !fromSlice || !layers[fromLayer]) return false

  return toSlice === fromSlice && toLayer === fromLayer
}
