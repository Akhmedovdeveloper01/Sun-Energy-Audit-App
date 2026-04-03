export interface ClientData {
  fullName: string;
  phone: string;
  address: string;
  residentsCount: string;      
  buildYear: string;          
  lastRepairYear: string;     
  buildingCount: string;      
  floorCount: string;        
  roomCount: string;           
  usagePurpose: string;        
}

export interface ChecklistAnswers {
  roof_area_sufficient: 'yes' | 'no' | null;
  roof_condition: 'good' | 'average' | 'bad' | null;
  sun_exposure: 'good' | 'average' | 'bad' | null;
  shade_condition: 'none' | 'partial' | 'heavy' | null;
  roof_angle: 'optimal' | 'acceptable' | 'poor' | null;
  wind_load: 'low' | 'medium' | 'high' | null;
  notes?: string;
}

export interface AuditData {
  client: ClientData;
  // checklist: ChecklistAnswers;
  // photos: string[];
  // location: {
  //   lat: number;
  //   lng: number;
  //   timestamp: string;
  // } | null;
  startedAt: string;
  completedAt?: string;
}