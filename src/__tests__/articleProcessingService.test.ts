import { ArticleProcessingService } from '../services/articleProcessingService';

describe('ArticleProcessingService', () => {
  let articleProcessingService: ArticleProcessingService;

  beforeEach(() => {
    articleProcessingService = new ArticleProcessingService();
  });

  describe('replaceGoogleWithHyperlink', () => {
    it('should replace "Google" with a hyperlink', () => {
      const content = 'This is a test with Google in the middle';
      const expected = 'This is a test with <a href="https://www.google.com/" target="_blank">Google</a> in the middle';
      
      const result = articleProcessingService.replaceGoogleWithHyperlink(content);
      
      expect(result).toEqual(expected);
    });

    it('should replace multiple occurrences of "Google"', () => {
      const content = 'Google is great, I use Google every day';
      const expected = '<a href="https://www.google.com/" target="_blank">Google</a> is great, I use <a href="https://www.google.com/" target="_blank">Google</a> every day';
      
      const result = articleProcessingService.replaceGoogleWithHyperlink(content);
      
      expect(result).toEqual(expected);
    });

    it('should return the original content if "Google" is not present', () => {
      const content = 'This content has no keyword';
      
      const result = articleProcessingService.replaceGoogleWithHyperlink(content);
      
      expect(result).toEqual(content);
    });

    it('should handle empty content', () => {
      const content = '';
      
      const result = articleProcessingService.replaceGoogleWithHyperlink(content);
      
      expect(result).toEqual('');
    });
  });

  describe('processArticle', () => {
    it('should process text elements in the article', () => {
      const article = {
        id: 'test-article',
        content_elements: [
          {
            _id: '1',
            type: 'text',
            content: 'This is a test with Google in it'
          },
          {
            _id: '2',
            type: 'image',
            url: 'https://example.com/image.jpg'
          },
          {
            _id: '3',
            type: 'text',
            content: 'Another Google reference here'
          }
        ]
      };

      const expected = {
        id: 'test-article',
        content_elements: [
          {
            _id: '1',
            type: 'text',
            content: 'This is a test with <a href="https://www.google.com/" target="_blank">Google</a> in it'
          },
          {
            _id: '2',
            type: 'image',
            url: 'https://example.com/image.jpg'
          },
          {
            _id: '3',
            type: 'text',
            content: 'Another <a href="https://www.google.com/" target="_blank">Google</a> reference here'
          }
        ]
      };

      const result = articleProcessingService.processArticle(article);

      expect(result).toEqual(expected);
    });

    it('should handle articles without content_elements', () => {
      const article = {
        id: 'test-article',
        title: 'Test Article'
      };

      const result = articleProcessingService.processArticle(article);

      expect(result).toEqual(article);
    });

    it('should handle empty content_elements array', () => {
      const article = {
        id: 'test-article',
        content_elements: []
      };

      const result = articleProcessingService.processArticle(article);

      expect(result).toEqual(article);
    });

    it('should not modify non-text elements', () => {
      const article = {
        id: 'test-article',
        content_elements: [
          {
            _id: '1',
            type: 'image',
            caption: 'Google image'
          },
          {
            _id: '2',
            type: 'video',
            description: 'Google video'
          }
        ]
      };

      const result = articleProcessingService.processArticle(article);

      expect(result).toEqual(article);
    });

    it('should handle text elements without content property', () => {
      const article = {
        id: 'test-article',
        content_elements: [
          {
            _id: '1',
            type: 'text'
          }
        ]
      };

      const result = articleProcessingService.processArticle(article);

      expect(result).toEqual(article);
    });

    it('should create a deep copy and not modify the original article', () => {
      const article = {
        id: 'test-article',
        content_elements: [
          {
            _id: '1',
            type: 'text',
            content: 'This has Google in it'
          }
        ]
      };

      const originalArticle = JSON.parse(JSON.stringify(article));
      
      articleProcessingService.processArticle(article);

      expect(article).toEqual(originalArticle);
    });
  });
}); 