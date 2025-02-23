import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SubscriptionTier } from '@/lib/subscription';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isActive?: boolean;
  onSubscribe?: () => void;
}

export function SubscriptionCard({ tier, isActive, onSubscribe }: SubscriptionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 ${
        isActive 
          ? 'border-blue-500 dark:border-blue-400' 
          : 'border-transparent'
      }`}
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
        <div className="text-3xl font-bold">
          {tier.price === 0 ? 'Бесплатно' : `${tier.price.toLocaleString()} ₸`}
          {tier.price > 0 && <span className="text-sm text-gray-500">/месяц</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        <li className="flex items-center gap-2">
          {tier.max_products === -1 ? (
            <Check size={20} className="text-green-500" />
          ) : (
            <span className="text-blue-500 font-medium">{tier.max_products}</span>
          )}
          <span>
            {tier.max_products === -1 
              ? 'Неограниченное количество товаров' 
              : `${tier.max_products} товаров`}
          </span>
        </li>
        <li className="flex items-center gap-2">
          {tier.max_contact_methods === -1 ? (
            <Check size={20} className="text-green-500" />
          ) : (
            <span className="text-blue-500 font-medium">{tier.max_contact_methods}</span>
          )}
          <span>
            {tier.max_contact_methods === -1
              ? 'Все контактные методы'
              : `${tier.max_contact_methods} контактных метода`}
          </span>
        </li>
        <li className="flex items-center gap-2">
          {tier.max_banners > 0 ? (
            <Check size={20} className="text-green-500" />
          ) : (
            <X size={20} className="text-red-500" />
          )}
          <span>
            {tier.max_banners > 0
              ? `${tier.max_banners} рекламных баннера`
              : 'Без рекламных баннеров'}
          </span>
        </li>
        {tier.features.can_store_contacts && (
          <li className="flex items-center gap-2">
            <Check size={20} className="text-green-500" />
            <span>Хранение до {tier.features.can_store_contacts} контактов</span>
          </li>
        )}
      </ul>

      <button
        onClick={onSubscribe}
        disabled={isActive}
        className={`w-full py-2 rounded-xl font-medium ${
          isActive
            ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
        }`}
      >
        {isActive ? 'Активен' : 'Выбрать план'}
      </button>
    </motion.div>
  );
}