import { getAllStoriesAction } from "@/server/actions/story.action";
import Link from "next/link";
import { Plus, Trash2, Calendar, Eye, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStoryAction } from "@/server/actions/story.action";

export default async function AdminStoriesPage() {
  const { stories = [] } = await getAllStoriesAction();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Hikoyalar (Stories)</h2>
          <p className="text-muted-foreground font-medium">Barcha aktiv va o'chgan hikoyalarni boshqarish.</p>
        </div>
        <Button asChild size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20">
          <Link href="/admin/stories/new">
            <Plus className="w-5 h-5 mr-2" />
            Yangi Hikoya
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story: any) => {
          const isExpired = new Date(story.expiresAt) < new Date();
          return (
            <div key={story.id} className="group bg-white dark:bg-gray-900 border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative">
              <div className="aspect-[9/16] relative bg-muted flex items-center justify-center overflow-hidden">
                {story.videoUrl ? (
                  <video src={story.videoUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                )}
                
                {isExpired && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Muddati o'tgan</span>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                   {story.videoUrl ? <Video className="w-5 h-5 text-white drop-shadow-md" /> : <ImageIcon className="w-5 h-5 text-white drop-shadow-md" />}
                </div>
              </div>

              <div className="p-5 border-t border-border">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(story.createdAt).toLocaleDateString('uz-UZ')}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-primary">
                      <Eye className="w-4 h-4" />
                      {story._count?.views || 0} ta ko'rish
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/admin/stories/${story.id}/views`}>
                      <Button variant="outline" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary transition-colors h-9 w-9">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteStoryAction(story.id);
                    }}>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {stories.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl bg-white/50 dark:bg-black/20">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Hozircha hikoyalar yo'q</h3>
            <p className="text-muted-foreground mt-2 font-medium">Birinchi hikoyangizni yuklang!</p>
          </div>
        )}
      </div>
    </div>
  );
}
