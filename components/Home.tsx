
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">TickerPredict Pro</h1>
                <p className="text-slate-500 text-lg">AI-Powered Market Portfolio Tracker</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Beverages Card */}
                <div
                    onClick={() => navigate('/beverages/ko')}
                    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-bottle-water text-3xl text-red-600"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Beverages</h2>
                        <p className="text-slate-500 mb-6">Track Coca-Cola (KO) performance and predictions.</p>
                        <span className="text-red-600 font-semibold flex items-center gap-2">
                            View Dashboard <i className="fa-solid fa-arrow-right"></i>
                        </span>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-bottle-water text-9xl"></i>
                    </div>
                </div>

                {/* Flights Card */}
                <div
                    onClick={() => navigate('/flights/ezj')}
                    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-plane-departure text-3xl text-orange-600"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Flights</h2>
                        <p className="text-slate-500 mb-6">Track EasyJet (EZJ.L) performance and predictions.</p>
                        <span className="text-orange-600 font-semibold flex items-center gap-2">
                            View Dashboard <i className="fa-solid fa-arrow-right"></i>
                        </span>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-plane-departure text-9xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
