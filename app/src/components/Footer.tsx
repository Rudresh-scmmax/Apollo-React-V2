import { useNavigate } from 'react-router-dom';

const Footer = () => {
	const navigate = useNavigate();

	return (<footer className="border-t border-gray-800 py-8 mt-auto w-full bg-gray-900">
		<div className="container mx-auto px-4">
			<div className="flex flex-col md:flex-row justify-between items-center">
				<p className="text-gray-400">© 2025 SCMmax. All rights reserved.</p>
				<div className="flex space-x-6 mt-4 md:mt-0">
					<div className="flex space-x-6">
						<button
							onClick={() => navigate('/blog')}
							className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
						>
							Blog
						</button>
					</div>
					<button
						onClick={() => navigate('/terms-and-conditions')}
						className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
					>
						Terms of Service
					</button>
					<button
						onClick={() => navigate('/privacy-policy')}
						className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
					>
						Privacy Policy
					</button>
				</div>
			</div>
		</div>
	</footer>)
}

export default Footer;