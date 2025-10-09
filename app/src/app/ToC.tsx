import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const TermsAndConditions: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col bg-white">

			<main className="flex-1 overflow-auto p-4">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold mb-4">Terms and Conditions for WebIndexer</h1>

					<div>
						<p className="mb-4">
							Last updated: 2024-10-08
						</p>

						<p className="mb-4">
							Please read these Terms and Conditions carefully before using the WebIndexer application.
						</p>

						<h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
						<p className="mb-4">
							By accessing or using WebIndexer, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the application.
						</p>

						<h2 className="text-xl font-semibold mb-2">2. Use of the Application</h2>
						<p className="mb-4">
							WebIndexer is a web crawling and indexing application designed for creating website chatbots. You agree to use the application only for its intended purpose and in compliance with all applicable laws and regulations, including respecting websites' robots.txt files and crawling policies.
						</p>

						<h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
						<p className="mb-4">
							You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account, including any web crawling activities performed through our service.
						</p>

						<h2 className="text-xl font-semibold mb-2">4. Content and Data Collection</h2>
						<p className="mb-4">
							By using WebIndexer, you confirm that you have the right to crawl and index the websites you target. You are responsible for ensuring compliance with the target websites' terms of service and obtaining necessary permissions. We store and process the indexed data in accordance with our Privacy Policy.
						</p>

						<h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
						<p className="mb-4">
							The WebIndexer platform, including its software, features, and functionality, is owned by us and protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. The indexed content remains the intellectual property of its original owners.
						</p>

						<h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
						<p className="mb-4">
							WebIndexer and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the application. This includes any damages resulting from the crawling, indexing, or chatbot operations.
						</p>

						<h2 className="text-xl font-semibold mb-2">7. Fair Usage and Rate Limiting</h2>
						<p className="mb-4">
							We reserve the right to implement rate limiting and fair usage policies to ensure service quality for all users. Excessive crawling or API requests may be throttled or blocked.
						</p>

						<h2 className="text-xl font-semibold mb-2">8. Governing Law</h2>
						<p className="mb-4">
							These Terms shall be governed and construed in accordance with the laws of Canada, without regard to its conflict of law provisions.
						</p>

						<h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
						<p className="mb-4">
							We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
						</p>

						<h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
						<p className="mb-4">
							If you have any questions about these Terms, please contact us at:
						</p>
						<p className="mb-4">
							WebIndexer<br />
							Email: info@webindexer.app<br />
						</p>
					</div>
				</div>
			</main>
		</div>
	);
};

export default TermsAndConditions;