import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export const chatService = {
  async getOrCreateChat(buyerId: string, sellerId: string, listingId: string) {
    // Check if chat already exists for this buyer and listing
    let chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: buyerId } } },
          { participants: { some: { userId: sellerId } } },
        ]
      },
      include: {
        participants: { include: { user: true } },
        messages: true,
      }
    });


    if (!chat) {
      chat = await (prisma.chat as any).create({
        data: {
          listingId,
          participants: {
            create: [
              { userId: buyerId },
              { userId: sellerId }
            ]
          }
        } as any,
        include: {
          participants: { include: { user: true } },
          messages: true,
          listing: { include: { images: true } }
        } as any
      });

    }

    return chat;
  },


  async getUserChats(userId: string) {
    return prisma.chat.findMany({
      where: {
        participants: { some: { userId } }
      },
      include: {
        listing: { include: { images: true } },
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      } as any,


      orderBy: { updatedAt: "desc" } as any

    });
  },

  async getMessages(chatId: string) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: { sender: true }
    });
  },

  async sendMessage(chatId: string, senderId: string, text: string) {
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        text,
      },
      include: { sender: true }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() } as any

    });

    await pusherServer.trigger(`chat-${chatId}`, "new-message", message);

    return message;
  },

  async markAsSeen(chatId: string, userId: string) {
    const result = await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        seen: false,
      },
      data: { seen: true }
    });

    if (result.count > 0) {
      await pusherServer.trigger(`chat-${chatId}`, "messages-seen", { userId });
    }

    return result;
  }
};
