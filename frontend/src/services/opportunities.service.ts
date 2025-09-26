import { opportunitiesApi, Opportunity, OpportunityListResponse } from './api';

export interface OpportunityFilters {
  zip_code?: string;
  skills?: string;
  cause_area?: string;
  remote_only?: boolean;
  status?: string;
  page?: number;
  page_size?: number;
}

export const opportunitiesService = {
  /**
   * Get list of opportunities with filters
   */
  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunityListResponse> {
    return opportunitiesApi.list(filters);
  },

  /**
   * Get featured opportunities
   */
  async getFeaturedOpportunities(): Promise<Opportunity[]> {
    return opportunitiesApi.getFeatured();
  },

  /**
   * Get opportunity details
   */
  async getOpportunityById(opportunityId: string): Promise<Opportunity> {
    return opportunitiesApi.getById(opportunityId);
  },

  /**
   * Apply to an opportunity
   */
  async applyToOpportunity(
    opportunityId: string, 
    roleId: string,
    data: { cover_letter?: string; availability_notes?: string }
  ): Promise<void> {
    return opportunitiesApi.apply(opportunityId, roleId, data);
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