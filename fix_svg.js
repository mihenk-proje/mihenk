const fs = require('fs')
const path = './src/components/DogrulamaSonucu.tsx'
let content = fs.readFileSync(path, 'utf8')

content = content.replace(/style={{[^}]+}}/g, (match) => {
  if (match.includes('strokeDashoffset')) {
     return "className=\"motion-reduce:transition-none\" " + match
  }
  return match
})

fs.writeFileSync(path, content)
