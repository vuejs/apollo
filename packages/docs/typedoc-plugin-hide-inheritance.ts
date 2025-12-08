/**
 * TypeDoc plugin to hide inheritance-related sections from markdown output.
 * Removes "Extends", "Inherited from", and "Overrides" sections.
 */

import type { Application } from 'typedoc'

export function load(app: Application) {
  app.renderer.on('endPage', (event) => {
    if (!event.contents)
      return

    let content = event.contents

    // Remove "## Extends" section (heading + content until next ## heading)
    content = content.replace(/^## Extends\n\n[\s\S]*?(?=\n## |\n$|$)/gm, '')

    // Remove "#### Inherited from" blocks
    content = content.replace(/^#### Inherited from\n\n[^\n]+\n\n?/gm, '')

    // Remove "#### Overrides" blocks
    content = content.replace(/^#### Overrides\n\n[^\n]+\n\n?/gm, '')

    // Clean up multiple consecutive blank lines
    content = content.replace(/\n{3,}/g, '\n\n')

    event.contents = content
  })
}
