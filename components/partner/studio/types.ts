// Modular Partner Studio Subsystem Types
export interface StudioCampaignState {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

export interface StudioAssetTemplate {
  id: string;
  title: string;
  dimensions: string;
  format: 'png' | 'jpeg' | 'pdf';
}
