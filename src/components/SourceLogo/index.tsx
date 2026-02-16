type SourceLogoProps = {
  source: string;
  url: string;
};

const SourceLogo = ({ source, url }: SourceLogoProps) => {
  const getDomain = (url: string) => {
    try {
      const { hostname } = new URL(url);
      return hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  const domain = getDomain(url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <div className="flex items-center gap-2">
      <img
        src={faviconUrl}
        alt={`${source} logo`}
        className="h-5 w-5 rounded-sm bg-muted"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <span className="text-sm font-semibold text-muted-foreground">{source}</span>
    </div>
  );
};

export default SourceLogo;
