import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaChartLine, FaArrowRight, FaPuzzlePiece, FaShieldAlt, FaProductHunt, FaFileContract } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
	const navigate = useNavigate();
	const [currentTextIndex, setCurrentTextIndex] = useState(0);

	const features = [
		{
			icon: <FaProductHunt className="text-4xl text-indigo-600" />,
			title: "Increased Productivity",
			description: "Streamline workflows, automate tasks, and empower your team to focus on strategic initiatives."
		},
		{
			icon: <FaChartLine className="text-4xl text-indigo-600" />,
			title: "Reduced Costs",
			description: "Identify cost-saving opportunities, minimize leakages, and optimize contract terms."
		},
		{
			icon: <FaShieldAlt className="text-4xl text-indigo-600" />,
			title: "Improved Compliance",
			description: "Ensure adherence to legal requirements and internal policies with automated documentation and audit trails."
		},
		{
			icon: <FaPuzzlePiece className="text-4xl text-indigo-600" />,
			title: "Data-Driven Decisions",
			description: "Leverage real-time insights and analytics to make informed procurement decisions."
		},
		{
			icon: <FaFileContract className="text-4xl text-indigo-600" />,
			title: "Seamless Integrations",
			description: "Connect with your existing procurement platforms and ERP systems for a unified workflow."
		}
	];

	const rotatingTexts = [
		"Apollo helps category managers with actionable recommendations",
		"Apollo enables globally tested procurement best practices",
		"Apollo brings all contextually relevant procurement information into one screen"
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTextIndex((prevIndex) =>
				prevIndex === rotatingTexts.length - 1 ? 0 : prevIndex + 1
			);
		}, 4000); // Change text every 4 seconds

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<div className="container mx-auto px-4 pt-32 pb-20">
				<div className="flex flex-col md:flex-row items-center justify-between gap-12">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center md:text-left md:w-1/2"
					>
						<h1 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
							Apollo: First AI Team-mate for Direct Procurement Excellence
						</h1>
						<div className="h-20"> {/* Fixed height container for rotating text */}
							<AnimatePresence mode="wait">
								<motion.p
									key={currentTextIndex}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.5 }}
									className="text-xl md:text-2xl text-gray-600 mb-12"
								>
									{rotatingTexts[currentTextIndex]}
								</motion.p>
							</AnimatePresence>
						</div>
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<button
								onClick={() => navigate('/demo')}
								className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-semibold px-8 py-4 rounded-lg inline-flex items-center space-x-2 transition-all duration-300 shadow-lg"
							>
								<span>Request a Demo</span>
								<FaArrowRight className="ml-2" />
							</button>
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="md:w-1/2"
					>
						<img
							src="/images/Astro3.png"
							alt="Procurement Manager, a lone Astronaut"
							className="rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300"
						/>
					</motion.div>
				</div>
			</div>

			{/* Scrolling Text Section with improved animation */}
			<div className="bg-gray-50 py-10 overflow-hidden">
				<motion.div
					animate={{ x: ["0%", "-50%"] }}
					transition={{
						x: {
							repeat: Infinity,
							duration: 20,
							ease: "linear"
						}
					}}
					className="flex space-x-8 whitespace-nowrap"
				>
					{[...Array(2)].map((_, i) => (
						<div key={i} className="flex space-x-8">
							{["Global Awareness", "Analytical skills", "Capability to integrate multiple disciplinary knowledge",
								"Deeper Knowledge of product than vendor", "Deeper engagement with vendors",
								'"Can do" attitude'].map((text, index) => (
									<span key={index} className="text-gray-600 text-lg font-medium">
										{text} •
									</span>
								))}
						</div>
					))}
				</motion.div>
			</div>

			{/* Features Section with improved hover effects */}
			<div className="bg-white py-20">
				<div className="container mx-auto px-4">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="text-3xl font-bold text-center mb-12 text-gray-900"
					>
						Key Benefits Across the Platform
					</motion.h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								whileHover={{ y: -5 }}
								className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<div className="mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
								<p className="text-gray-600">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Demo Request Form */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.8 }}
				className="container mx-auto px-4 py-20"
			>
				<div className="bg-indigo-50 rounded-2xl p-12 max-w-2xl mx-auto">
					<h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
						Ready to transform your procurement process?
					</h2>
					<p className="text-xl text-gray-600 mb-8 text-center">
						Request a demo today and discover the power of SCMmax Apollo!
					</p>
					<form className="space-y-6">
						<div>
							<label className="block text-gray-700 mb-2">Name</label>
							<input type="text" className="w-full p-3 border rounded-lg" required />
						</div>
						<div>
							<label className="block text-gray-700 mb-2">Email</label>
							<input type="email" className="w-full p-3 border rounded-lg" required />
						</div>
						<div>
							<label className="block text-gray-700 mb-2">Company</label>
							<input type="text" className="w-full p-3 border rounded-lg" required />
						</div>
						<button
							type="submit"
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300"
						>
							Request Demo
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};

export default LandingPage;