import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as commentsApi from "../api/comments";

export const useCommentsQuery = (publicationId) => {
  return useQuery(
    ["comments", publicationId],
    async () => {
      const data = await commentsApi.fetchComments(publicationId);
      // El backend devuelve la lista directamente
      return Array.isArray(data) ? data : data;
    },
    {
      enabled: !!publicationId,
      staleTime: 1000 * 60 * 1, // 1 minuto
    }
  );
};

export const useCommentMutations = (publicationId) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    (payload) => commentsApi.createComment(publicationId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", publicationId]);
      },
    }
  );

  const deleteMutation = useMutation(
    (commentId) => commentsApi.deleteComment(publicationId, commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", publicationId]);
      },
    }
  );

  return {
    createComment: createMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
  };
};

export default useCommentMutations;
