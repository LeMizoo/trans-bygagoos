import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { FleetTypeCardProps } from './types';

const FleetTypeCard: React.FC<FleetTypeCardProps> = ({
  type,
  onClick,
  isSelected = false,
  showFeatures = false
}) => {
  const Icon = type.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(type.id)}
      className={`
        relative cursor-pointer rounded-xl p-6 transition-all duration-300
        ${isSelected 
          ? 'bg-indigo-50 border-2 border-indigo-600 shadow-lg' 
          : 'bg-white border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 bg-indigo-600 rounded-full p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`
        inline-flex items-center justify-center p-3 rounded-lg mb-4
        ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}
      `}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.label}</h3>
      <p className="text-gray-600 text-sm mb-4">{type.description}</p>
      {showFeatures && (
        <div className="space-y-2 mb-4">
          {[
            'Gestion des conducteurs',
            'Suivi des véhicules',
            'Statistiques en temps réel',
            type.id === 'TAXI_MOTO' ? 'Optimisation des courses' : 'Planification des trajets'
          ].map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}
      <div className={`
        flex items-center justify-between mt-4 pt-4 border-t
        ${isSelected ? 'border-indigo-200' : 'border-gray-200'}
      `}>
        <span className="text-sm font-medium text-gray-500">
          {type.available ? 'Disponible' : 'Bientôt disponible'}
        </span>
        <span className={`
          inline-flex items-center text-sm font-medium
          ${isSelected ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}
        `}>
          {isSelected ? 'Sélectionné' : 'Choisir'}
          <ArrowRight className="ml-1 h-4 w-4" />
        </span>
      </div>
    </motion.div>
  );
};

export default FleetTypeCard;
