import { getCompanyLogoUrl, getCompanyInitials } from './logo-url.util';

describe('Logo URL Utilities', () => {
  describe('getCompanyLogoUrl', () => {
    it('should return null for null company name', () => {
      expect(getCompanyLogoUrl(null)).toBeNull();
    });

    it('should extract domain from company website', () => {
      const result = getCompanyLogoUrl('Example Corp', 'https://example.com');
      expect(result).not.toBeNull();
      expect(result?.primary).toContain('example.com');
    });

    it('should extract domain from apply links', () => {
      const result = getCompanyLogoUrl('Example Corp', null, ['https://jobs.example.com/apply']);
      expect(result).not.toBeNull();
      expect(result?.primary).toContain('jobs.example.com');
    });

    it('should skip generic job boards in apply links', () => {
      const result = getCompanyLogoUrl(
        'Example Corp',
        null,
        ['https://lever.co/example', 'https://example.com/careers']
      );
      expect(result).not.toBeNull();
      // Should use example.com, not lever.co
      expect(result?.primary).toContain('example.com');
    });

    it('should generate URL from company name as fallback', () => {
      const result = getCompanyLogoUrl('Example Corp');
      expect(result).not.toBeNull();
      expect(result?.primary).toContain('examplecorp.com');
    });

    it('should clean company name suffixes', () => {
      const result = getCompanyLogoUrl('Example Inc.');
      expect(result).not.toBeNull();
      expect(result?.primary).toContain('example.com');
    });
  });

  describe('getCompanyInitials', () => {
    it('should return ? for null company name', () => {
      expect(getCompanyInitials(null)).toBe('?');
    });

    it('should return first letter for single word', () => {
      expect(getCompanyInitials('Example')).toBe('EX');
    });

    it('should return first letters of first two words', () => {
      expect(getCompanyInitials('Example Corporation')).toBe('EC');
    });

    it('should skip common suffixes', () => {
      expect(getCompanyInitials('Example Inc')).toBe('EX');
      expect(getCompanyInitials('Example LLC')).toBe('EX');
    });

    it('should handle multiple words', () => {
      expect(getCompanyInitials('Big Tech Company')).toBe('BT');
    });
  });
});
