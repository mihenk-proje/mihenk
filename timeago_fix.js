const fs = require('fs')
const path = './src/components/GonderiKarti.tsx'
let content = fs.readFileSync(path, 'utf8')

content = content.replace(/function timeAgo.*?return 'Şimdi'\n}/s, 
`function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days >= 7) {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }
  if (days > 0) return \`\${days} g\`
  if (hours > 0) return \`\${hours} sa\`
  if (minutes > 0) return \`\${minutes} dk\`
  return \`\${Math.max(1, seconds)} sn\`
}`)

fs.writeFileSync(path, content)
