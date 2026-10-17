import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

interface RequestOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const token = await AsyncStorage.getItem('token');

    const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
        // Tenter de lire le JSON d'erreur, mais le backend peut retourner du HTML
        let errorData: any = {};
        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                errorData = await response.json();
            } else {
                const text = await response.text();
                errorData = { message: `Erreur ${response.status} (réponse non-JSON du serveur)` };
            }
        } catch {
            errorData = { message: `Erreur ${response.status}` };
        }
        const error: any = new Error(errorData.message || `Erreur ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
    }

    return response.json();
}

const api = {
    get: <T>(url: string) => request<T>(url, { method: 'GET' }),
    post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body }),
    put: <T>(url: string, body: any) => request<T>(url, { method: 'PUT', body }),
    delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

export default api;
