import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://shaqo-api-master-jkif7q.free.laravel.cloud/api";

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
  }
}

/* ---------------- REQUEST ---------------- */

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    auth?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: any = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || "Error", data);
  }

  return data;
}