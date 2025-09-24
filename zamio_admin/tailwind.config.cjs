const fs = require('fs')
const path = require('path')

const presetCandidates = [
  path.resolve(__dirname, '../packages/ui-theme/tailwind.preset.cjs'),
  path.resolve(__dirname, '../../packages/ui-theme/tailwind.preset.cjs'),
  path.resolve(__dirname, './tailwind.preset.cjs'),
]

let sharedTheme
for (const candidate of presetCandidates) {
  if (fs.existsSync(candidate)) {
    sharedTheme = require(candidate)
    break
  }
}

if (!sharedTheme) {
  throw new Error('Unable to locate shared Tailwind preset. Looked in: ' + presetCandidates.join(', '))
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedTheme],
}
