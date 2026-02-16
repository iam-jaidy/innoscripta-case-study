import type { Article } from '@/api/types';
import SourceLogo from '@/components/SourceLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import DOMPurify from 'dompurify';

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="rounded-md mb-2 aspect-3/2 w-full object-cover"
        />
        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className="text-sm text-muted-foreground mb-4 line-clamp-4"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.description) }}
        />
        <div className="flex justify-between items-center text-sm text-muted-foreground font-semibold mb-4">
          <SourceLogo source={article.source} url={article.url} />
          <div>{formatDate(article.publishedAt)}</div>
        </div>
        <Button className="w-full" size="lg" asChild>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read More
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
