import { Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useState, FC } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/Footer';
import ProfileDropdown from '../components/ProfileDropdown';

interface ProtectedRouteProps {
	loginPath: string;
}
/**
 * A simple component that blocks mobile users from accessing the app.
 */
const MobileBlocker: React.FC = () => {
	return (
		<div
			style={{
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '20px',
				backgroundColor: '#f8f9fa',
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					padding: '2.5rem',
					borderRadius: '16px',
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
					maxWidth: '300px',
					textAlign: 'center',
				}}
			>

				<h1
					style={{
						fontSize: '1.25rem',
						fontWeight: '600',
						marginBottom: '1.5rem',
						color: '#1f2937',
					}}
				>
					Desktop Only
				</h1>
				<p style={{
					color: '#6c757d',
					lineHeight: '1.5',
					marginBottom: '1rem'
				}}>
					This website is currently only available on desktop devices.
				</p>
				<Link
					to="/"
					style={{
						display: 'inline-block',
						padding: '0.75rem 1.5rem',
						backgroundColor: '#6366f1',
						color: 'white',
						borderRadius: '8px',
						textDecoration: 'none',
						fontWeight: '500',
						transition: 'background-color 0.2s',
					}}
					onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
					onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
				>
					Back to Home
				</Link>
			</div>
		</div>
	);
};

/**
 * Simple React Router route that only allows access to authenticated users.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ loginPath }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, isExpired } = useAuth();
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

	const canGoBack = location.pathname !== '/dashboard';

	if (!isAuthenticated() || isExpired()) {
		return <Navigate to={loginPath} />;
	}

	return (
		<div className="flex flex-col">
			{isAuthenticated() && (
				<header className="text-gray-100 p-3 bg-[#A0BF3F] z-50">
					<div className="max-w-7xl mx-auto space-y-12">
						<div className="mb-2 flex justify-between items-center">
							<div className="flex items-center">
								{canGoBack ? (
									<button
										onClick={() => navigate(-1)}
										className="mr-24 flex items-center text-blue-400 hover:text-blue-300 text-lg"
									>
										<FaArrowLeft className="mr-2" /> Back
									</button>
								) : (
									<div
										className="flex items-center space-x-3 cursor-pointer hover:opacity-80"
										onClick={() => navigate("/")}
									>
										<h1 className="text-3xl font-bold text-white">Apollo</h1>

									</div>)}

							</div>
							<ProfileDropdown isProfileDropdownOpen={isProfileDropdownOpen} setIsProfileDropdownOpen={setIsProfileDropdownOpen} />
						</div>
					</div>
				</header>
			)}

			<main className="flex-1 min-h-[calc(100vh-10rem)] bg-gray-50">
				<Outlet />
			</main>
			<Footer />
		</div>
	);

};