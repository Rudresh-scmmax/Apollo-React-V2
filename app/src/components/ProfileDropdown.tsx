import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { FaUser } from 'react-icons/fa';

import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProfileDropdown: React.FC<{ isProfileDropdownOpen: boolean; setIsProfileDropdownOpen: (isOpen: boolean) => void }> = ({ isProfileDropdownOpen, setIsProfileDropdownOpen }) => {
	const { logout, getDecodedToken } = useAuth(); // Assuming you have a signOut function in your auth context

	const token = getDecodedToken();
	console.log(token);

	const navigate = useNavigate();
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (
				isProfileDropdownOpen &&
				target instanceof Node &&
				!target.closest('.relative')
			) {
				setIsProfileDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isProfileDropdownOpen]);
	return (
		<div className="relative ml-3 ">
			<div>
				<button
					onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
					className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
				>
					<FaUser className="text-gray-700" />
				</button>
			</div>

			<AnimatePresence>
				{isProfileDropdownOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute right-0 mt-2 rounded-md shadow-lg  ring-1 ring-black bg-gray-100 ring-opacity-5 min-w-48"
					>
						<div className="py-1" role="menu">
							<div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-500">
								{token && token.email}
							</div>
							<button
								onClick={() => {
									navigate('/account');
									setIsProfileDropdownOpen(false);
								}}
								className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-400 transition-colors"
								role="menuitem"
							>
								Manage Plan
							</button>
							<button
								onClick={() => {
									logout();
									setIsProfileDropdownOpen(false);
								}}
								className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-400 transition-colors"
								role="menuitem"
							>
								Log Out
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};


export default ProfileDropdown;