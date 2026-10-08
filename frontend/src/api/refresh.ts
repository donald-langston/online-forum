import { authApi } from "./endpoints";
import { setaccessToken } from "./token";

let refreshPromise: Promise<boolean> | null = null;

export async function attemptTokenRefresh(): Promise<boolean> {
    if(refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = performRefresh();
    const result = await refreshPromise;
    refreshPromise = null;
    return result;
}

async function performRefresh(): Promise<boolean> {
    try {
        const { accessToken } = await authApi.refresh();
        setaccessToken(accessToken);
        return true;
    } catch {
        setaccessToken(null);
        return false;
    }
}