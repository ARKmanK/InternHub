import { useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { QueryClient } from '@tanstack/react-query';

const useSupabaseSubscriptions = (userId: number | null, queryClient: QueryClient) => {
  useEffect(() => {
    const tasksChannel = supabase.channel('tasks-changes');
    tasksChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      })
      .subscribe();

    return () => {
      tasksChannel.unsubscribe();
      supabase.removeChannel(tasksChannel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('user-tasks-changes');
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.new.is_favorite) queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
          if (payload.new.is_started) queryClient.invalidateQueries({ queryKey: ['started', userId] });
          if (payload.new.is_finished) queryClient.invalidateQueries({ queryKey: ['finished', userId] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.new.is_favorite !== payload.old.is_favorite)
            queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
          if (payload.new.is_started !== payload.old.is_started)
            queryClient.invalidateQueries({ queryKey: ['started', userId] });
          if (payload.new.is_finished !== payload.old.is_finished)
            queryClient.invalidateQueries({ queryKey: ['finished', userId] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.old.is_favorite) queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
          if (payload.old.is_started) queryClient.invalidateQueries({ queryKey: ['started', userId] });
          if (payload.old.is_finished) queryClient.invalidateQueries({ queryKey: ['finished', userId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};

export default useSupabaseSubscriptions;