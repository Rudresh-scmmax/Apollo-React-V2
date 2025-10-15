import React, { createContext, ReactNode, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';


interface AuthContextType {
	getToken: () => string | null;
	getDecodedToken: () => any;
	isExpired: () => boolean;
	login: ({ email, password }: { email: string; password: string }) => Promise<void>;
	logout: () => void;
	register: ({ email, password }: { email: string; password: string }) => Promise<void>;
	isAuthenticated: () => boolean;
	forgotPassword: ({ email }: { email: string }) => Promise<void>;
	resetPassword: ({ token, newPassword }: { token: string; newPassword: string }) => Promise<void>;

}

const authApiUrl = (import.meta as any).env.VITE_AUTH_API_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const getToken = (): string | null => localStorage.getItem('token');



	const getDecodedToken = (): any => {
		const token = getToken();
		if (token) {
			return jwtDecode(token);
		}
		return null;
	}

	const isExpired = (): boolean => {
		const decodedToken = getDecodedToken();
		if (decodedToken) {
			return decodedToken.exp < Date.now() / 1000;
		}
		return true;
	}

	const login = async ({ email, password }: { email: string; password: string }): Promise<void> => {
		const response = await fetch(`${authApiUrl}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: email, password }),
		});
		const data = await response.json();
		if (data.access_token) {
			localStorage.setItem('token', data.access_token);
		} else if (data.error) {
			throw new Error(data.error);
		} else {
			throw new Error('Unknown error');
		}
	};

	const register = async ({ email, password }: { email: string; password: string }): Promise<void> => {
		const response = await fetch(`${authApiUrl}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
		});
		const data = await response.json();
		if (data.token) {
			localStorage.setItem('token', data.token);
		} else if (data.error) {
			throw new Error(data.error);
		} else {
			throw new Error('Unknown error');
		}
	};

	const logout = (): void => {
		localStorage.clear();
	};

	const isAuthenticated = (): boolean => {
		return !!getToken();
	};

	const forgotPassword = async ({ email }: { email: string }): Promise<void> => {
		const response = await fetch(`${authApiUrl}/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || 'Failed to send reset link');
		}
	};

	const resetPassword = async ({ token, newPassword }: { token: string; newPassword: string }): Promise<void> => {
		const response = await fetch(`${authApiUrl}/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, newPassword }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || 'Failed to reset password');
		}
	};

	const contextValue: AuthContextType = {
		getToken,
		getDecodedToken,
		isExpired,
		login,
		logout,
		register,
		isAuthenticated,
		forgotPassword,
		resetPassword,

	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
