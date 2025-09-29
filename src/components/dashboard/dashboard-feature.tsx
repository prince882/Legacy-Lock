import { Shield, Users, Clock, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router';

export default function DashboardFeature() {
  return (
    <div className="min-h-screen  text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Secure Digital Legacy Management</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                Protect Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Digital Legacy
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Ensure your crypto assets reach the right people. Add trusted beneficiaries and maintain regular check-ins to secure your digital inheritance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={"/create"}>
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105">
                  Launch App
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="px-8 py-4 border border-gray-600 rounded-full font-semibold text-lg hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Add Beneficiaries</h3>
                <p className="text-gray-400 leading-relaxed">
                  Securely designate trusted individuals who will inherit your digital assets when the time comes.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Regular Check-ins</h3>
                <p className="text-gray-400 leading-relaxed">
                  Maintain active status through periodic check-ins to prove you're still in control of your assets.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Secure Protocol</h3>
                <p className="text-gray-400 leading-relaxed">
                  Built on Solana  with smart contracts ensuring your legacy is protected and executed properly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Start Building Your Digital Legacy
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Start your legacy today with Legacy Lock and Add your Beneficiary for the future.
            </p>
            <Link to={"/create"}>
              <button className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105">
                Get Started Today
                <ArrowRight className="inline-block ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Legacy Lock
              </span>
            </div>
            <p className="text-gray-500 text-center md:text-right">
              Securing digital legacies for the future
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
