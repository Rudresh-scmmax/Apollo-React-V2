import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaCreditCard, FaChevronDown, FaChevronRight, FaRuler } from 'react-icons/fa';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown: React.FC<{ 
  isProfileDropdownOpen: boolean; 
  setIsProfileDropdownOpen: (isOpen: boolean) => void 
}> = ({ isProfileDropdownOpen, setIsProfileDropdownOpen }) => {
  const { logout, getDecodedToken } = useAuth();
  const token = getDecodedToken();
  const navigate = useNavigate();
  const [isPreferencesSubmenuOpen, setIsPreferencesSubmenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isProfileDropdownOpen &&
        target instanceof Node &&
        !target.closest('.profile-dropdown-container')
      ) {
        setIsProfileDropdownOpen(false);
        setIsPreferencesSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, setIsProfileDropdownOpen]);

  // Reset submenu when main dropdown closes
  useEffect(() => {
    if (!isProfileDropdownOpen) {
      setIsPreferencesSubmenuOpen(false);
    }
  }, [isProfileDropdownOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsProfileDropdownOpen(false);
    setIsPreferencesSubmenuOpen(false);
  };

  const handlePreferencesToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPreferencesSubmenuOpen(!isPreferencesSubmenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <div className="relative ml-3 profile-dropdown-container">
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
          >
            {/* User Info Section */}
            <div className="px-4 py-3 bg-[#a0bf3f] text-white">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
                    <FaUser className="text-gray-700" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {token?.sub || 'User'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Preferences with Submenu */}
              <div>
                <button
                  onClick={handlePreferencesToggle}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-[#f5f8e8] transition-colors group"
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <FaCog className="mr-3 text-gray-400 group-hover:text-[#a0bf3f] transition-colors" />
                    <span className="font-medium">Preferences</span>
                  </div>
                  {isPreferencesSubmenuOpen ? (
                    <FaChevronDown className="text-xs text-gray-400" />
                  ) : (
                    <FaChevronRight className="text-xs text-gray-400" />
                  )}
                </button>
                
                {/* Submenu */}
                <AnimatePresence>
                  {isPreferencesSubmenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 pl-4">
                        <button
                          onClick={() => handleNavigation('/preferences/user')}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-[#f5f8e8] hover:text-[#a0bf3f] transition-colors group"
                          role="menuitem"
                        >
                          <FaUser className="mr-3 text-gray-400 group-hover:text-[#a0bf3f] transition-colors text-xs" />
                          <span>User Preferences</span>
                        </button>
                        <button
                          onClick={() => handleNavigation('/preferences/uom')}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-[#f5f8e8] hover:text-[#a0bf3f] transition-colors group"
                          role="menuitem"
                        >
                          <FaRuler className="mr-3 text-gray-400 group-hover:text-[#a0bf3f] transition-colors text-xs" />
                          <span>UOM Preferences</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => handleNavigation('/account')}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#f5f8e8] transition-colors group"
                role="menuitem"
              >
                <FaCreditCard className="mr-3 text-gray-400 group-hover:text-[#a0bf3f] transition-colors" />
                <span className="font-medium">Manage Plan</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                role="menuitem"
              >
                <FaSignOutAlt className="mr-3 text-red-400 group-hover:text-red-600 transition-colors" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
