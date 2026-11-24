import React from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Check,
  Quote,
  FlaskConical,
  HelpCircle
} from 'lucide-react';
import { MathRenderer, isMathExpression } from './MathRenderer.js';

interface AiMessageRendererProps {
  content: string;
  isAi?: boolean;
}

export const AiMessageRenderer: React.FC<AiMessageRendererProps> = ({ content, isAi = true }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse inline styles: bold, math, italic, code
  const renderInlineText = (text: string) => {
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline LaTeX math $...$ or \( ... \)
      const mathMatch = remaining.match(/^(\$([^$]+)\$|\\\((.+?)\\\))/);
      if (mathMatch) {
        const mathExpr = mathMatch[2] || mathMatch[3];
        tokens.push(
          <MathRenderer key={key++} math={mathExpr} displayMode={false} />
        );
        remaining = remaining.slice(mathMatch[1].length);
        continue;
      }

      // Inline raw LaTeX fraction \frac{...}{...} even without dollar signs
      const fracMatch = remaining.match(/^([a-zA-Z0-9_'\^]+\s*=\s*\\frac\{[^{}]+\}\{[^{}]+\}|\\frac\{[^{}]+\}\{[^{}]+\})/);
      if (fracMatch) {
        tokens.push(
          <MathRenderer key={key++} math={fracMatch[1]} displayMode={false} />
        );
        remaining = remaining.slice(fracMatch[1].length);
        continue;
      }

      // Inline Bold **...**
      const boldMatch = remaining.match(/^(\*\*([^*]+)\*\*)/);
      if (boldMatch) {
        tokens.push(
          <strong key={key++} className="font-bold text-white">
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[1].length);
        continue;
      }

      // Inline Italic *...* or _..._
      const italicMatch = remaining.match(/^(\*([^*]+)\*|_([^_]+)_)/);
      if (italicMatch) {
        const val = italicMatch[2] || italicMatch[3];
        tokens.push(
          <em key={key++} className="italic text-indigo-200">
            {val}
          </em>
        );
        remaining = remaining.slice(italicMatch[1].length);
        continue;
      }

      // Inline Code `...`
      const codeMatch = remaining.match(/^(`([^`]+)`)/);
      if (codeMatch) {
        tokens.push(
          <code key={key++} className="mx-0.5 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-amber-300 border border-slate-700">
            {codeMatch[2]}
          </code>
        );
        remaining = remaining.slice(codeMatch[1].length);
        continue;
      }

      // Plain char
      const nextSpecial = remaining.search(/[\$\*`_]/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        tokens.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return tokens;
  };

  // Block parser
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let inMathBlock = false;
  let mathBlockLines: string[] = [];
  let blockIndex = 0;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ol') {
        blocks.push(
          <ol key={`list_${blockIndex++}`} className="my-2 space-y-1.5 pl-1">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-900/80 border border-indigo-700 text-[10px] font-bold text-indigo-300">
                  {i + 1}
                </span>
                <span className="flex-1 pt-0.5 leading-relaxed">{renderInlineText(item)}</span>
              </li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`list_${blockIndex++}`} className="my-2 space-y-1 pl-1">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span className="flex-1 leading-relaxed">{renderInlineText(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block delimiters
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeLines.join('\n');
        const currentIndex = blockIndex++;
        blocks.push(
          <div key={`code_${currentIndex}`} className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3 py-1.5 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1.5 font-mono uppercase text-indigo-400">
                <Code2 className="size-3.5" />
                {codeLang || 'STEM Code'}
              </span>
              <button
                onClick={() => handleCopy(codeText, currentIndex)}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="size-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span className="text-[10px]">Nusxa olish</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-slate-200">
              {codeText}
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeLines = [];
        codeLang = '';
      } else {
        flushList();
        inCodeBlock = true;
        codeLang = trimmed.replace('```', '').trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    // Multi-line math block delimiters $$ or \[
    if (trimmed === '$$' || trimmed === '\\[') {
      if (inMathBlock) {
        // End math block
        const mathContent = mathBlockLines.join('\n');
        blocks.push(
          <MathRenderer
            key={`mathblock_${blockIndex++}`}
            math={mathContent}
            displayMode={true}
          />
        );
        inMathBlock = false;
        mathBlockLines = [];
      } else {
        flushList();
        inMathBlock = true;
        mathBlockLines = [];
      }
      continue;
    }

    if (inMathBlock) {
      if (trimmed.endsWith('$$') || trimmed.endsWith('\\]')) {
        const remainingMath = trimmed.replace(/(\$\$|\\\])$/, '').trim();
        if (remainingMath) mathBlockLines.push(remainingMath);
        const mathContent = mathBlockLines.join('\n');
        blocks.push(
          <MathRenderer
            key={`mathblock_${blockIndex++}`}
            math={mathContent}
            displayMode={true}
          />
        );
        inMathBlock = false;
        mathBlockLines = [];
      } else {
        mathBlockLines.push(rawLine);
      }
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Display LaTeX Math block $$ ... $$ or \[ ... \] on single line
    if (
      (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) ||
      (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length > 4)
    ) {
      flushList();
      blocks.push(
        <MathRenderer
          key={`mathblock_${blockIndex++}`}
          math={trimmed}
          displayMode={true}
        />
      );
      continue;
    }

    // Standalone mathematical equation line with fractions or formulas
    if (
      !inCodeBlock &&
      (trimmed.startsWith('\\frac{') ||
        /^[a-zA-Z0-9_'\^()]+(\s*|\s*\(t\)\s*)=\s*.*\\frac\{/.test(trimmed) ||
        /^[a-zA-Z0-9_'\^()]+\s*=\s*\\sqrt\{/.test(trimmed) ||
        (isMathExpression(trimmed) && trimmed.includes('\\frac')))
    ) {
      flushList();
      blocks.push(
        <MathRenderer
          key={`mathblock_${blockIndex++}`}
          math={trimmed}
          displayMode={true}
        />
      );
      continue;
    }

    // Headings (H1, H2, H3, H4) -> Clean visual headers without raw ###
    if (trimmed.startsWith('#')) {
      flushList();
      const match = trimmed.match(/^(#{1,4})\s*(.+)$/);
      if (match) {
        const level = match[1].length;
        const titleText = match[2];

        if (level === 1 || level === 2) {
          blocks.push(
            <div key={`h_${blockIndex++}`} className="mt-4 mb-2 border-b border-slate-700/80 pb-1.5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                <Sparkles className="size-4 text-indigo-400" />
                {renderInlineText(titleText)}
              </h3>
            </div>
          );
        } else {
          blocks.push(
            <h4 key={`h_${blockIndex++}`} className="mt-3 mb-1 text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <BookOpen className="size-3 text-indigo-400" />
              {renderInlineText(titleText)}
            </h4>
          );
        }
        continue;
      }
    }

    // Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteContent = trimmed.replace(/^>\s*/, '');
      blocks.push(
        <div key={`quote_${blockIndex++}`} className="my-2.5 flex items-start gap-2.5 rounded-xl border-l-4 border-indigo-500 bg-slate-800/70 p-3 text-xs text-slate-200 italic shadow-xs">
          <Quote className="size-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">{renderInlineText(quoteContent)}</div>
        </div>
      );
      continue;
    }

    // Definition / Key Concept Callouts (English & Uzbek)
    const lowerTrimmed = trimmed.toLowerCase();
    if (
      lowerTrimmed.startsWith('definition:') || 
      lowerTrimmed.startsWith('key concept:') || 
      lowerTrimmed.startsWith('core concept:') ||
      lowerTrimmed.startsWith("ta'rif:") ||
      lowerTrimmed.startsWith('taʼrif:') ||
      lowerTrimmed.startsWith('asosiy tushuncha:') ||
      lowerTrimmed.startsWith('tushuncha:')
    ) {
      flushList();
      const parts = trimmed.split(':');
      const label = parts[0];
      const rest = parts.slice(1).join(':').trim();
      blocks.push(
        <div key={`def_${blockIndex++}`} className="my-2.5 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Lightbulb className="size-3.5" />
            <span>{label}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {renderInlineText(rest)}
          </p>
        </div>
      );
      continue;
    }

    // Experiment / Laboratory challenge callout
    if (
      lowerTrimmed.startsWith('tinker challenge:') || 
      lowerTrimmed.startsWith('experiment:') ||
      lowerTrimmed.startsWith('tajriba:') ||
      lowerTrimmed.startsWith('laboratoriya topshirig‘i:') ||
      lowerTrimmed.startsWith('amaliy topshiriq:')
    ) {
      flushList();
      const parts = trimmed.split(':');
      const label = parts[0];
      const rest = parts.slice(1).join(':').trim();
      blocks.push(
        <div key={`exp_${blockIndex++}`} className="my-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <FlaskConical className="size-3.5" />
            <span>{label}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {renderInlineText(rest)}
          </p>
        </div>
      );
      continue;
    }

    // Warning / Note Callouts (English & Uzbek)
    if (
      lowerTrimmed.startsWith('warning:') || 
      lowerTrimmed.startsWith('important:') || 
      lowerTrimmed.startsWith('note:') ||
      lowerTrimmed.startsWith('muhim:') ||
      lowerTrimmed.startsWith('eslatma:') ||
      lowerTrimmed.startsWith('diqqat:')
    ) {
      flushList();
      const parts = trimmed.split(':');
      const label = parts[0];
      const rest = parts.slice(1).join(':').trim();
      blocks.push(
        <div key={`warn_${blockIndex++}`} className="my-2.5 rounded-xl border border-rose-500/40 bg-rose-950/20 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1">
            <AlertTriangle className="size-3.5" />
            <span>{label}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {renderInlineText(rest)}
          </p>
        </div>
      );
      continue;
    }

    // Ordered list item (e.g. "1. Observe the velocity")
    const olMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Unordered list item (e.g. "- Key variable" or "* Mass" or "• Item")
    const ulMatch = trimmed.match(/^[\-\*•]\s*(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Standard Paragraph
    flushList();
    blocks.push(
      <p key={`p_${blockIndex++}`} className="my-1.5 text-xs leading-relaxed text-slate-200">
        {renderInlineText(trimmed)}
      </p>
    );
  }

  if (inMathBlock && mathBlockLines.length > 0) {
    blocks.push(
      <MathRenderer
        key={`mathblock_${blockIndex++}`}
        math={mathBlockLines.join('\n')}
        displayMode={true}
      />
    );
  }

  flushList();

  return (
    <div className="space-y-1 text-slate-200">
      {blocks}
    </div>
  );
};
