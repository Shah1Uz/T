import { newsService } from "@/server/services/news.service";
import NewsClient from "./news-client";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await newsService.getAll();

  return <NewsClient news={news} />;
}
