// Define the type for the state managed by the Zustand store
export interface HyperprocessState {
  items: string[];
}

// Define the type for the response from the view_state HTTP endpoint
// It returns a Vec<String>, which translates to string[] in TypeScript.
export interface ViewStateResponse {
  // Assuming the backend framework wraps the result, common patterns are:
  // 1. Direct array: string[]
  // 2. Object with Ok/Err: { Ok: string[] } | { Err: string } 
  // Let's assume the simpler case for now, adjust if needed based on actual backend response.
  Ok: string[]; 
  // If the backend might return an error object instead:
  // Err?: string; 
} 

export interface SubmitEntry {
    SubmitEntry: string;
}

export interface ViewState {
    ViewState: string;
}

