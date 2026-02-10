import { TechStackExpressionParser } from './tech-stack-expression-parser';

describe('TechStackExpressionParser', () => {
  let parser: TechStackExpressionParser;
  let sampleTechStack: string[];

  beforeEach(() => {
    parser = new TechStackExpressionParser();
    sampleTechStack = ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'];
  });

  describe('Simple term searches', () => {
    it('should match a single term', () => {
      const result = parser.parse('Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should match case-insensitively', () => {
      const result = parser.parse('python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should NOT match partial strings (exact match required)', () => {
      const result = parser.parse('Post');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should match exact strings', () => {
      const result = parser.parse('PostgreSQL');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should match "C" exactly, not "React"', () => {
      const techStackWithC = ['C', 'React', 'Node'];
      const result = parser.parse('C');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(techStackWithC)).toBe(true);
      expect(result.expression!.evaluate(['React', 'Node'])).toBe(false);
    });

    it('should match "Py" exactly, not "Python"', () => {
      const techStackWithPy = ['Py', 'Java'];
      const techStackWithPython = ['Python', 'Java'];
      const result = parser.parse('Py');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(techStackWithPy)).toBe(true);
      expect(result.expression!.evaluate(techStackWithPython)).toBe(false);
    });

    it('should not match non-existent terms', () => {
      const result = parser.parse('Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should return null expression for empty input', () => {
      const result = parser.parse('');
      expect(result.isValid).toBe(true);
      expect(result.expression).toBeNull();
    });

    it('should return null expression for whitespace-only input', () => {
      const result = parser.parse('   ');
      expect(result.isValid).toBe(true);
      expect(result.expression).toBeNull();
    });
  });

  describe('AND operator', () => {
    it('should match when both terms exist', () => {
      const result = parser.parse('Python AND Django');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should not match when one term is missing', () => {
      const result = parser.parse('Python AND Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should handle case-insensitive AND', () => {
      const result = parser.parse('Python and Django');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should chain multiple ANDs', () => {
      const result = parser.parse('Python AND Django AND React');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should fail chained ANDs if one term missing', () => {
      const result = parser.parse('Python AND Django AND Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(false);
    });
  });

  describe('OR operator', () => {
    it('should match when first term exists', () => {
      const result = parser.parse('Python OR Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should match when second term exists', () => {
      const result = parser.parse('Java OR Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should match when both terms exist', () => {
      const result = parser.parse('Python OR Django');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should not match when neither term exists', () => {
      const result = parser.parse('Java OR Ruby');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should handle case-insensitive OR', () => {
      const result = parser.parse('Python or Django');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should chain multiple ORs', () => {
      const result = parser.parse('Java OR Ruby OR Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });
  });

  describe('NOT operator', () => {
    it('should match when term does not exist', () => {
      const result = parser.parse('NOT Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should not match when term exists', () => {
      const result = parser.parse('NOT Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should handle case-insensitive NOT', () => {
      const result = parser.parse('not Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should handle double negation', () => {
      const result = parser.parse('NOT NOT Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });
  });

  describe('Operator precedence', () => {
    it('should evaluate NOT before AND', () => {
      // NOT Java AND Python => (NOT Java) AND Python => true AND true => true
      const result = parser.parse('NOT Java AND Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should evaluate AND before OR', () => {
      // Java OR Python AND Django => Java OR (Python AND Django) => false OR true => true
      const result = parser.parse('Java OR Python AND Django');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should respect operator precedence in complex expression', () => {
      // NOT Java AND Python OR Ruby => (NOT Java AND Python) OR Ruby => true OR false => true
      const result = parser.parse('NOT Java AND Python OR Ruby');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });
  });

  describe('Parentheses', () => {
    it('should respect parentheses for grouping', () => {
      // (Python OR Java) AND Django => true AND true => true
      const result1 = parser.parse('(Python OR Java) AND Django');
      expect(result1.isValid).toBe(true);
      expect(result1.expression).not.toBeNull();
      expect(result1.expression!.evaluate(sampleTechStack)).toBe(true);

      // (Java OR Ruby) AND Django => false AND true => false
      const result2 = parser.parse('(Java OR Ruby) AND Django');
      expect(result2.isValid).toBe(true);
      expect(result2.expression).not.toBeNull();
      expect(result2.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should override default precedence with parentheses', () => {
      // Python AND (Django OR Java) => Python AND true => true
      const result1 = parser.parse('Python AND (Django OR Java)');
      expect(result1.isValid).toBe(true);
      expect(result1.expression).not.toBeNull();
      expect(result1.expression!.evaluate(sampleTechStack)).toBe(true);

      // Python AND (Ruby OR Java) => Python AND false => false
      const result2 = parser.parse('Python AND (Ruby OR Java)');
      expect(result2.isValid).toBe(true);
      expect(result2.expression).not.toBeNull();
      expect(result2.expression!.evaluate(sampleTechStack)).toBe(false);
    });

    it('should handle nested parentheses', () => {
      const result = parser.parse('((Python OR Java) AND Django) OR Ruby');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should handle NOT with parentheses', () => {
      // NOT (Java AND Python) => NOT false => true
      const result1 = parser.parse('NOT (Java AND Python)');
      expect(result1.isValid).toBe(true);
      expect(result1.expression).not.toBeNull();
      expect(result1.expression!.evaluate(sampleTechStack)).toBe(true);

      // NOT (Python AND Django) => NOT true => false
      const result2 = parser.parse('NOT (Python AND Django)');
      expect(result2.isValid).toBe(true);
      expect(result2.expression).not.toBeNull();
      expect(result2.expression!.evaluate(sampleTechStack)).toBe(false);
    });
  });

  describe('Quoted strings', () => {
    it('should handle multi-word terms in quotes', () => {
      const techStackWithMultiWord = ['Machine Learning', 'Python', 'TensorFlow'];
      const result = parser.parse('"Machine Learning"');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(techStackWithMultiWord)).toBe(true);
    });

    it('should combine quotes with operators', () => {
      const techStackWithMultiWord = ['Machine Learning', 'Python', 'TensorFlow'];
      const result = parser.parse('"Machine Learning" AND Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(techStackWithMultiWord)).toBe(true);
    });

    it('should handle quoted terms with OR', () => {
      const techStackWithMultiWord = ['Machine Learning', 'Python'];
      const result = parser.parse('"Deep Learning" OR "Machine Learning"');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(techStackWithMultiWord)).toBe(true);
    });
  });

  describe('Complex real-world examples', () => {
    it('should handle: (Python OR Ruby) AND (React OR Angular)', () => {
      const result = parser.parse('(Python OR Ruby) AND (React OR Angular)');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
      expect(result.expression!.evaluate(['Java', 'Spring'])).toBe(false);
    });

    it('should handle: Python AND NOT Java', () => {
      const result = parser.parse('Python AND NOT Java');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
      expect(result.expression!.evaluate(['Python', 'Java'])).toBe(false);
    });

    it('should handle: (Python OR Node) AND (NOT Java) AND (React OR Vue)', () => {
      const result = parser.parse('(Python OR Node) AND (NOT Java) AND (React OR Vue)');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(['Python', 'React', 'PostgreSQL'])).toBe(true);
      expect(result.expression!.evaluate(['Python', 'Java', 'React'])).toBe(false);
      expect(result.expression!.evaluate(['Python', 'Angular'])).toBe(false);
    });

    it('should handle: C AND NOT Py (exact matches only)', () => {
      const result = parser.parse('C AND NOT Py');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      
      // Should match: has "C" and no "Py"
      expect(result.expression!.evaluate(['C', 'React', 'Node'])).toBe(true);
      
      // Should NOT match: has "C" but also has "Py"
      expect(result.expression!.evaluate(['C', 'Py', 'Node'])).toBe(false);
      
      // Should NOT match: has "React" (contains 'C') but not the exact tech "C"
      expect(result.expression!.evaluate(['React', 'Node'])).toBe(false);
      
      // Should match: has "C", has "Python" (not "Py"), no "Py"
      expect(result.expression!.evaluate(['C', 'Python', 'Node'])).toBe(true);
      
      // Should NOT match: no "C" even though it has no "Py"
      expect(result.expression!.evaluate(['Python', 'Node'])).toBe(false);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should report invalid expression and fallback to simple search on parse error', () => {
      const result = parser.parse('Python AND');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeTruthy();
      expect(result.expression).not.toBeNull();
      // Should fallback to searching for "Python AND" as a term
      expect(result.expression!.evaluate(['Python AND'])).toBe(true);
    });

    it('should handle expressions with extra whitespace', () => {
      const result = parser.parse('  Python   AND   Django  ');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(sampleTechStack)).toBe(true);
    });

    it('should handle empty tech stack', () => {
      const result = parser.parse('Python');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate([])).toBe(false);
    });

    it('should handle tech stack with null/undefined values', () => {
      const techStackWithNulls = ['Python', null as any, undefined as any, 'React'];
      const result = parser.parse('Python AND React');
      expect(result.isValid).toBe(true);
      expect(result.expression).not.toBeNull();
      expect(result.expression!.evaluate(techStackWithNulls)).toBe(true);
    });
  });
});
