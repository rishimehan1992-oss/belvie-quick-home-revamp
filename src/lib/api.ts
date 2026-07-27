export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.trim().slice(0, 120);
    throw new Error(
      preview || `Server error (${response.status}). Please try again.`,
    );
  }
}
