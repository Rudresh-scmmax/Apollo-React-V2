import { FC, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from "motion/react";
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const AuthLayout: FC = () => {
	const location = useLocation();
	const isLoginPage: boolean = location.pathname === '/login';
	const isRegisterPage: boolean = location.pathname === '/register';
	const navigate = useNavigate();

	const { isAuthenticated } = useAuth();

	if (isAuthenticated()) {
		navigate('/dashboard');
	}

	const gotoLogin = () => {
		navigate('/login');
	}

	return (
		<div className='flex flex-col min-h-[calc(100vh-5rem)] pb-10'>
			<main className="flex-grow flex flex-col justify-center items-center space-y-8 px-4">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<img
						src='/images/logo.png'
						alt='wordmark'
						className="h-12"
					/>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className='w-full max-w-md p-8 rounded-xl border border-gray-700 backdrop-blur-sm bg-[#A0BF3F] '
				>
					<div className='w-full max-w-sm mx-auto text-black'>
						<Outlet />
					</div>
					<div className='text-center mt-6 space-y-2'>
						{isLoginPage ? (
							<>
							<div>
								<span className='text-gray-800'>Don&apos;t have an account?</span>{' '}
								<Link to='/register' className='text-blue-600 hover:text-blue-300 font-semibold transition-colors'>
									Register here.
								</Link>
							</div>
							{/* Forgot Password Link */}
								<div>
									<Link to='/forgot-password' className='text-red-600 hover:text-red-400 font-semibold transition-colors'>
										Forgot Password?
									</Link>
								</div>
								</>
						) : isRegisterPage ? (
							<div>
								<span className='text-gray-800'>Already have an account?</span>{' '}
								<a onClick={gotoLogin} className='text-blue-600 hover:text-blue-300 font-semibold transition-colors cursor-pointer'>
									Login here.
								</a>

							</div>
						) : (
							null
						)}
					</div>
				</motion.div>
			</main>
		</div>
	);
};
export default AuthLayout;