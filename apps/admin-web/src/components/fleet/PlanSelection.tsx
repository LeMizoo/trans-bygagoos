import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { PlanSelectionProps } from './types';

const PlanSelection: React.FC<PlanSelectionProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  type
}) => {
  const getPlanIcon = (planValue: string) => {
    if (planValue === 'GRATUIT' || planValue === 'STANDARD') return <Zap className="h-5 w-5" />;
    if (planValue === '2_5' || planValue === 'PREMIUM') return <Star className="h-5 w-5" />;
    return <Crown className="h-5 w-5" />;
  };

  const getPlanColor = (planValue: string) => {
    if (planValue === 'GRATUIT' || planValue === 'STANDARD') return 'border-gray-300 hover:border-gray-400';
    if (planValue === '2_5' || planValue === 'PREMIUM') return 'border-blue-300 hover:border-blue-500';
    return 'border-purple-300 hover:border-purple-500';
  };

  const getPlanBadge = (planValue: string) => {
    if (planValue === 'GRATUIT' || planValue === 'STANDARD') return null;
    if (planValue === '2_5' || planValue === 'PREMIUM') return '⭐ Populaire';
    return '👑 Premium';
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan, index) => {
        const isSelected = selectedPlan === plan.value;
        const isPopular = plan.value === '2_5' || plan.value === 'PREMIUM';
        const badge = getPlanBadge(plan.value);

        return (
          <motion.div
            key={plan.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPlan(plan.value)}
            className={`
              relative cursor-pointer rounded-xl p-6 transition-all duration-300
              ${isSelected 
                ? 'ring-2 ring-indigo-600 shadow-xl bg-indigo-50' 
                : 'bg-white shadow hover:shadow-lg'
              }
              ${getPlanColor(plan.value)}
              border-2
            `}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  {badge}
                </span>
              </div>
            )}
            {isSelected && (
              <div className="absolute top-3 right-3 bg-indigo-600 rounded-full p-1">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={`
              inline-flex items-center justify-center p-2 rounded-lg mb-4
              ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}
            `}>
              {getPlanIcon(plan.value)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.label}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              {plan.value !== 'GRATUIT' && plan.value !== 'STANDARD' && (
                <span className="text-sm text-gray-500 ml-1">/mois</span>
              )}
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600">
                  <Check className={`
                    h-4 w-4 mr-2 mt-0.5 flex-shrink-0
                    ${isSelected ? 'text-indigo-600' : 'text-green-500'}
                  `} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`
                w-full mt-6 py-2 rounded-lg font-medium transition-colors
                ${isSelected 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {isSelected ? 'Sélectionné ✓' : 'Choisir ce plan'}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlanSelection;
