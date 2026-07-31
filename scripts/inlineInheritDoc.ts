/**
 * This build step inlines docblocks specified with `@inheritDoc` during build.
 *
 * E.g. in a docblock like this:
 * ```js
 * /** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} *\/
 * ```
 *
 * The annotation will be replaced with the referenced docblock content.
 */

import type { DocComment, DocExcerpt, DocNode, TextRange } from '@microsoft/tsdoc'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  Extractor,
  ExtractorConfig,
} from '@microsoft/api-extractor'
import { ApiDocumentedItem, ApiModel } from '@microsoft/api-extractor-model'
import { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const composableDir = path.join(rootDir, 'packages/vue-apollo-composable')
const distDir = path.join(composableDir, 'dist')
const docsDir = path.join(rootDir, 'packages/docs')

export async function inlineInheritDoc() {
  console.log('Processing {@inheritDoc} comments in .d.ts files...')

  const model = await loadApiModel()
  await processFiles(model)
}

function getCommentFor(
  canonicalReference: string,
  model: ApiModel,
): string {
  try {
    const result = model.resolveDeclarationReference(
      DeclarationReference.parse(canonicalReference),
      undefined,
    )

    if (!result.resolvedApiItem) {
      console.warn(`Could not resolve canonical reference "${canonicalReference}"`)
      if (result.errorMessage) {
        console.warn(`  Error: ${result.errorMessage}`)
      }
      return ''
    }

    if (result.resolvedApiItem instanceof ApiDocumentedItem) {
      if (!result.resolvedApiItem.tsdocComment)
        return ''
      return renderDocComment(result.resolvedApiItem.tsdocComment)
    }
    else {
      console.warn(`"${canonicalReference}" is not documented`)
      return ''
    }
  }
  catch (e) {
    console.warn(`Error resolving "${canonicalReference}": ${e}`)
    return ''
  }
}

async function loadApiModel(): Promise<ApiModel> {
  fs.mkdirSync(docsDir, { recursive: true })

  const apiModel = new ApiModel()

  // Generate and load @vue/apollo-composable model
  const vueApolloModelFile = path.join(docsDir, 'apollo-composable.api.json')
  await generateApiModel(vueApolloModelFile, path.join(rootDir, 'api-extractor.json'))
  apiModel.loadPackage(vueApolloModelFile)

  return apiModel
}

async function generateApiModel(modelFile: string, baseConfigPath: string): Promise<void> {
  const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf-8'))

  // Create temp config in the composable package directory so API Extractor uses correct package.json
  const tempConfigPath = path.join(composableDir, 'api-extractor.temp.json')

  // Adjust paths to be relative to composable package
  const tempConfig = {
    ...baseConfig,
    projectFolder: '.',
    mainEntryPointFilePath: '<projectFolder>/dist/index.d.ts',
    compiler: {
      ...baseConfig.compiler,
      tsconfigFilePath: '<projectFolder>/tsconfig.lib.json',
    },
    apiReport: { enabled: false },
    docModel: {
      enabled: true,
      apiJsonFilePath: path.relative(composableDir, modelFile),
      includeForgottenExports: true,
    },
    messages: {
      extractorMessageReporting: { default: { logLevel: 'none' } },
      compilerMessageReporting: { default: { logLevel: 'none' } },
      tsdocMessageReporting: { default: { logLevel: 'none' } },
    },
  }

  fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2))

  // Save current directory and change to composable package
  const originalCwd = process.cwd()
  process.chdir(composableDir)

  try {
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(tempConfigPath)
    Extractor.invoke(extractorConfig, { localBuild: true, showVerboseMessages: false })
  }
  finally {
    process.chdir(originalCwd)
    fs.rmSync(tempConfigPath, { force: true })
  }
}

async function processFiles(model: ApiModel) {
  // Anchored to the line so the indentation and comment shape are known: the inlined lines
  // have to be re-prefixed, or the JSDoc block ends up ragged.
  const inheritDocRegex = /^([ \t]*)(\/\*\*|\*)[ \t]*\{\s*@inheritDoc\s+(\S+)\s*\}[ \t]*(\*\/)?/gm

  // Process all .d.ts files in dist
  const dtsFiles = findDtsFiles(distDir)
  let totalReplacements = 0

  for (const filePath of dtsFiles) {
    let content = fs.readFileSync(filePath, 'utf-8')
    let fileReplacements = 0

    content = content.replace(
      inheritDocRegex,
      (match, indent: string, opener: string, canonicalReference: string, closer: string | undefined) => {
        const replacement = getCommentFor(canonicalReference, model)
        if (!replacement) {
          return match
        }

        fileReplacements++

        const isBlockOpener = opener === '/**'
        const linePrefix = isBlockOpener ? `${indent} *` : `${indent}*`
        const body = replacement
          .split('\n')
          .map(line => (line ? `${linePrefix} ${line}` : linePrefix))
          .join('\n')

        if (!isBlockOpener) {
          return body
        }

        return closer
          ? `${indent}/**\n${body}\n${indent} */`
          : `${indent}/**\n${body}`
      },
    )

    if (fileReplacements > 0) {
      fs.writeFileSync(filePath, content)
      console.log(`  Updated: ${path.relative(rootDir, filePath)} (${fileReplacements} replacements)`)
      totalReplacements += fileReplacements
    }
  }

  console.log(`Total: ${totalReplacements} @inheritDoc replacements`)
}

function findDtsFiles(dir: string): string[] {
  const files: string[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findDtsFiles(fullPath))
    }
    else if (entry.name.endsWith('.d.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

function renderDocComment(node: DocComment): string {
  let commentRange: TextRange | undefined

  function iterate(node: undefined | DocNode | readonly DocNode[]) {
    if (!node)
      return
    if (commentRange)
      return
    if ('forEach' in node) {
      node.forEach(iterate)
      return
    }
    if (node.kind === 'Excerpt') {
      const excerptNode = node as DocExcerpt
      commentRange = excerptNode.content.parserContext.commentRange
    }
    node.getChildNodes().forEach(iterate)
  }

  iterate(node)

  if (!commentRange) {
    return ''
  }

  const text = commentRange.toString()
  return text
    .slice(2, -2) // Remove /** and */
    .split('\n')
    .map(line =>
      line
        .replace(/^\s*\* ?/, '') // Remove leading ` *` or ` * `
        .replace(/(?<! ) $/, ''), // Remove singular trailing space
    )
    .join('\n')
    .trim()
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  inlineInheritDoc().catch(console.error)
}
