import React from 'react';
import katex from 'katex';
import { Copy, Check, Calculator } from 'lucide-react';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
  showCopy?: boolean;
}

/**
 * Clean and normalize LaTeX strings before passing to KaTeX
 */
export function cleanLatex(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // Strip wrapping $$ ... $$
  if (str.startsWith('$$') && str.endsWith('$$') && str.length >= 4) {
    str = str.slice(2, -2).trim();
  }
  // Strip wrapping \[ ... \]
  else if (str.startsWith('\\[') && str.endsWith('\\]') && str.length >= 4) {
    str = str.slice(2, -2).trim();
  }
  // Strip wrapping $ ... $
  else if (str.startsWith('$') && str.endsWith('$') && str.length >= 2) {
    str = str.slice(1, -1).trim();
  }
  // Strip wrapping \( ... \)
  else if (str.startsWith('\\(') && str.endsWith('\\)') && str.length >= 4) {
    str = str.slice(2, -2).trim();
  }

  // Common Unicode normalizations
  str = str
    .replace(/[−–—]/g, '-') // Normalize minus signs
    .replace(/×/g, '\\times ') // Unicode multiplication
    .replace(/÷/g, '\\div ') // Unicode division
    .replace(/·/g, '\\cdot ') // Middle dot
    .replace(/°/g, '^\\circ ') // Degree symbol
    .replace(/≠/g, '\\ne ') // Not equal
    .replace(/≤/g, '\\le ') // Less than or equal
    .replace(/≥/g, '\\ge ') // Greater than or equal
    .replace(/≈/g, '\\approx ') // Approximately equal
    .replace(/±/g, '\\pm ') // Plus minus
    .replace(/Δ/g, '\\Delta ') // Delta
    .replace(/π/g, '\\pi ') // Pi
    .replace(/θ/g, '\\theta ') // Theta
    .replace(/λ/g, '\\lambda ') // Lambda
    .replace(/μ/g, '\\mu ') // Micro / Mu
    .replace(/ρ/g, '\\rho ') // Rho
    .replace(/ω/g, '\\omega ') // Omega
    .replace(/Ω/g, '\\Omega '); // Ohm / Omega

  return str.trim();
}

/**
 * Detects if a string is or contains a mathematical formula
 */
export function isMathExpression(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();

  // Explicit LaTeX delimiters
  if (
    (trimmed.startsWith('$$') && trimmed.endsWith('$$')) ||
    (trimmed.startsWith('\\[') && trimmed.endsWith('\\]')) ||
    (trimmed.startsWith('$') && trimmed.endsWith('$')) ||
    (trimmed.startsWith('\\(') && trimmed.endsWith('\\)'))
  ) {
    return true;
  }

  // Contains characteristic LaTeX commands
  if (
    /\\(frac|sqrt|cdot|times|alpha|beta|gamma|theta|delta|Delta|pi|sigma|sum|int|lim|vec|hat|partial|approx|le|ge|pm|infty)/.test(
      trimmed
    )
  ) {
    return true;
  }

  // Formula patterns like "a = F / m" or "E = mc^2"
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.*[\/\*\^].*$/.test(trimmed)) {
    return true;
  }

  return false;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = false,
  className = '',
  showCopy = true,
}) => {
  const [copied, setCopied] = React.useState(false);
  const normalized = React.useMemo(() => cleanLatex(math), [math]);

  const html = React.useMemo(() => {
    try {
      return katex.renderToString(normalized, {
        displayMode,
        throwOnError: false,
        errorColor: '#f87171',
        trust: false,
        strict: false,
      });
    } catch (e) {
      console.warn('KaTeX rendering error for:', normalized, e);
      return null;
    }
  }, [normalized, displayMode]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(normalized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!html) {
    // Graceful fallback to formatted text if KaTeX completely fails
    return (
      <span className={`font-mono text-indigo-300 ${className}`}>
        {normalized}
      </span>
    );
  }

  if (displayMode) {
    return (
      <div
        className={`group relative my-3 flex flex-col items-center justify-center rounded-xl border border-indigo-800/60 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 p-4 shadow-md transition-all hover:border-indigo-600/70 ${className}`}
      >
        <div className="flex w-full items-center justify-between border-b border-indigo-900/40 pb-2 mb-3 text-[11px] text-indigo-300">
          <div className="flex items-center gap-2">
            <Calculator className="size-3.5 text-indigo-400" />
            <span className="font-semibold tracking-wide">Matematik Formula</span>
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              title="Formulani nusxalash (LaTeX)"
              className="flex items-center gap-1 rounded bg-indigo-900/50 px-2 py-0.5 text-indigo-300 hover:bg-indigo-800 hover:text-white transition"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span className="text-[10px]">LaTeX nusxalash</span>
                </>
              )}
            </button>
          )}
        </div>

        <div
          className="w-full overflow-x-auto overflow-y-hidden py-2 text-center text-indigo-100 selection:bg-indigo-500/30"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // Inline mode
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-950/70 border border-indigo-700/50 text-indigo-200 align-middle shadow-xs hover:border-indigo-500/60 transition-colors ${className}`}
    >
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  );
};
