import { useState, FormEvent, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const formStyles = {
    input: `w-full px-4 py-3 mt-2 bg-white/90 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-[#4A5A1E] focus:border-transparent
            placeholder-gray-500 transition-all duration-300 text-gray-800`,
    
    label: `block text-[#2C3612] font-medium`,
    
    button: `w-full bg-gradient-to-r from-[#4A5A1E] to-[#5B6E25] px-4 py-3 
             rounded-lg hover:from-[#3D4A19] hover:to-[#4A5A1E] focus:outline-none 
             focus:ring-2 focus:ring-[#4A5A1E] focus:ring-offset-2 focus:ring-offset-[#A0BF3F]
             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
             font-semibold text-white`,
    
    error: `text-red-700 text-sm text-center mt-2 font-medium`,
    success: `text-green-700 text-sm text-center mt-2 font-medium`
};

const ResetPassword: React.FC = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setError("");
        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setMessage("Password reset successful. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-bold mb-6 text-center">Reset Password</h2>
            <p className="text-center text-gray-700 mb-4">Enter a new password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="newPassword" className={formStyles.label}>New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        className={formStyles.input}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className={formStyles.label}>Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className={formStyles.input}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button type="submit" className={formStyles.button} disabled={loading || !newPassword || !confirmPassword}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </motion.div>

                {message && <div className={formStyles.success}>{message}</div>}
                {error && <div className={formStyles.error}>{error}</div>}
            </form>

            <div className="text-center mt-4">
                <button
                    className="text-blue-600 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>
            </div>
        </motion.div>
    );
};

export default ResetPassword;