import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/expo';
import { createClerkSupabaseClient } from './supabase';
import { icons, IconKey } from '@/constants/icons';
import dayjs from 'dayjs';

const DOMAIN_MAP: Record<string, string> = {
  'prime': 'amazon.com',
  'amazon prime': 'amazon.com',
  'prime video': 'amazon.com',
  'primevideo': 'amazon.com',
  'apple music': 'apple.com',
  'applemusic': 'apple.com',
  'apple tv': 'apple.com',
  'apple tv+': 'apple.com',
  'apple one': 'apple.com',
  'icloud': 'apple.com',
  'icloud+': 'apple.com',
  'netflix': 'netflix.com',
  'hulu': 'hulu.com',
  'disney+': 'disneyplus.com',
  'disney plus': 'disneyplus.com',
  'disney': 'disneyplus.com',
  'hbo max': 'max.com',
  'max': 'max.com',
  'hbo': 'max.com',
  'spotify': 'spotify.com',
  'youtube premium': 'youtube.com',
  'youtube music': 'music.youtube.com',
  'youtube': 'youtube.com',
  'chatgpt': 'openai.com',
  'chatgpt plus': 'openai.com',
  'openai': 'openai.com',
  'claude': 'anthropic.com',
  'anthropic': 'anthropic.com',
  'gemini': 'gemini.google.com',
  'gemini advanced': 'gemini.google.com',
  'google one': 'one.google.com',
  'google workspace': 'workspace.google.com',
  'google': 'google.com',
  'microsoft 365': 'microsoft365.com',
  'office 365': 'office.com',
  'microsoft': 'microsoft.com',
  'midjourney': 'midjourney.com',
  'github': 'github.com',
  'github copilot': 'github.com',
  'adobe': 'adobe.com',
  'adobe creative cloud': 'adobe.com',
  'canva': 'canva.com',
  'canva pro': 'canva.com',
  'notion': 'notion.so',
  'dropbox': 'dropbox.com',
  'figma': 'figma.com',
  'slack': 'slack.com',
  'twitter': 'twitter.com',
  'x': 'twitter.com',
  'instagram': 'instagram.com',
  'facebook': 'facebook.com',
  'meta': 'meta.com',
  'linkedin': 'linkedin.com',
  'tinder': 'tinder.com',
  'bumble': 'bumble.com',
  'duolingo': 'duolingo.com',
  'coursera': 'coursera.org',
  'new york times': 'nytimes.com',
  'nytimes': 'nytimes.com',
  'wsj': 'wsj.com',
  'wall street journal': 'wsj.com',
  'medium': 'medium.com',
  'playstation plus': 'playstation.com',
  'xbox game pass': 'xbox.com',
  'nintendo switch online': 'nintendo.com',
  'peacock': 'peacocktv.com',
  'paramount+': 'paramountplus.com',
  'paramount plus': 'paramountplus.com',
  'crunchyroll': 'crunchyroll.com',
  '1password': '1password.com',
  'lastpass': 'lastpass.com',
  'nordvpn': 'nordvpn.com',
  'expressvpn': 'expressvpn.com',
  'twitch': 'twitch.tv',
  'discord': 'discord.com',
  'zoom': 'zoom.us',
  'patreon': 'patreon.com',
  'evernote': 'evernote.com',
  'todoist': 'todoist.com',
  'grammarly': 'grammarly.com',
  'strava': 'strava.com',
  'myfitnesspal': 'myfitnesspal.com',
  'peloton': 'onepeloton.com',
  'headspace': 'headspace.com',
  'calm': 'calm.com',
  'masterclass': 'masterclass.com',
  'audible': 'audible.com',
  'kindle unlimited': 'amazon.com',
  'kindle': 'amazon.com',
  'instacart': 'instacart.com',
  'doordash': 'doordash.com',
  'dashpass': 'doordash.com',
  'uber one': 'uber.com',
  'uber': 'uber.com',
  'ubereats': 'ubereats.com'
};

const getDomainFromName = (name: string) => {
  const normalized = (name || '').toLowerCase().trim();
  if (DOMAIN_MAP[normalized]) return DOMAIN_MAP[normalized];
  
  for (const [key, domain] of Object.entries(DOMAIN_MAP)) {
    if (normalized.includes(key)) {
      return domain;
    }
  }

  return `${normalized.replace(/\s+/g, '')}.com`;
};

interface SubscriptionsContextType {
  subscriptions: any[];
  addSubscription: (sub: any) => Promise<boolean>;
  updateSubscription: (id: string, updates: any) => Promise<boolean>;
  isLoading: boolean;
  refreshSubscriptions: () => Promise<void>;
  globalCurrency: string;
  setGlobalCurrency: (currency: string) => void;
  deleteSubscription: (id: string) => Promise<boolean>;
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
            paymentMethod: sub.paymentMethod || sub.payment_method,
            renewalDate: updatedRenewalDate,
            icon: sub.icon_name && sub.icon_name !== 'wallet' && icons[sub.icon_name as IconKey] 
              ? icons[sub.icon_name as IconKey] 
              : { uri: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromName(sub.name)}&size=128` },
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
        // Try snake_case if camelCase is not found
        const fallback1 = await supabase
          .from('subscriptions')
          .insert([{ ...subToInsert, payment_method: paymentMethod, user_id: userId }])
          .select()
          .single();
          
        if (fallback1.error && fallback1.error.code === 'PGRST204') {
          console.warn("Column 'paymentMethod' and 'payment_method' not found. Inserting without it. Please add this column in Supabase.");
          const fallback2 = await supabase
            .from('subscriptions')
            .insert([{ ...subToInsert, user_id: userId }])
            .select()
            .single();
          
          data = fallback2.data;
          error = fallback2.error;
        } else {
          data = fallback1.data;
          error = fallback1.error;
        }
      }

      if (error) throw error;
      
      if (data) {
        const addedSub = {
          ...data,
          paymentMethod: data.paymentMethod || data.payment_method || paymentMethod,
          icon: data.icon_name && data.icon_name !== 'wallet' && icons[data.icon_name as IconKey]
            ? icons[data.icon_name as IconKey]
            : { uri: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromName(data.name)}&size=128` },
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

  const deleteSubscription = async (id: string): Promise<boolean> => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return false;

      const supabase = createClerkSupabaseClient(token);
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete subscription', err);
      return false;
    }
  };

  const updateSubscription = async (id: string, updates: any): Promise<boolean> => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return false;

      const supabase = createClerkSupabaseClient(token);
      
      const { paymentMethod, icon, ...updatesToUpdate } = updates;
      
      let { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updatesToUpdate, paymentMethod })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const fallback1 = await supabase
          .from('subscriptions')
          .update({ ...updatesToUpdate, payment_method: paymentMethod })
          .eq('id', id)
          .select()
          .single();
          
        if (fallback1.error) {
          console.warn("Column 'paymentMethod' and 'payment_method' not found. Updating without it.");
          const fallback2 = await supabase
            .from('subscriptions')
            .update(updatesToUpdate)
            .eq('id', id)
            .select()
            .single();
            
          if (fallback2.error) throw fallback2.error;
          data = fallback2.data;
        } else {
          data = fallback1.data;
        }
      }
      
      if (data) {
        setSubscriptions(prev => prev.map(sub => {
          if (sub.id === id) {
            return {
              ...sub,
              ...data,
              paymentMethod: data.paymentMethod || data.payment_method || paymentMethod || sub.paymentMethod,
              icon: data.icon_name && data.icon_name !== 'wallet' && icons[data.icon_name as IconKey]
                ? icons[data.icon_name as IconKey]
                : { uri: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromName(data.name || sub.name)}&size=128` },
            };
          }
          return sub;
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update subscription', err);
      return false;
    }
  };

  return (
    <SubscriptionsContext.Provider value={{ 
      subscriptions, 
      addSubscription, 
      updateSubscription,
      isLoading,
      refreshSubscriptions: fetchSubscriptions,
      globalCurrency,
      setGlobalCurrency,
      deleteSubscription
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
