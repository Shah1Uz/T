import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ChatSidebar from "@/components/chat-sidebar";
import MessageArea from "@/components/message-area";

export default async function ChatDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const chat = await prisma.chat.findUnique({
    where: { id },

    include: {
      messages: { 
        orderBy: { createdAt: "asc" },
        include: { reactions: { include: { user: true } } }
      },
      participants: { include: { user: true } },
      listing: { include: { images: true } },
    } as any,


  });

  if (!chat || !(chat as any).participants.some((p: any) => p.userId === userId)) {
    notFound();
  }


  const allChats = await prisma.chat.findMany({
    where: { participants: { some: { userId } } },
    include: {
      listing: { include: { images: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      participants: { include: { user: true } },
    } as any,


    orderBy: { updatedAt: "desc" } as any,

  });

  // No longer needs placeholders as listing is included
  const chatWithListing = chat;
  const allChatsWithListing = allChats;


  return (
    <div className="container px-0 sm:px-4 py-0 sm:py-6 md:py-10 h-[calc(100svh-64px)] sm:h-[calc(100vh-100px)]">
      <div className="bg-background sm:border rounded-none sm:rounded-2xl h-full flex overflow-hidden shadow-none sm:shadow-sm">
        <div className="hidden md:block w-80 border-r overflow-y-auto">
          <ChatSidebar chats={allChatsWithListing} currentUserId={userId} activeChatId={chat.id} />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <MessageArea chat={chatWithListing} currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
