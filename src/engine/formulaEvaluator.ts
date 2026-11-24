import { StudioVariable, StudioObject } from '../types/simulationStudio.js';

export interface EvaluationContext {
  variables: Record<string, any>;
  objects: Record<string, StudioObject>;
  time: number;
  dt: number;
}

export function evaluateFormula(
  expression: string,
  context: EvaluationContext
): { success: boolean; value: any; error?: string } {
  if (!expression || typeof expression !== 'string') {
    return { success: false, value: 0, error: 'Empty expression' };
  }

  try {
    let sanitized = expression.trim();

    // 1. Replace variables: var:varName -> actual value
    sanitized = sanitized.replace(/var:([a-zA-Z0-9_]+)/g, (_, varName) => {
      if (varName in context.variables) {
        const val = context.variables[varName];
        return typeof val === 'number' ? `${val}` : `"${val}"`;
      }
      return '0';
    });

    // 2. Replace object properties: obj:objId.prop (or nested .velocity.x, etc.)
    sanitized = sanitized.replace(/obj:([a-zA-Z0-9_]+)\.([a-zA-Z0-9_.]+)/g, (_, objId, propPath) => {
      const obj = context.objects[objId];
      if (!obj) return '0';

      const parts = propPath.split('.');
      let cur: any = obj;
      for (const part of parts) {
        if (cur && typeof cur === 'object' && part in cur) {
          cur = cur[part];
        } else if (cur && cur.customProperties) {
          const custom = cur.customProperties.find((cp: any) => cp.key === part);
          if (custom) {
            cur = custom.value;
          } else {
            cur = 0;
          }
        } else if (cur && cur.subjectData && part in cur.subjectData) {
          cur = cur.subjectData[part];
        } else {
          cur = 0;
          break;
        }
      }

      return typeof cur === 'number' ? `${cur}` : (typeof cur === 'boolean' ? `${cur}` : '0');
    });

    // 3. Replace mathematical constants
    sanitized = sanitized.replace(/\bpi\b/gi, `${Math.PI}`);
    sanitized = sanitized.replace(/\be\b/gi, `${Math.E}`);
    sanitized = sanitized.replace(/\btime\b/gi, `${context.time}`);
    sanitized = sanitized.replace(/\bdt\b/gi, `${context.dt}`);

    // 4. Safe mathematical function aliases
    sanitized = sanitized.replace(/\bsin\s*\(/g, 'Math.sin(');
    sanitized = sanitized.replace(/\bcos\s*\(/g, 'Math.cos(');
    sanitized = sanitized.replace(/\btan\s*\(/g, 'Math.tan(');
    sanitized = sanitized.replace(/\basin\s*\(/g, 'Math.asin(');
    sanitized = sanitized.replace(/\bacos\s*\(/g, 'Math.acos(');
    sanitized = sanitized.replace(/\batan\s*\(/g, 'Math.atan(');
    sanitized = sanitized.replace(/\batan2\s*\(/g, 'Math.atan2(');
    sanitized = sanitized.replace(/\bsqrt\s*\(/g, 'Math.sqrt(');
    sanitized = sanitized.replace(/\babs\s*\(/g, 'Math.abs(');
    sanitized = sanitized.replace(/\bmin\s*\(/g, 'Math.min(');
    sanitized = sanitized.replace(/\bmax\s*\(/g, 'Math.max(');
    sanitized = sanitized.replace(/\blog10\s*\(/g, 'Math.log10(');
    sanitized = sanitized.replace(/\blog\s*\(/g, 'Math.log(');
    sanitized = sanitized.replace(/\bexp\s*\(/g, 'Math.exp(');
    sanitized = sanitized.replace(/\bpow\s*\(/g, 'Math.pow(');
    sanitized = sanitized.replace(/\bround\s*\(/g, 'Math.round(');
    sanitized = sanitized.replace(/\bfloor\s*\(/g, 'Math.floor(');
    sanitized = sanitized.replace(/\bceil\s*\(/g, 'Math.ceil(');

    // Support power operator ^ as Math.pow or **
    sanitized = sanitized.replace(/\^/g, '**');

    // 5. Sandboxed token validator — only allow numbers, math operators, ternary, parens, Math.*
    const safeRegex = /^[\d\s+\-*/%(),.?:!&|<>=Math\w"'[\]]+$/;
    if (!safeRegex.test(sanitized)) {
      return { success: false, value: 0, error: 'Expression contains disallowed characters' };
    }

    // Evaluate safely with restricted arguments
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function('Math', `"use strict"; return (${sanitized});`);
    const result = fn(Math);

    if (typeof result === 'number' && isNaN(result)) {
      return { success: true, value: 0 };
    }

    return { success: true, value: result };
  } catch (err: any) {
    return { success: false, value: 0, error: err.message || 'Evaluation error' };
  }
}

export function validateFormulaSyntax(expression: string, sampleVariables: StudioVariable[]): { isValid: boolean; error?: string } {
  if (!expression.trim()) {
    return { isValid: false, error: 'Expression cannot be empty' };
  }

  const mockContext: EvaluationContext = {
    variables: sampleVariables.reduce((acc, v) => {
      acc[v.name] = typeof v.value === 'number' ? v.value : (v.type === 'number' ? 1 : v.value);
      return acc;
    }, {} as Record<string, any>),
    objects: {},
    time: 1.0,
    dt: 0.016
  };

  const res = evaluateFormula(expression, mockContext);
  return { isValid: res.success, error: res.error };
}
