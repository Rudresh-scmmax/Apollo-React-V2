/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		container: {
			center: true,
			padding: '2rem',

		},
		extend: {
			colors: {
				primary: {
					DEFAULT: '#FD5750',
					dark: '#FF746F',
				},
			},
			keyframes: {
				fadeIn: {
					from: { opacity: 0, transform: 'translateY(-2px)' },
					to: { opacity: 1, transform: 'translateY(0)' },
				},
				pulse: {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' },
				},
				bounce: {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-20px)' },
					'60%': { transform: 'translateY(-10px)' },
				},
				opacityPulse: {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				morphToClose: {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'50%': { transform: 'rotate(180deg) scale(0.8)' },
					'100%': { transform: 'rotate(360deg) scale(1)' },
				}
			},
			animation: {
				fadeIn: 'fadeIn 0.3s ease-in-out',
				pulse: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				bounce: 'bounce 1s infinite',
				opacityPulse: 'opacityPulse 1s infinite',
				slideUp: 'slideUp 0.3s ease-out forwards',
				scaleIn: 'scaleIn 0.2s ease-out forwards',
				morphToClose: 'morphToClose 0.3s ease-in-out',
			},
		},
	},
	plugins: [
		require('tailwind-scrollbar'),
		function ({ addUtilities }) {
			const newUtilities = {
				'.thin-scrollbar': {
					'&::-webkit-scrollbar': {
						height: '8px',
						width: '8px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'rgba(0, 0, 0, 0.05)',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb': {
						background: 'rgba(0, 0, 0, 0.2)',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						background: 'rgba(0, 0, 0, 0.3)',
					},
					'scrollbar-width': 'thin',
					'scrollbar-color': 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)',
				},
				'.messages-scrollbar': {
					'&::-webkit-scrollbar': {
						width: '6px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'rgba(0, 0, 0, 0.05)',
						borderRadius: '10px',
					},
					'&::-webkit-scrollbar-thumb': {
						background: 'rgba(156, 163, 175, 0.5)',
						borderRadius: '10px',
						transition: 'all 0.2s ease-in-out',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						background: 'rgba(156, 163, 175, 0.7)',
					},
					'scrollbar-width': 'thin',
					'scrollbar-color': 'rgba(156, 163, 175, 0.5) rgba(0, 0, 0, 0.05)',
				},
			}
			addUtilities(newUtilities, ['responsive', 'hover'])
		},
	],
};
