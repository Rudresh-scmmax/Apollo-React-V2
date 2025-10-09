import React, { createContext, useContext, useState, useEffect } from 'react';

type ToastType = 'info' | 'error';

interface ToastContextType {
	showToast: (message: string, type?: ToastType, duration?: number) => void;
	hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
	showToast: () => { },
	hideToast: () => { },
});

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
	children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [duration, setDuration] = useState(5000);
	const [type, setType] = useState<ToastType>('info');

	const showToast = (msg: string, toastType: ToastType = 'info', dur: number = 5000) => {
		setMessage(msg);
		setType(toastType);
		setDuration(dur);
		setIsOpen(true);
	};

	const hideToast = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (isOpen) {
			timer = setTimeout(() => {
				hideToast();
			}, duration);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [isOpen, duration]);

	const getToastStyles = () => {
		const baseStyles = `
            fixed bottom-4 left-1/2 transform -translate-x-1/2
            px-6 py-3 rounded-lg shadow-lg z-50 
            animate-fade-in-up max-w-md w-[90%] 
            text-center
        `;

		const typeStyles = {
			info: 'bg-blue-600 text-white',
			error: 'bg-red-600 text-white',
		};

		return `${baseStyles} ${typeStyles[type]}`;
	};

	const getIcon = () => {
		switch (type) {
			case 'info':
				return (
					<svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			case 'error':
				return (
					<svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
		}
	};

	return (
		<ToastContext.Provider value={{ showToast, hideToast }}>
			{children}
			{isOpen && (
				<div
					className={getToastStyles()}
					role="alert"
				>
					<div className="flex items-center justify-center">
						{getIcon()}
						<p className="text-sm">{message}</p>
					</div>
				</div>
			)}
		</ToastContext.Provider>
	);
};