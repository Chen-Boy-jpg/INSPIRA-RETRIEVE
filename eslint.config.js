import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // --- 在這裡加入 rules 區塊 ---
    rules: {
      // 將「未使用變數」的錯誤改為警告 (warn)，或直接設為 'off' 關閉
      'no-unused-vars': 'warn', 
      
      // 如果你不希望 React 17+ 檔案頂部強制匯入 React，可以加上這行
      'react/react-in-jsx-scope': 'off',

      // 針對 Vite HMR 的組件導出規則，有時會比較煩人，可以改為警告
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
])