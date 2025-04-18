import { useContext } from "react";
import Header from "./Header";
import { ThemeContext } from "../context/ThemeContext";

const LandingPage = () => {
    const { darkMode } = useContext(ThemeContext);

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
            <Header />
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className={`text-5xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'} mb-4`}>QwerVego</h1>
                    <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Smart Medical Device Tracking System</p>
                </div>

                <div className={`max-w-3xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
                    <div className="space-y-8">
                        <div>
                            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>How It Works</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center p-4">
                                    <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-[#3a5a78]/10'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <span className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'}`}>1</span>
                                    </div>
                                    <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Scan QR Code</h3>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Scan the QR code on your medical device</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-[#3a5a78]/10'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <span className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'}`}>2</span>
                                    </div>
                                    <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Register Device</h3>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enter your contact information</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-[#3a5a78]/10'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <span className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'}`}>3</span>
                                    </div>
                                    <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Stay Protected</h3>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your device can now be returned if lost</p>
                                </div>
                            </div>
                        </div>

                        <div className={`border-t ${darkMode ? 'border-gray-700' : ''} pt-8`}>
                            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Features</h2>
                            <ul className="grid md:grid-cols-2 gap-4">
                                <li className="flex items-start space-x-3">
                                    <svg className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span className={darkMode ? 'text-gray-300' : ''}>Easy device registration</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <svg className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span className={darkMode ? 'text-gray-300' : ''}>Instant contact information</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <svg className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span className={darkMode ? 'text-gray-300' : ''}>Secure data storage</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <svg className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span className={darkMode ? 'text-gray-300' : ''}>24/7 accessibility</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
