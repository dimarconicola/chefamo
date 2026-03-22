export interface ApiErrorPayload {
  success: false;
  error?: {
    code?: string;
    message?: string;
    statusCode?: number;
  };
}

export const readApiErrorCode = async (response: Response) => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.error?.code;
  } catch {
    return undefined;
  }
};
