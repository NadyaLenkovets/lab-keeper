import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function decodeEnvBuffer(buf: Buffer): string {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString('utf16le')
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return buf.swap16().toString('utf16le')
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8')
  }
  return buf.toString('utf8')
}

/** Подхватывает .env из корня репозитория (tsx --env-file на Windows иногда молчит). */
export function loadRootEnv(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const envPath = path.join(root, '.env')
  if (!existsSync(envPath)) {
    console.log(`[env] no file at ${envPath}`)
    return
  }
  try {
    const text = decodeEnvBuffer(readFileSync(envPath))
    let loaded = 0
    const names: string[] = []
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.replace(/^\uFEFF/, '').trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 1) continue
      const key = line.slice(0, eq).trim()
      let value = line.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
      loaded += 1
      names.push(key)
    }
    console.log(`[env] loaded ${loaded} keys: ${names.join(', ')}`)
  } catch (err) {
    console.warn('[env] failed to read .env', err instanceof Error ? err.message : err)
  }
}

