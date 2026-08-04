/**
 * Lints the `:::: <flavor>-api` containers across the guide.
 *
 * An unbalanced container fails silently: markdown-it renders the stray marker as text and
 * the page still builds. Headings are rejected inside a block because VitePress builds the
 * page outline from the DOM, so a hidden heading scrolls nowhere for the other flavor.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { API_FLAVORS } from '../.vitepress/apiFlavors.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsDir = path.resolve(__dirname, '..')

const IGNORED_DIRS = new Set(['node_modules', '.vitepress', 'public'])

/** Generated output. `api/index.md` is hand written, so `api` itself stays in scope. */
const IGNORED_PATHS = new Set(['api/composable', 'api/components'])

const FLAVORS = API_FLAVORS.map(flavor => flavor.value).join('|')

// markdown-it-container opens at three colons and closes on a run at least as long, so the
// opening length has to be carried to the close rather than assumed.
const OPEN = new RegExp(`^(:{3,})\\s*(?:${FLAVORS})-api(?:\\s+\\S.*)?$`)
const CLOSE = /^(:{3,})\s*$/
// The marker run is greedy and the tail cannot start with a fence character, so there is
// only one way to split a fence line.
const FENCE = /^\s*(`+|~+)([^`~].*)?$/

function* markdownFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) {
      continue
    }
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!IGNORED_PATHS.has(path.relative(docsDir, full))) {
        yield* markdownFiles(full)
      }
    }
    else if (entry.name.endsWith('.md')) {
      yield full
    }
  }
}

const problems: string[] = []

for (const file of markdownFiles(docsDir)) {
  const relative = path.relative(docsDir, file)
  const lines = fs.readFileSync(file, 'utf-8').split('\n')

  let openedAt: number | null = null
  let openLength = 0
  let fence: { char: string, length: number } | null = null

  lines.forEach((line, index) => {
    const fenceMatch = FENCE.exec(line)
    if (fenceMatch != null && fenceMatch[1]!.length >= 3) {
      const marker = fenceMatch[1]!
      if (fence == null) {
        fence = { char: marker[0]!, length: marker.length }
      }
      else if (marker[0] === fence.char && marker.length >= fence.length && (fenceMatch[2] ?? '').trim() === '') {
        fence = null
      }
      return
    }
    if (fence != null) {
      return
    }

    const openMatch = OPEN.exec(line)
    if (openMatch != null) {
      const length = openMatch[1]!.length
      if (length < 4) {
        problems.push(`${relative}:${index + 1} opens a flavor block with ${length} colons; use four so it can wrap \`:::\` containers`)
      }
      if (openedAt != null) {
        problems.push(`${relative}:${index + 1} opens a flavor block while one from line ${openedAt} is still open`)
      }
      openedAt = index + 1
      openLength = length
      return
    }

    const closeMatch = CLOSE.exec(line)
    if (closeMatch != null) {
      const length = closeMatch[1]!.length
      if (openedAt == null) {
        if (length >= 4) {
          problems.push(`${relative}:${index + 1} closes a flavor block that was never opened`)
        }
        return
      }
      // A shorter run belongs to a nested `::: tip`, exactly as markdown-it resolves it.
      if (length >= openLength) {
        openedAt = null
      }
      return
    }

    if (openedAt != null && /^#{1,6}\s/.test(line)) {
      problems.push(`${relative}:${index + 1} puts a heading inside a flavor block; move it above the \`::::\``)
    }
  })

  if (openedAt != null) {
    problems.push(`${relative}:${openedAt} opens a flavor block that is never closed`)
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} API flavor problem(s):\n`)
  for (const problem of problems) {
    console.error(`  ${problem}`)
  }
  process.exitCode = 1
}
else {
  console.log('API flavor containers are balanced.')
}
