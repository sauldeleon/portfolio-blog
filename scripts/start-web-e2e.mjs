import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const envFilePath = join(process.cwd(), 'apps/web/.env.e2e.local')

if (existsSync(envFilePath)) {
  for (const line of readFileSync(envFilePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
}

const isWin = process.platform === 'win32'
const child = spawn(isWin ? 'yarn.cmd' : 'yarn', ['start:web'], {
  stdio: 'inherit',
  env: process.env,
})
child.on('exit', (code) => process.exit(code ?? 0))
