import React from "react";
import { FaExternalLinkAlt, FaUser, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

interface Blog {
	id: string;
	title: string;
	author: string;
	date: string;
	excerpt: string;
	link: string;
}

const blogs: Blog[] = [
	{
		id: "1",
		title: "Customer Service Automation For Small Businesses",
		author: "Rahel Gunaratne",
		date: "Jan 15, 2025",
		excerpt: "Discover how website chatbots are revolutionizing customer service automation for small businesses...",
		link: "/blog/customer-service-automation",
	},
];

const BlogsPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">

			{/* Blogs Section */}
			<div className="container mx-auto px-4 pt-16 pb-20">
				<h1 className="text-4xl font-bold text-white mb-8 text-center">Latest Blogs</h1>
				<motion.div
					className="space-y-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{blogs.map((blog) => (
						<motion.div
							key={blog.id}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800/80 transition-all duration-300 cursor-pointer shadow-lg"
							onClick={() => navigate(blog.link)}
						>
							<h2 className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors">
								{blog.title}
							</h2>
							<div className="flex items-center text-gray-400 text-sm mt-2">
								<FaUser className="mr-2" />
								<span>{blog.author}</span>
								<FaCalendarAlt className="ml-4 mr-2" />
								<span>{blog.date}</span>
							</div>
							<p className="text-gray-400 mt-4">{blog.excerpt}</p>
							<div className="flex justify-end mt-4">
								<button className="text-blue-400 hover:text-blue-300 inline-flex items-center transition">
									Read More
									<FaExternalLinkAlt className="ml-2" />
								</button>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>


		</div>
	);
};

export default BlogsPage;