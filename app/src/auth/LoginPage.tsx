import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

interface LoginCredentials {
	email: string;
	password: string;
}

const formStyles = {
	input: `w-full px-4 py-3 mt-2 bg-white/90 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-[#4A5A1E] focus:border-transparent
            placeholder-gray-500 transition-all duration-300 text-gray-800`,

	label: `block text-[#2C3612] font-medium`,

	button: `w-full bg-gradient-to-r from-[#4A5A1E] to-[#5B6E25] px-4 py-3 
             rounded-lg hover:from-[#3D4A19] hover:to-[#4A5A1E] focus:outline-none 
             focus:ring-2 focus:ring-[#4A5A1E] focus:ring-offset-2 focus:ring-offset-[#A0BF3F]
             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
             font-semibold text-white`,

	error: `text-red-700 text-sm text-center mt-2 font-medium`,

	divider: `flex items-center my-6`,
	dividerLine: `flex-grow border-t border-[#4A5A1E]/30`,
	dividerText: `mx-4 text-[#2C3612]`,

	providerButton: `w-full flex items-center justify-center gap-3 px-4 py-3 
                     border border-[#4A5A1E]/20 rounded-lg hover:bg-white/95 
                     text-[#2C3612] transition-all duration-300 mt-3 bg-white/90`,
};


const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { login } = useAuth();
	console.log("Error: ", error);
	const handleLogin = async (): Promise<void> => {
		setLoading(true);
		try {
			await login({ email, password } as LoginCredentials);
			setPassword('');
			setEmail('');
			navigate('/dashboard');
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('An unexpected error occurred');
			}
			return;
		} finally {
			setLoading(false);
		}
	};




	const formValid: boolean = (!!email && password.length > 4);

	return (

		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}


		>
			<h2 className="text-3xl font-bold mb-6 text-center ">
				Welcome Back
			</h2>
			<form
				onSubmit={(e: FormEvent<HTMLFormElement>) => {
					e.preventDefault();
					handleLogin();
				}}
				className="space-y-6"
			>
				<div>
					<label htmlFor="email" className={formStyles.label}>
						Email
					</label>
					<input
						onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
						value={email}
						id="email"
						type="email"
						className={formStyles.input}
						placeholder="Enter your email address"
						autoComplete="email"
						disabled={loading}
					/>
				</div>
				<div>
					<label htmlFor="password" className={formStyles.label}>
						Password
					</label>
					<input
						id="password"
						type="password"
						autoComplete="current-password"
						className={formStyles.input}
						placeholder="Enter your password"
						onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
						value={password}
						disabled={loading}
					/>
				</div>
				<motion.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<button
						type="submit"
						className={formStyles.button}
						disabled={loading || !formValid}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</motion.div>



				{error && (
					<div className={formStyles.error}>
						{error}
					</div>
				)}
			</form>
		</motion.div>


	);
};
export default LoginPage;