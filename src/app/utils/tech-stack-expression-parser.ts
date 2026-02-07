// Tech Stack Expression Parser and Evaluator
// Supports: AND, OR, NOT operators with parentheses for precedence
// Uses EXACT MATCHING for tech stack terms (case-insensitive)
// Examples:
//   "Python AND Django"    - matches jobs with both "Python" and "Django"
//   "Python OR Ruby"       - matches jobs with "Python" or "Ruby"
//   "Python NOT Django"    - matches jobs with "Python" but not "Django"
//   "(Python OR Ruby) AND (React OR Angular)"
//   "NOT Java"
//   '"Machine Learning" AND Python'  - quotes for multi-word terms
//   "C AND NOT Py"         - matches "C" (not "React"), excludes "Py" (not "Python")

export interface TechStackExpression {
  evaluate(techStack: string[]): boolean;
}

export interface ParseResult {
  expression: TechStackExpression | null;
  isValid: boolean;
  errorMessage?: string;
}

class TermExpression implements TechStackExpression {
  constructor(private term: string) {}
  
  evaluate(techStack: string[]): boolean {
    const normalizedTerm = this.term.toLowerCase().trim();
    return techStack.some(tech => tech?.toLowerCase().trim() === normalizedTerm);
  }
}

class NotExpression implements TechStackExpression {
  constructor(private expression: TechStackExpression) {}
  
  evaluate(techStack: string[]): boolean {
    return !this.expression.evaluate(techStack);
  }
}

class AndExpression implements TechStackExpression {
  constructor(
    private left: TechStackExpression,
    private right: TechStackExpression
  ) {}
  
  evaluate(techStack: string[]): boolean {
    return this.left.evaluate(techStack) && this.right.evaluate(techStack);
  }
}

class OrExpression implements TechStackExpression {
  constructor(
    private left: TechStackExpression,
    private right: TechStackExpression
  ) {}
  
  evaluate(techStack: string[]): boolean {
    return this.left.evaluate(techStack) || this.right.evaluate(techStack);
  }
}

export class TechStackExpressionParser {
  private tokens: string[] = [];
  private currentIndex: number = 0;

  /**
   * Parses a tech stack filter expression into an executable AST
   * @param expression - The filter expression (e.g., "Python AND Django")
   * @returns ParseResult with expression, validation status, and error message
   */
  parse(expression: string): ParseResult {
    if (!expression || expression.trim() === '') {
      return {
        expression: null,
        isValid: true
      };
    }

    this.tokens = this.tokenize(expression);
    this.currentIndex = 0;

    try {
      const result = this.parseOrExpression();
      if (this.currentIndex < this.tokens.length) {
        throw new Error('Unexpected tokens after parsing');
      }
      return {
        expression: result,
        isValid: true
      };
    } catch (error) {
      // Return error state without logging to console
      const errorMessage = error instanceof Error ? error.message : 'Invalid expression';
      return {
        expression: new TermExpression(expression), // Fallback to simple search
        isValid: false,
        errorMessage
      };
    }
  }

  /**
   * Tokenizes the input expression, handling quotes for multi-word terms
   */
  private tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let currentToken = '';
    let inQuotes = false;

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (inQuotes) {
        currentToken += char;
        continue;
      }

      if (char === '(' || char === ')') {
        if (currentToken.trim()) {
          tokens.push(currentToken.trim());
          currentToken = '';
        }
        tokens.push(char);
      } else if (char === ' ' || char === '\t') {
        if (currentToken.trim()) {
          tokens.push(currentToken.trim());
          currentToken = '';
        }
      } else {
        currentToken += char;
      }
    }

    if (currentToken.trim()) {
      tokens.push(currentToken.trim());
    }

    return tokens;
  }

  private currentToken(): string | null {
    return this.currentIndex < this.tokens.length
      ? this.tokens[this.currentIndex]
      : null;
  }

  private consumeToken(): void {
    this.currentIndex++;
  }

  private isOperator(token: string | null, operator: string): boolean {
    return token?.toUpperCase() === operator.toUpperCase();
  }

  // OR has lowest precedence
  private parseOrExpression(): TechStackExpression {
    let left = this.parseAndExpression();

    while (this.isOperator(this.currentToken(), 'OR')) {
      this.consumeToken(); // consume OR
      const right = this.parseAndExpression();
      left = new OrExpression(left, right);
    }

    return left;
  }

  // AND has higher precedence than OR
  private parseAndExpression(): TechStackExpression {
    let left = this.parseNotExpression();

    while (this.isOperator(this.currentToken(), 'AND')) {
      this.consumeToken(); // consume AND
      const right = this.parseNotExpression();
      left = new AndExpression(left, right);
    }

    return left;
  }

  // NOT has highest precedence (except parentheses)
  private parseNotExpression(): TechStackExpression {
    if (this.isOperator(this.currentToken(), 'NOT')) {
      this.consumeToken(); // consume NOT
      const expression = this.parseNotExpression(); // Allow chaining: NOT NOT term
      return new NotExpression(expression);
    }

    return this.parsePrimaryExpression();
  }

  // Primary: either a term or a parenthesized expression
  private parsePrimaryExpression(): TechStackExpression {
    const token = this.currentToken();

    if (token === '(') {
      this.consumeToken(); // consume (
      const expression = this.parseOrExpression();
      if (this.currentToken() !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.consumeToken(); // consume )
      return expression;
    }

    if (token === ')') {
      throw new Error('Unexpected closing parenthesis');
    }

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    // Check if it's an operator without operands
    if (this.isOperator(token, 'AND') || this.isOperator(token, 'OR')) {
      throw new Error(`Unexpected operator: ${token}`);
    }

    this.consumeToken();
    return new TermExpression(token);
  }
}
