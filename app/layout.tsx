import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import AuthSync from "@/components/auth-sync";
import SuppressHydrationWarning from "@/components/suppress-hydration-warning";
import { LocaleProvider } from "@/context/locale-context";
import { Toaster } from "sonner";
import StyledJsxRegistry from "@/lib/registry";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  let isBlocked = false;

  if (userId && !pathname.startsWith("/api")) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isBlocked: true }
      });
      isBlocked = !!user?.isBlocked;
    } catch (error) {
      console.error("Database connection error in RootLayout:", error);
      // In case of DB error, we default to not blocked to keep the site partially functional 
      // or at least not crash the layout. 
      isBlocked = false; 
    }
    
    if (isBlocked && pathname !== "/blocked") {
      redirect("/blocked");
    }
  }

  if (isBlocked) {
    return (
      <ClerkProvider>
        <LocaleProvider>
          <html lang="uz" suppressHydrationWarning>
            <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <main className="flex min-h-screen items-center justify-center">{children}</main>
                <Toaster position="top-center" richColors />
              </ThemeProvider>
            </body>
          </html>
        </LocaleProvider>
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider>
      <LocaleProvider>
        <html lang="uz" suppressHydrationWarning>
          <head>
            {/* Blocking script to suppress extension-injected hydration mismatches before React loads */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    // Patch console.error to silence hydration warnings
                    const origError = console.error;
                    console.error = function() {
                      const args = Array.from(arguments);
                      const msg = args.map(a => String(a)).join(" ");
                      
                      const skipPatterns = [
                        /bis_skin_checked/i,
                        /Hydration.*match/i,
                        /extra attributes/i,
                        /did not match/i
                      ];
                      
                      const isExtensionRelated = skipPatterns.some(p => p.test(msg)) && (msg.includes("bis_") || msg.includes("skin"));
                      
                      if (isExtensionRelated) return;
                      
                      origError.apply(console, args);
                    };

                    // MutationObserver to remove injected attributes before hydration
                    if (typeof MutationObserver !== 'undefined') {
                      const observer = new MutationObserver((mutations) => {
                        for (let i = 0; i < mutations.length; i++) {
                          const mutation = mutations[i];
                          if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                            mutation.target.removeAttribute('bis_skin_checked');
                          }
                          if (mutation.addedNodes) {
                            for (let j = 0; j < mutation.addedNodes.length; j++) {
                              const node = mutation.addedNodes[j];
                              if (node.nodeType === 1) {
                                if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                                const nested = node.querySelectorAll('[bis_skin_checked]');
                                for (let k = 0; k < nested.length; k++) nested[k].removeAttribute('bis_skin_checked');
                              }
                            }
                          }
                        }
                      });
                      observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                    }
                  })();
                `,
              }}
            />
          </head>
          <body
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <StyledJsxRegistry>
                <div suppressHydrationWarning className="flex min-h-screen flex-col relative z-10">
                  <Navbar />
                  <AuthSync />
                  <Toaster position="top-center" richColors />
                  <main className="flex-1">{children}</main>
                </div>
              </StyledJsxRegistry>
            </ThemeProvider>
          </body>
        </html>
      </LocaleProvider>
    </ClerkProvider>
  );
}
