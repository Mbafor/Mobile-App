import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createCV, deleteCV, duplicateCV, getUserCVs, updateCV } from '@/lib/cv';
import type { CV } from '@/types/domain/cv';

export function useUserCVs() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const listKey = queryKeys.cv.list(userId);

  const query = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getUserCVs(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: listKey });

  const createMutation = useMutation({
    mutationFn: async (title?: string) => {
      if (!userId) throw new Error(t('cvBuilder.errors.notSignedIn'));
      const { data, error } = await createCV(userId, title ?? t('cvBuilder.myCvDefault'));
      if (error) throw error;
      return data!;
    },
    onSuccess: () => void invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (cvId: string) => {
      const { error } = await deleteCV(cvId);
      if (error) throw error;
    },
    onMutate: async (cvId: string) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previousCVs = queryClient.getQueryData<CV[]>(listKey);
      queryClient.setQueryData<CV[]>(listKey, (old) => (old ?? []).filter((cv) => cv.id !== cvId));
      return { previousCVs };
    },
    onError: (_err, _cvId, context) => {
      if (context?.previousCVs !== undefined) {
        queryClient.setQueryData(listKey, context.previousCVs);
      }
    },
    onSettled: () => void invalidate(),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: { userId: string; cv: Parameters<typeof duplicateCV>[1] }) => {
      const { data, error } = await duplicateCV(source.userId, source.cv);
      if (error) throw error;
      return data!;
    },
    onSuccess: () => void invalidate(),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ cvId, title }: { cvId: string; title: string }) => {
      const { data, error } = await updateCV(cvId, { title });
      if (error) throw error;
      return data!;
    },
    onMutate: async ({ cvId, title }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previousCVs = queryClient.getQueryData<CV[]>(listKey);
      queryClient.setQueryData<CV[]>(listKey, (old) =>
        (old ?? []).map((cv) => (cv.id === cvId ? { ...cv, title } : cv)),
      );
      return { previousCVs };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCVs !== undefined) {
        queryClient.setQueryData(listKey, context.previousCVs);
      }
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cv.detail(data.id) });
    },
    onSettled: () => void invalidate(),
  });

  return {
    cvs: query.data ?? [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    createCV: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteCV: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    duplicateCV: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
    renameCV: renameMutation.mutateAsync,
    isRenaming: renameMutation.isPending,
    userId,
  };
}
