import { newsService } from "@/server/services/news.service";
import NewsDetailClient from "./news-detail-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  params: {
    id: string;
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const newsItem = await newsService.getById(params.id);

  if (!newsItem) {
    notFound();
  }

  return <NewsDetailClient newsItem={newsItem} />;
}
