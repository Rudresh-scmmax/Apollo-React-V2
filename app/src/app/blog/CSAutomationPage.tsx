import React from 'react';
import { FaRobot, FaQuestionCircle, FaHandsHelping, FaClock, FaChartLine, FaUserCheck, FaRocket, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BlogPost: React.FC = () => {

	return (
		<div className="max-w-4xl mx-auto p-8 text-white leading-relaxed">


			<h1 className="text-5xl font-bold mb-8">Website Chatbots for Small Businesses</h1>

			<p className="text-xl text-gray-100 mb-12 leading-relaxed">
				In today's digital world, small businesses are embracing website chatbots to revolutionize their customer service. These AI-powered assistants provide 24/7 support, boost sales, and enhance customer experience—all while reducing costs.
			</p>

			<h2 className="text-4xl font-semibold mb-6">What Are Website Chatbots?</h2>
			<p className="text-lg text-gray-100 mb-12 leading-relaxed">
				Website chatbots are smart virtual assistants that use AI to communicate with your customers in real-time. They handle everything from answering FAQs to processing orders, making customer service effortless and efficient.
			</p>

			<h2 className="text-4xl font-semibold mb-6">Key Benefits</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
				<div className="flex items-start bg-gray-800 p-6 rounded-lg">
					<FaClock className="text-4xl text-blue-500 mr-4" />
					<div>
						<h3 className="text-2xl font-semibold mb-2">24/7 Support</h3>
						<p className="text-gray-100">Always available to help your customers, even after hours.</p>
					</div>
				</div>
				<div className="flex items-start bg-gray-800 p-6 rounded-lg">
					<FaChartLine className="text-4xl text-blue-500 mr-4" />
					<div>
						<h3 className="text-2xl font-semibold mb-2">Cost-Effective</h3>
						<p className="text-gray-100">Save money while scaling your customer service capabilities.</p>
					</div>
				</div>
				<div className="flex items-start bg-gray-800 p-6 rounded-lg">
					<FaHandsHelping className="text-4xl text-blue-500 mr-4" />
					<div>
						<h3 className="text-2xl font-semibold mb-2">Better Engagement</h3>
						<p className="text-gray-100">Create interactive experiences that keep customers coming back.</p>
					</div>
				</div>
				<div className="flex items-start bg-gray-800 p-6 rounded-lg">
					<FaRocket className="text-4xl text-blue-500 mr-4" />
					<div>
						<h3 className="text-2xl font-semibold mb-2">Increased Sales</h3>
						<p className="text-gray-100">Convert more visitors into customers with instant support.</p>
					</div>
				</div>
			</div>

			<h2 className="text-4xl font-semibold mb-6">Looking Ahead</h2>
			<p className="text-lg text-gray-100 mb-12 leading-relaxed">
				The future of chatbots is exciting, with advances in AI making them even more capable. Investing in a chatbot today means staying ahead of the competition and preparing your business for tomorrow.
			</p>

			<div className="text-gray-400 italic text-lg">
				Published on February 13, 2025
			</div>
		</div>
	);
};

export default BlogPost;