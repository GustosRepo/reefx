import { Metadata } from "next";
import { getArticle, getAllArticles } from "../articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://aquaxone.app/learn/${slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      authors: [article.author],
      section: article.category,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.description,
    },
  };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export default function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  // We need to resolve params synchronously in the component for JSON-LD
  // Use a wrapper component that handles the async params
  return <ArticleLayoutInner params={params}>{children}</ArticleLayoutInner>;
}

async function ArticleLayoutInner({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  return (
    <>
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.description,
              datePublished: article.publishedAt,
              author: {
                "@type": "Organization",
                name: article.author,
              },
              publisher: {
                "@type": "Organization",
                name: "AQUAXONE",
                url: "https://aquaxone.app",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://aquaxone.app/learn/${slug}`,
              },
              articleSection: article.category,
            }),
          }}
        />
      )}
      {children}
    </>
  );
}
