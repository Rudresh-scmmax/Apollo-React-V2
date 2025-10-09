import { useState, FC } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from "../auth/AuthProvider";
import Footer from '../components/Footer';
import ProfileDropdown from '../components/ProfileDropdown';

const Layout: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout, isAuthenticated } = useAuth();

	// Check if we're not on the root path
	const canGoBack = location.pathname !== '/';



	return (
		<div className="flex flex-col">
			{isAuthenticated() && (
				<header className="text-gray-100 p-3">
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
										<img
											src='/images/logo.png'
											alt='logo'
											className="h-12 w-auto"
										/>

									</div>)}

							</div>

						</div>
					</div>
				</header>
			)}


			<main className="flex-1 min-h-[calc(100vh-10rem)]">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default Layout;