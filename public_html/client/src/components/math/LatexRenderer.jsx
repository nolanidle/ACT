import React from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

/**
 * KaTeX wrapper component with error boundary.
 *
 * @param {string} latex - the LaTeX string to render
 * @param {boolean} block - if true, renders as block (display) math
 * @param {string} fallback - text to show if rendering fails (defaults to raw latex)
 * @param {string} className - additional classes for the wrapper
 */
class LatexErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <span className={`font-mono text-amber-300 text-sm ${this.props.className || ''}`}>
          {this.props.fallback || this.props.latex}
        </span>
      )
    }
    return this.props.children
  }
}

export default function LatexRenderer({
  latex = '',
  block = false,
  fallback,
  className = '',
}) {
  if (!latex) return null

  // Strip surrounding $$ or $ delimiters if accidentally included
  const cleaned = latex
    .replace(/^\$\$|\$\$$/g, '')
    .replace(/^\$|\$$/g, '')
    .trim()

  return (
    <LatexErrorBoundary latex={cleaned} fallback={fallback} className={className}>
      <span className={`katex-wrapper ${block ? 'block' : 'inline'} ${className}`}>
        {block ? (
          <BlockMath math={cleaned} />
        ) : (
          <InlineMath math={cleaned} />
        )}
      </span>
    </LatexErrorBoundary>
  )
}
