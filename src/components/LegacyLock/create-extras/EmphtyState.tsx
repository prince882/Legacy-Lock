import { Shield, Sparkles } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="text-center py-20 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-800/70 to-gray-700/30 backdrop-blur-xl border border-cyan-500/25 rounded-xl mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Shield className="w-10 h-10 text-cyan-400" />
          <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          No escrows yet
        </h3>
        
        <p className="text-gray-400 max-w-md mx-auto text-base leading-relaxed mb-6">
          Create your first escrow to securely lock assets for your beneficiaries.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span>Ready to secure your legacy</span>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
}
