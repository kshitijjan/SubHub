import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/expo';
import { createClerkSupabaseClient } from './supabase';
import { icons, IconKey } from '@/constants/icons';
import dayjs from 'dayjs';

interface SubscriptionsContextType {
  subscriptions: any[];
  addSubscription: (sub: any) => Promise<boolean>;
  isLoading: boolean;
  refreshSubscriptions: () => Promise<void>;
  globalCurrency: string;
  setGlobalCurrency: (currency: string) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

export const SubscriptionsProvider = ({ children }: { children: ReactNode }) => {
  const { getToken, userId } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalCurrency, setGlobalCurrency] = useState('INR');

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const token = await getToken({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
      }

      if (data) {
        const now = dayjs();
        
        // Map icon string from DB to actual icon object and handle renewal date rollover
        const mappedData = data.map(sub => {
          let updatedRenewalDate = sub.renewalDate;
          
          if (updatedRenewalDate && dayjs(updatedRenewalDate).isBefore(now, 'day')) {
            let renewalDayjs = dayjs(updatedRenewalDate);
            
            // Roll forward until it is today or in the future
            while (renewalDayjs.isBefore(now, 'day')) {
              if (sub.billing?.toLowerCase() === 'yearly') {
                renewalDayjs = renewalDayjs.add(1, 'year');
              } else {
                renewalDayjs = renewalDayjs.add(1, 'month');
              }
            }
            updatedRenewalDate = renewalDayjs.toISOString();
            
            // Fire-and-forget update to Supabase to persist the new renewal date
            supabase
              .from('subscriptions')
              .update({ renewalDate: updatedRenewalDate })
              .eq('id', sub.id)
              .then(({ error }) => {
                if (error) console.error("Error updating rolled-forward renewal date:", error);
              });
          }

          return {
            ...sub,
            renewalDate: updatedRenewalDate,
            icon: icons[sub.icon_name as IconKey] || icons.home, // Fallback icon
          };
        });
        setSubscriptions(mappedData);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
      setIsLoading(false);
    }
  }, [userId, getToken]);

  const addSubscription = async (newSub: any): Promise<boolean> => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return false;

      const supabase = createClerkSupabaseClient(token);
      
      // We expect newSub to have an icon_name string instead of the icon object when calling this
      const { paymentMethod, ...subToInsert } = newSub;
      
      let { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...newSub, user_id: userId }])
        .select()
        .single();

      if (error && error.code === 'PGRST204') {
        console.warn("Column 'paymentMethod' not found. Inserting without it. Please add this column in Supabase.");
        const fallback = await supabase
          .from('subscriptions')
          .insert([{ ...subToInsert, user_id: userId }])
          .select()
          .single();
        
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      
      if (data) {
        const addedSub = {
          ...data,
          icon: icons[data.icon_name as IconKey] || icons.home,
        };
        setSubscriptions(prev => [addedSub, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add subscription', err);
      return false;
    }
  };

  return (
    <SubscriptionsContext.Provider value={{ 
      subscriptions, 
      addSubscription, 
      isLoading,
      refreshSubscriptions: fetchSubscriptions,
      globalCurrency,
      setGlobalCurrency
    }}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  }
  return context;
};
