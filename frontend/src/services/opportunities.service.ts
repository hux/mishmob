import { 
  apiClient, 
  OpportunityListResponse, 
  OpportunityListItem, 
  OpportunityDetail,
  ApplicationData 
} from './api';

export interface OpportunityFilters {
  zip_code?: string;
  skills?: string;
  cause_area?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export const opportunitiesService = {
  /**
   * Get list of opportunities with filters
   */
  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunityListResponse> {
    const params = {
      ...filters,
      status: filters?.status || 'open',
      page: filters?.page || 1,
      page_size: filters?.page_size || 20,
    };
    
    const response = await apiClient.get<OpportunityListResponse>('/opportunities/', { params });
    return response.data;
  },

  /**
   * Get featured opportunities
   */
  async getFeaturedOpportunities(): Promise<OpportunityListItem[]> {
    const response = await apiClient.get<OpportunityListItem[]>('/opportunities/featured');
    return response.data;
  },

  /**
   * Get opportunity details
   */
  async getOpportunityById(opportunityId: string): Promise<OpportunityDetail> {
    const response = await apiClient.get<OpportunityDetail>(`/opportunities/${opportunityId}`);
    return response.data;
  },

  /**
   * Apply to an opportunity
   */
  async applyToOpportunity(
    opportunityId: string, 
    application: ApplicationData
  ): Promise<{ message: string; application_id: number }> {
    const response = await apiClient.post(`/opportunities/${opportunityId}/apply`, application);
    return response.data;
  },

  /**
   * Search opportunities by skills
   */
  async searchBySkills(skills: string[]): Promise<OpportunityListResponse> {
    return this.getOpportunities({ skills: skills.join(',') });
  },

  /**
   * Get opportunities near a location
   */
  async getOpportunitiesNearLocation(zipCode: string): Promise<OpportunityListResponse> {
    return this.getOpportunities({ zip_code: zipCode });
  },
};