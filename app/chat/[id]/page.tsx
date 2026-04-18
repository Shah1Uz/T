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
    <div className="w-full h-[calc(100dvh-68px)] md:container md:px-4 md:py-4 overflow-hidden flex flex-col">
      <div className="flex-1 flex bg-card md:rounded-[24px] md:border border-border md:shadow-xl overflow-hidden min-h-0">
        <div className="hidden md:block w-[350px] border-r border-border bg-muted/30 flex flex-col transition-all min-h-0 shrink-0">
          <ChatSidebar chats={allChatsWithListing} currentUserId={userId} activeChatId={chat.id} />
        </div>
        <div className="flex-1 flex flex-col bg-card min-h-0">
          <MessageArea chat={chatWithListing} currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
