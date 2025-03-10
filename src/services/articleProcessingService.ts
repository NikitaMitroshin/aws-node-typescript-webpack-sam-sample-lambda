/**
 * Service for processing article content
 */
export class ArticleProcessingService {
  /**
   * Replace all occurrences of "Google" with a hyperlink
   * 
   * @param content - The content to process
   * @returns The processed content with hyperlinks
   */
  public replaceGoogleWithHyperlink(content: string): string {
    const googleLink = '<a href="https://www.google.com/" target="_blank">Google</a>';
    return content.replace(/Google/g, googleLink);
  }

  /**
   * Process an article by replacing "Google" with hyperlinks in text elements
   * 
   * @param article - The article to process
   * @returns A new article object with processed content
   */
  public processArticle(article: any): any {
    // Create a deep copy of the article to avoid modifying the original
    const processedArticle = JSON.parse(JSON.stringify(article));
    
    // Process each content element
    if (processedArticle.content_elements && Array.isArray(processedArticle.content_elements)) {
      processedArticle.content_elements = processedArticle.content_elements.map((
        element: { type: string; content?: string; _id: string }) => {
        // Only process text elements
        if (element.type === 'text' && element.content) {
          return {
            ...element,
            content: this.replaceGoogleWithHyperlink(element.content)
          };
        }
        return element;
      });
    }
    
    return processedArticle;
  }
} 