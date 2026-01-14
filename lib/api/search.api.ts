import api from "./axios";

export type ResourceType = "all" | "notes" | "pyqs" | "syllabus";

export interface SearchParams {
  query: string;
  type?: ResourceType;
  program?: string;
  courseCode?: string;
  courseName?: string;
  year?: string;
  semester?: string;
}

export interface SearchResult {
  _id: string;
  title: string;
  program: string;
  courseCode: string;
  courseName: string;
  year: string;
  semester: string;
  resourceType?: string; // To identify which model this came from
  userId?:
    | {
        _id: string;
        username: string;
      }
    | string;
  createdAt?: string;
  // Additional fields from specific resources
  noteType?: string;
  pyqType?: string;
  syllabusType?: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

/**
 * Search across all resources (notes, pyqs, syllabus) with advanced filters
 */
export const searchAllResources = async (
  params: SearchParams
): Promise<SearchResponse> => {
  const response = await api.get("/resources/search", {
    params: {
      query: params.query,
      type: params.type || "all",
      ...(params.program && { program: params.program }),
      ...(params.courseCode && { courseCode: params.courseCode }),
      ...(params.courseName && { courseName: params.courseName }),
      ...(params.year && { year: params.year }),
      ...(params.semester && { semester: params.semester }),
    },
  });
  return response.data;
};

/**
 * Helper to determine the resource type from the search result
 */
export const getResourceType = (result: SearchResult): string => {
  // Check if the result has specific fields to determine type
  if (result.resourceType) return result.resourceType;

  // Fallback logic if resourceType is not provided
  if ("noteType" in result) return "notes";
  if ("pyqType" in result) return "pyqs";
  if ("syllabusType" in result) return "syllabus";

  return "unknown";
};
