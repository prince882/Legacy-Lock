import React, { useState } from 'react';
import { X, Zap, Coins, Send, Users, } from 'lucide-react';
import NeonButton from '@/components/ui/Escrow/NeonButton';
import { useMutationFucntions } from '../program-data-access';
import { PublicKey } from '@solana/web3.js';

interface EscrowPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const EscrowPopup: React.FC<EscrowPopupProps> = ({ isOpen, onClose }) => {
  const { createEscrowForSol, CreateEscrowForToken } = useMutationFucntions()
  const [timeType, SetTimeType] = useState<'day' | 'week' | 'month' | 'year' | 'minutes' | 'seconds'>('day');
  const [paymentType, setPaymentType] = useState<'sol' | 'token'>('sol');
  const [formData, setFormData] = useState({
    beneficiaryAddress: '',
    amount: '',
    tokenMintAddress: '',
    interval: '',
    id: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    try {
      const map = {
        "seconds": 1,
        "minutes": 60,
        "hours": 3600,
        "day": 3600 * 24,
        "week": 3600 * 24 * 7,
        "month": 3600 * 24 * 30,
        "year": 3600 * 24 * 365
      }
      if (paymentType === 'sol') {
        await createEscrowForSol.mutateAsync({
          id: formData.id,
          beneficiary: new PublicKey(formData.beneficiaryAddress.trim()),
          interval: Number(formData.interval) * map[timeType],
          amount: Number(formData.amount),
        });
      } else if (paymentType === 'token') {
        await CreateEscrowForToken.mutateAsync({
          id: formData.id,
          beneficiary: new PublicKey(formData.beneficiaryAddress.trim()),
          tokenMint: new PublicKey(formData.tokenMintAddress.trim()),
          interval: Number(formData.interval) * map[timeType],
          amount: Number(formData.amount)
        })
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed    inset-0 z-50 flex items-center justify-center p-2  ">
      {/* Backdrop */}
      <div
        className="absolute inset-0  bg-black bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative overflow-scroll overflow-x-clip max-h-[93vh] m-3 w-full max-w-lg bg-gray-900 rounded-xl border border-cyan-400/50 shadow-2xl shadow-cyan-400/10 animate-[fadeIn_0.3s_ease-out] ">
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur opacity-10" />

        <div className="relative bg-gray-900 rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Add Escrow Beneficiary
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Type Toggle */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
                Payment Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('sol')}
                  className={`flex-1 p-3 rounded-lg border transition-all duration-300 group ${paymentType === 'sol'
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-gray-600 hover:border-cyan-400/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Zap className={`w-5 h-5 transition-all duration-300 ${paymentType === 'sol' ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                      }`} />
                    <span className={`font-medium transition-all duration-300 ${paymentType === 'sol' ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                      }`}>
                      SOL
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('token')}
                  className={`flex-1 p-3 rounded-lg border transition-all duration-300 group ${paymentType === 'token'
                    ? 'border-purple-400 bg-purple-400/10'
                    : 'border-gray-600 hover:border-purple-400/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Coins className={`w-5 h-5 transition-all duration-300 ${paymentType === 'token' ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
                      }`} />
                    <span className={`font-medium transition-all duration-300 ${paymentType === 'token' ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
                      }`}>
                      TOKEN
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Beneficiary Address */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
                  Beneficiary Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.beneficiaryAddress}
                    onChange={(e) => handleInputChange('beneficiaryAddress', e.target.value)}
                    placeholder="Enter wallet address..."
                    className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all duration-300 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Token Mint Address (only for token) */}
              {paymentType === 'token' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-purple-300 uppercase tracking-wide">
                    Token Mint Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.tokenMintAddress}
                      onChange={(e) => handleInputChange('tokenMintAddress', e.target.value)}
                      placeholder="Enter token mint address..."
                      className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <label className={`text-sm font-medium uppercase tracking-wide ${paymentType === 'sol' ? 'text-cyan-300' : 'text-purple-300'
                  }`}>
                  Amount ({paymentType.toUpperCase()})
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder={`Enter ${paymentType.toUpperCase()} amount...`}
                  className={`w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm ${paymentType === 'sol'
                    ? 'focus:border-cyan-400'
                    : 'focus:border-purple-400'
                    }`}
                  required
                />
              </div>

              {/* Interval */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-pink-300 uppercase tracking-wide">
                  Enter Interval In                 {timeType === 'day' ? 'Days' : timeType === 'month' ? 'Months' : timeType === 'seconds' ? 'Seconds' : timeType === 'year' ? 'Years' : 'Minutes'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(e) => handleInputChange('interval', e.target.value)}
                  placeholder="Enter interval in days..."
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-all duration-300 text-sm"
                  required
                />
              </div>
            </div>
            <NeonButton onClick={() => {
              SetTimeType('day')
            }}>Day</NeonButton>
            <NeonButton onClick={() => {
              SetTimeType('month')
            }}>Month</NeonButton>
            <NeonButton onClick={() => {
              SetTimeType('seconds')
            }}>Seconds</NeonButton>
            <NeonButton onClick={() => {
              SetTimeType('minutes')
            }}>Minutes</NeonButton>
            <NeonButton onClick={() => {
              SetTimeType('year')
            }}>Year</NeonButton>
            <div className="space-y-2">
              <label className="text-md font-medium text-pink-300   tracking-wide">
                Enter Id For The Escrow - Unique Identifier (A Random Number) For Each Escrow 
              </label>
              <input
                type="number"
                min="1"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="Enter A Random Unique Number"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-all duration-300 text-sm"
                required
              />
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Create Escrow
              </button>
            </div>
            <div className="p-3 bg-black text-yellow-400 font-medium text-sm border-l-4 border-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.7),0_0_16px_rgba(250,204,21,0.5)]">
              Note: Phantom or any other wallet might not show the correct amount of SOL involved in the transaction.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EscrowPopup;
