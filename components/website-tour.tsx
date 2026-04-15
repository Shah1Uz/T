"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useLocale } from "@/context/locale-context";

export default function WebsiteTour() {
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem("hasSeenWebsiteTour");
    
    if (!hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { 
            element: "#tour-logo", 
            popover: { 
              title: locale === "uz" ? "Xush kelibsiz!" : "Добро пожаловать!", 
              description: locale === "uz" ? "UY SELL platformasiga xush kelibsiz. Bu yerda siz ko'chmas mulk e'lonlarini topishingiz yoki o'zingiznikini joylashtirishingiz mumkin." : "Добро пожаловать на платформу UY SELL. Здесь вы можете найти объявления о недвижимости или разместить свое.", 
              side: "bottom", 
              align: "start" 
            } 
          },
          { 
            element: "#tour-search", 
            popover: { 
              title: locale === "uz" ? "Qidiruv" : "Поиск", 
              description: locale === "uz" ? "Yangi uylar, ikkilamchi bozor yoki xarita orqali qidiruvni shu yerdan tanlashingiz mumkin." : "Здесь вы можете выбрать поиск новых домов, вторичного рынка или поиск на карте.", 
              side: "bottom", 
              align: "start" 
            } 
          },
          { 
            element: "#tour-hero-search", 
            popover: { 
              title: locale === "uz" ? "Tezkor qidiruv" : "Быстрый поиск", 
              description: locale === "uz" ? "Asosiy qidiruv paneli orqali kerakli hudud va mulk turini tezda toping." : "Быстро найдите нужный регион и тип недвижимости через основную панель поиска.", 
              side: "top", 
              align: "center" 
            } 
          },
          { 
            element: "#tour-services", 
            popover: { 
              title: locale === "uz" ? "Xizmatlar" : "Сервисы", 
              description: locale === "uz" ? "Tariflar va top sotuvchilar haqida ma'lumot olish bo'limi." : "Раздел информации о тарифах и топовых продавцах.", 
              side: "bottom", 
              align: "start" 
            } 
          },
          { 
            element: "#tour-add-listing", 
            popover: { 
              title: locale === "uz" ? "E'lon berish" : "Разместить объявление", 
              description: locale === "uz" ? "O'z ko'chmas mulkingizni sotish yoki ijaraga berish uchun e'lon qo'shing." : "Добавьте объявление, чтобы продать или сдать в аренду свою недвижимость.", 
              side: "bottom", 
              align: "center" 
            } 
          },
          { 
            element: "#tour-language", 
            popover: { 
              title: locale === "uz" ? "Tilni tanlash" : "Выбор языка", 
              description: locale === "uz" ? "O'zingizga qulay tilni (O'zbek yoki Rus) tanlang." : "Выберите удобный для вас язык (Узбекский или Русский).", 
              side: "bottom", 
              align: "center" 
            } 
          },
          { 
            element: "#tour-theme", 
            popover: { 
              title: locale === "uz" ? "Tungi/Kunduzgi rejim" : "Темный/Светлый режим", 
              description: locale === "uz" ? "Ko'zingizni asrash uchun tungi rejimga o'tishingiz mumkin." : "Вы можете переключиться на темный режим, чтобы поберечь глаза.", 
              side: "bottom", 
              align: "center" 
            } 
          },
          { 
            element: "#tour-notifications", 
            popover: { 
              title: locale === "uz" ? "Bildirishnomalar" : "Уведомления", 
              description: locale === "uz" ? "Yangi xabarlar va muhim yangiliklardan xabardor bo'ling." : "Будьте в курсе новых сообщений и важных новостей.", 
              side: "bottom", 
              align: "center" 
            } 
          },
        ],
        onDestroyStarted: () => {
          localStorage.setItem("hasSeenWebsiteTour", "true");
          driverObj.destroy();
        }
      });

      // Small delay to ensure everything is rendered
      setTimeout(() => {
        driverObj.drive();
      }, 2000);
    }
  }, [locale]);

  if (!mounted) return null;

  return null;
}
