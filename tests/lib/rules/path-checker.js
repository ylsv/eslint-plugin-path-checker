/**
 * @fileoverview feature sliced relative path checker
 * @author ylsv
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module' }
})
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: 'C:\\Users\\yulisov\\Projects\\test\\ulbitv-project\\src\\entities\\Article',
      code: "import {addCommentFormActions, addCommentFormReducer} from '../../model/slice/addCommentFormSlice'",
      errors: [],
    },
  ],

  invalid: [
    {
      filename: 'C:\\Users\\yulisov\\Projects\\test\\ulbitv-project\\src\\entities\\Article',
      code: "import {addCommentFormActions, addCommentFormReducer} from '@/entities/Article/model/slice/addCommentFormSlice'",
      errors: [{ message: "import inside one slice should be relative" }],
      options: [{alias: '@'}]
    },
    {
      filename: 'C:\\Users\\yulisov\\Projects\\test\\ulbitv-project\\src\\entities\\Article',
      code: "import {addCommentFormActions, addCommentFormReducer} from 'entities/Article/model/slice/addCommentFormSlice'",
      errors: [{ message: "import inside one slice should be relative" }],
    },
  ],
})
