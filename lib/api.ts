import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://shaqo-api-master-jkif7q.laravel.cloud/api/v1";

const TOKEN_KEY = "auth.token";
const USER_KEY = "auth.user";

/* ---------------- STORAGE ---------------- */

export const getToken = () =>
  AsyncStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null) =>
  token
    ? AsyncStorage.setItem(TOKEN_KEY, token)
    : AsyncStorage.removeItem(TOKEN_KEY);

export const getUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setUser = (user: any | null) =>
  user
    ? AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
    : AsyncStorage.removeItem(USER_KEY);

/* ---------------- ERROR ---------------- */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/* ---------------- REQUEST ---------------- */

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    auth?: boolean;
    isFormData?: boolean;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    isFormData = false,
    headers: extraHeaders = {},
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extraHeaders,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Only read from storage if no Authorization already provided
  if (auth && !headers["Authorization"]) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`API Error [${res.status}] ${path}:`, data);
    throw new ApiError(res.status, data?.message || `Request failed with status ${res.status}`, data);
  }

  return data;
}

/* ---------------- SAVE PUSH TOKEN ---------------- */

export async function savePushToken(token: string) {
  try {
    const userToken = await getToken();
    if (!userToken) {
      console.log('User not authenticated, skipping push token save');
      return null;
    }

    const response = await apiRequest('/save-token', {
      method: 'POST',
      body: { token },
      auth: true,
    });

    console.log('Push token saved to server');
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Failed to save push token: ${error.message}`);
    } else {
      console.error('Failed to save push token:', error);
    }
    throw error;
  }
}