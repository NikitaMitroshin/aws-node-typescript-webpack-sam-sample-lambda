import axios, {AxiosInstance, AxiosResponse} from 'axios';

/**
 * Service for interacting with Articles API
 */
export class ArticlesApiService {
    private axiosClient: AxiosInstance;

    /**
     * Create a new instance of ApiService
     *
     * @param baseUrl - The base URL for the API
     * @param token - The authentication token for the API
     */
    constructor(baseUrl: string, token: string) {
        this.axiosClient = axios.create({
            baseURL: `${baseUrl}/v1/article`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * Get the draft revision for an article
     *
     * @param articleId - The ID of the article
     * @returns The draft revision data
     * @throws Error if response status is not 200
     */
    public async getDraftRevision(articleId: string): Promise<any> {
        const response: AxiosResponse = await this.axiosClient.get(`/${articleId}/revision/draft`);

        if (response.status !== 200) {
            throw new Error(`Failed to get draft revision. Status code: ${response.status}`);
        }

        return response.data;
    }

    /**
     * Update the draft revision for an article
     *
     * @param articleId - The ID of the article
     * @param draftRevision - The updated draft revision data
     * @throws Error if response status is not 200
     */
    public async updateDraftRevision(articleId: string, draftRevision: any): Promise<void> {
        const requestBody = {
            document_id: articleId,
            draftRevision: draftRevision
        };

        const response: AxiosResponse = await this.axiosClient.put(`/${articleId}/revision/draft`, requestBody);

        if (response.status !== 200) {
            throw new Error(`Failed to update draft revision. Status code: ${response.status}`);
        }
    }

    /**
     * Publish a document
     *
     * @param articleId - The ID of the article to publish
     * @throws Error if response status is not 200
     */
    public async publishDocument(articleId: string): Promise<void> {
        const requestBody = {
            type: "story",
            id: articleId
        };

        const response: AxiosResponse = await this.axiosClient.post(`/${articleId}/revision/published`, requestBody);

        if (response.status !== 200) {
            throw new Error(`Failed to publish document. Status code: ${response.status}`);
        }
    }
}
