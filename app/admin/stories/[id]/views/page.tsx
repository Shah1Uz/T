import { getStoryViewsAction, getStoryLikesAction } from "@/server/actions/story.action";
import { ChevronLeft, Calendar, Clock, User as UserIcon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

interface StoryViewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryViewsPage({ params }: StoryViewsPageProps) {
  const { id } = await params;
  const { views = [] } = await getStoryViewsAction(id);
  const { likes = [] } = await getStoryLikesAction(id);

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link href="/admin/stories">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Analitika</h2>
          <p className="text-muted-foreground font-medium">Ushbu hikoya bo'yicha barcha faolliklar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Ko'rganlar ({views.length})
          </h3>
          <div className="bg-white dark:bg-gray-900 border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-border">
                  {views.map((view: any) => (
                    <tr key={view.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border">
                            {view.user.imageUrl ? <img src={view.user.imageUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 m-auto mt-2 text-muted-foreground" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{view.user.name || "Noma'lum"}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{new Date(view.viewedAt).toLocaleTimeString('uz-UZ')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {views.length === 0 && <tr><td className="px-6 py-10 text-center text-muted-foreground font-medium small">Hali ko'rilmagan</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Likes Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2 text-red-500">
            <Heart className="w-5 h-5 fill-red-500" />
            Yoqtirganlar ({likes.length})
          </h3>
          <div className="bg-white dark:bg-gray-900 border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-border">
                  {likes.map((like: any) => (
                    <tr key={like.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border">
                            {like.user.imageUrl ? <img src={like.user.imageUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 m-auto mt-2 text-muted-foreground" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{like.user.name || "Noma'lum"}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{new Date(like.createdAt).toLocaleTimeString('uz-UZ')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {likes.length === 0 && <tr><td className="px-6 py-10 text-center text-muted-foreground font-medium small">Hali like bosilmagan</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
