export type MatchStatus = "Strong Match" | "Partial Match" | "Missing Skill";
export type MatchType = "Exact Keyword Match" | "Semantic Vector Match" | "None";

export interface Skill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  prerequisites: string[];
  description?: string;
}

export interface RoleRequirement {
  skill_id: string;
  weight: number;
  importance: "Must Have" | "Important" | "Nice to Have" | string;
  min_threshold: number;
  description?: string;
}

export interface RoleProfile {
  id: string;
  title: string;
  description?: string;
  requirements: RoleRequirement[];
}

export interface ExtractedSkill {
  skill_id: string;
  name: string;
  category: string;
  extraction_source: "canonical_phrase_matcher" | "noun_chunk_fallback";
  confidence: number;
  matched_text: string;
}

export interface MatchBreakdownItem {
  skill_id: string;
  skill_name: string;
  category: string;
  weight: number;
  importance: string;
  status: MatchStatus;
  match_type: MatchType;
  similarity_score: number;
  matched_candidate_skill?: string | null;
  evidence_snippet?: string | null;
  explanation: string;
}

export interface LearningRoadmapItem {
  skill_id: string;
  skill_name: string;
  category: string;
  priority_score: number;
  priority_rank: number;
  gap_type: "Missing Skill" | "Partial Match";
  prerequisites: string[];
  unmet_prerequisites: string[];
  title: string;
  objective: string;
  topics: string[];
  official_docs: string;
  practice_tasks: string[];
  artifacts: string;
  estimated_hours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface AnalysisResponse {
  id: string;
  candidate_name: string;
  role_profile_title: string;
  source_type: "text" | "pdf" | "docx";
  gap_index: number;
  gap_index_percentage: number;
  overall_match_score: number;
  strong_matches_count: number;
  partial_matches_count: number;
  missing_skills_count: number;
  total_requirements_count: number;
  extracted_skills: ExtractedSkill[];
  match_breakdown: MatchBreakdownItem[];
  recommendations: LearningRoadmapItem[];
  disclaimer: string;
  created_at: string;
}

export interface AnalysisHistoryItem {
  id: string;
  candidate_name: string;
  role_profile_title: string;
  source_type: string;
  gap_index: number;
  overall_match_score: number;
  strong_matches_count: number;
  partial_matches_count: number;
  missing_skills_count: number;
  created_at: string;
}
