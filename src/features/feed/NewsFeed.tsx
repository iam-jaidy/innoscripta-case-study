import ArticleCard from './ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import useNewsFeedLogic from '@/hooks/useNewsFeedLogic';

const NewsFeed = () => {
  const { articles, state, error, pagination } = useNewsFeedLogic();

  const { isLoading, isError, isEmpty } = state;
  const { hasNextPage, loadMoreRef } = pagination;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-50 w-full rounded-xl lg:h-80" />
            <Skeleton className="h-4 w-62.5" />
            <Skeleton className="h-4 w-50" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
        <p>Something went wrong fetching the news.</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No articles found. Try adjusting your search filters.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((article, idx) => (
          <ArticleCard key={`${article.id}-${idx}`} article={article} />
        ))}
      </div>
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center pt-4 pb-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
