"use client";

import { useState, useRef, useEffect } from "react";

// ============================================================
// ⚙️ CONFIGURATION — PAGE B (Lead-gen, no prices)
// ============================================================

type Lang = "zh" | "he";
type BikeId = "quicker" | "orka";

const IMAGES = {
  quicker: "/bikes/quicker-rs.jpg",
  orka: "/bikes/orka.jpg",
};

const BIKES: Record<BikeId, {
  name: string;
  range: string;
  battery: string;
  motor: string;
  recommended: boolean;
}> = {
  quicker: {
    name: "QUICKER RS",
    range: "35-45",
    battery: "48V 13Ah",
    motor: "500W",
    recommended: false,
  },
  orka: {
    name: "ORKA FAT TIRE",
    range: "65-80",
    battery: "48V 21Ah",
    motor: "750W",
    recommended: true,
  },
};

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwa_-87L0XHa0-QLMO2L2QAtOIFg_Gne3lfzsS1KJVk9jvPGg-gJl6wrUYMbdABd60-/exec";

// ============================================================
// 🌐 TRANSLATIONS — PAGE B
// ============================================================

const BIKE_TEXT: Record<Lang, Record<BikeId, {
  displayName: string;
  tag: string;
  shortDesc: string;
  longDesc: string;
  idealFor: string;
  wheels: string;
  weight: string;
}>> = {
  zh: {
    quicker: {
      displayName: "QUICKER RS - 标准款",
      tag: "城市通勤的聪明选择",
      shortDesc: "轻便、灵活、可靠。适合每天上下班骑行。",
      longDesc: "6061铝合金轻量车架，20英寸镁合金轮毂配3.0宽胎。机械碟刹，液压前减震，禧玛诺7速变速，LCD数字显示屏。可折叠方便存放。",
      idealFor: "每天通勤40公里以内，铺装道路，追求轻便快速的骑手",
      wheels: "镁合金 3.0\"",
      weight: "24公斤",
    },
    orka: {
      displayName: "ORKA - 高级款",
      tag: "工地之王 · 最受欢迎",
      shortDesc: "强劲、远程、稳定。专为工地和越野打造。",
      longDesc: "加固6061铝合金车架，4.5英寸宽胎什么路都能走 — 沙地、泥地、石子路。液压油碟刹，全减震（前+后），禧玛诺6速变速。超大21Ah电池，续航可达80公里。",
      idealFor: "建筑工地，越野路面，50公里以上长途，体重较大的骑手",
      wheels: "宽胎 4.5\"",
      weight: "29.5公斤",
    },
  },
  he: {
    quicker: {
      displayName: "QUICKER RS - דגם סטנדרט",
      tag: "הבחירה החכמה לנסיעות עירוניות",
      shortDesc: "קל, זריז ואמין. מושלם למי שנוסע כל יום לעבודה וחזרה.",
      longDesc: "שלדת אלומיניום 6061 קלת משקל, גלגלי מגנזיום 20 אינץ׳ עם צמיגי 3.0. בלמי דיסק מכניים, שיכוך קדמי הידראולי, 7 הילוכי שימנו ותצוגת LCD דיגיטלית. מתקפל לאחסון קל.",
      idealFor: "נסיעות יומיומיות עד 40 ק\"מ, כבישים סלולים, רוכבים שמחפשים אופניים קלים ומהירים",
      wheels: "מגנזיום 3.0\"",
      weight: "24 ק\"ג",
    },
    orka: {
      displayName: "ORKA - דגם פרימיום",
      tag: "סוס העבודה · הנבחר ביותר",
      shortDesc: "עוצמה, טווח ויציבות. נבנה לאתרי בנייה ושטח.",
      longDesc: "שלדת אלומיניום 6061 מחוזקת, גלגלי בלון רחבים 4.5 אינץ׳ שעוברים על כל שטח — חול, בוץ, אבנים. בלמי שמן הידראוליים, שיכוך מלא (קדמי + אחורי), 6 הילוכי שימנו. סוללת ענק 21Ah.",
      idealFor: "אתרי בנייה, שבילי שטח, נסיעות ארוכות מעל 50 ק\"מ, רוכבים כבדים, מי שרוצה את הטוב ביותר",
      wheels: "בלון 4.5\"",
      weight: "29.5 ק\"ג",
    },
  },
};

const UI = {
  zh: {
    // Sticky timer
    stickyTimer: "📦 本周专属价格 — 仅剩：",
    // Hero
    heroBadge: "仅限内部 · 名额有限",
    heroTitle1: "电动自行车",
    heroTitle2: "专属内部价",
    heroTitle3: "不对外公开",
    heroSub1: "我们跟以色列最大的进口商谈下了工人专属的特别价格。",
    heroSub2: "价格太低，只能直接告诉你。留下联系方式，2小时内给你报价。",
    timerLabel: "📦 本周专属价格 — 仅剩：",
    days: "天",
    hours: "时",
    minutes: "分",
    seconds: "秒",
    freeDelivery: "免费送货",
    warranty: "一年保修",
    licensingHelp: "协助上牌",
    // Problem
    problemTitle: "⚠️ 几十名工人已经被坑 — 只因为省了₪500买便宜车",
    problem1Title: "便宜车 = 半路抛锚",
    problem1Desc: "一天不能上班 = 损失₪800-2,000。还要跟老板解释 — 你怎么说？",
    problem2Title: "没保修 — 坏了自己掏钱",
    problem2Desc: "电机烧了？电池坏了？没保修你要自己出₪500-1,500。",
    problem3Title: "没黄牌 — 罚款₪1,000",
    problem3Desc: "以色列警察会开罚单。没牌照没头盔 = 几千₪罚款。",
    problem4Title: "今天骑，明天想卖",
    problem4Desc: "半年后可能换工地或回国。好车能卖出去拿回钱。便宜车 — 没人要。",
    // Solution
    solutionTitle: "✅ 为什么选我们？",
    sol1Title: "送货上门",
    sol1Desc: "4个工作日送到家门口。",
    sol2Title: "一年保修",
    sol2Desc: "除了扎胎以外 — 我们负责。",
    sol3Title: "维修中心",
    sol3Desc: "全以色列几十个维修中心。",
    sol4Title: "协助上牌",
    sol4Desc: "我们帮你搞定全部流程。",
    sol5Title: "保值转卖",
    sol5Desc: "知名品牌，想卖有人买。",
    sol6Title: "专属价格",
    sol6Desc: "连以色列人都拿不到的价格。",
    // Bikes
    bikesTitle: "🚲 两款精选车型 — 工人和专家都推荐",
    recommendedBanner: "⭐ 最受欢迎 — 双倍续航，最大动力",
    idealForLabel: "特别适合：",
    specRange: "续航",
    specBattery: "电池",
    specMotor: "电机",
    specWheels: "轮胎",
    specWeight: "重量",
    specFoldable: "可折叠",
    foldableYes: "是 ✓",
    km: "公里",
    exclusivePrice: "专属报价",
    exclusivePriceDesc: "留下联系方式即可获取",
    btnSelect: "我想了解这款 →",
    btnSelected: "✓ 已选择",
    // Extras
    extrasTitle: "🎁 我们还提供",
    // Form
    formTitle: "📱 留下联系方式 — 2小时内给你专属报价",
    formDesc: "填好信息，我们马上联系你。报价包含：车价 + 安全套餐 + 上牌服务，一次搞定。",
    formName: "姓名",
    formNamePlaceholder: "请输入你的名字",
    formPhoneIsrael: "以色列电话",
    formPhoneChina: "中国电话（如果有）",
    formPhoneNote: "至少填一个能联系到你的电话",
    formLocation: "送货地址",
    formLocationShare: "📍 点这里分享位置",
    formLocationSaved: "📍 位置已保存：",
    formLocationError: "浏览器不支持位置分享",
    formLocationManual: "或输入地址 / 工地名称...",
    formBikeLabel: "你对哪款车感兴趣？",
    formBikePlaceholder: "选择车型...",
    formBikeNotSure: "还没决定，都想了解",
    btnSubmit: "获取专属报价 →",
    btnNoPhone: "← 请先填写联系方式",
    formPostSubmit: "我们会在2小时内电话联系你",
    // Sticky bar
    barSubmit: "获取专属报价 →",
    // Success
    successTitle: "收到！",
    successDesc: "我们会在2小时内联系你，给你专属报价。包含车价、安全套餐和上牌服务 — 全部一次搞定。",
    successBike: "感兴趣的车型：",
    successBack: "返回首页",
    // Footer
    footer: "🇮🇱 以色列中国工人电动自行车服务",
  },
  he: {
    stickyTimer: "📦 מחיר בלעדי השבוע — נגמר בעוד:",
    heroBadge: "מחיר פנימי · מקומות מוגבלים",
    heroTitle1: "אופניים חשמליים",
    heroTitle2: "מחיר פנימי בלעדי",
    heroTitle3: "שלא מפורסם בשום מקום",
    heroSub1: "השגנו מחיר מיוחד מהיבואן הכי גדול בישראל — מחיר כל כך טוב שאנחנו לא יכולים לפרסם אותו.",
    heroSub2: "השאר פרטים ונחזור אליך תוך שעתיים עם הצעת מחיר.",
    timerLabel: "📦 מחיר בלעדי השבוע — נגמר בעוד:",
    days: "ימים",
    hours: "שעות",
    minutes: "דקות",
    seconds: "שניות",
    freeDelivery: "משלוח חינם",
    warranty: "אחריות שנה",
    licensingHelp: "עזרה ברישוי",
    problemTitle: "⚠️ עשרות פועלים כבר נתקעו — רק כי חסכו 500 ₪ באופניים",
    problem1Title: "אופניים זולים = נתקעת באמצע הדרך",
    problem1Desc: "הפסד יום עבודה = הפסד של ₪800-2,000. ובעיות עם הבוס.",
    problem2Title: "בלי אחריות — כל תקלה מהכיס שלך",
    problem2Desc: "מנוע שנשרף? סוללה שמתה? בלי אחריות אתה משלם 500-1,500 ₪.",
    problem3Title: "בלי לוחית צהובה — קנס של ₪1,000",
    problem3Desc: "משטרת ישראל נותנת קנסות. בלי רישוי ובלי קסדה = אלפי שקלים.",
    problem4Title: "היום אתה רוכב, מחר תרצה למכור",
    problem4Desc: "בעוד חצי שנה אולי תעבור אתר. אופניים איכותיות — תמכור. זולות — אף אחד לא ירצה.",
    solutionTitle: "✅ למה דווקא אצלנו?",
    sol1Title: "משלוח עד אליך",
    sol1Desc: "תוך 4 ימי עסקים עד הדלת.",
    sol2Title: "שנה אחריות",
    sol2Desc: "כל תקלה חוץ מפנצ׳רים — אנחנו מטפלים.",
    sol3Title: "מרכזי שירות",
    sol3Desc: "עשרות מרכזי שירות ברחבי הארץ.",
    sol4Title: "עזרה ברישוי",
    sol4Desc: "אנחנו מטפלים בכל התהליך.",
    sol5Title: "ערך מכירה חוזרת",
    sol5Desc: "מותגים מוכרים עם ביקוש בשוק.",
    sol6Title: "מחיר בלעדי",
    sol6Desc: "מחירים שאפילו ישראלים לא מצליחים להשיג.",
    bikesTitle: "🚲 שני דגמים מובילים — מומלצים ע״י פועלים ומומחים",
    recommendedBanner: "⭐ הנבחר ביותר — טווח כפול, עוצמה מקסימלית",
    idealForLabel: "מתאים במיוחד ל:",
    specRange: "טווח",
    specBattery: "סוללה",
    specMotor: "מנוע",
    specWheels: "גלגלים",
    specWeight: "משקל",
    specFoldable: "מתקפל",
    foldableYes: "כן ✓",
    km: "ק״מ",
    exclusivePrice: "מחיר בלעדי",
    exclusivePriceDesc: "השאר פרטים ונשלח לך",
    btnSelect: "מעניין אותי ←",
    btnSelected: "✓ נבחר",
    extrasTitle: "🎁 גם כולל",
    formTitle: "📱 השאר פרטים — תוך שעתיים נחזור עם הצעת מחיר",
    formDesc: "מלא פרטים ואנחנו חוזרים אליך. ההצעה כוללת: מחיר אופניים + חבילת בטיחות + רישוי, הכל במכה אחת.",
    formName: "שם מלא",
    formNamePlaceholder: "הכנס את שמך",
    formPhoneIsrael: "טלפון ישראלי",
    formPhoneChina: "טלפון סיני (אם יש)",
    formPhoneNote: "צריך לפחות מספר אחד שזמין בו",
    formLocation: "מיקום למשלוח",
    formLocationShare: "📍 לחץ כאן לשתף מיקום",
    formLocationSaved: "📍 מיקום נשמר: ",
    formLocationError: "הדפדפן לא תומך בשיתוף מיקום",
    formLocationManual: "או הקלד כתובת / שם אתר בנייה...",
    formBikeLabel: "איזה דגם מעניין אותך?",
    formBikePlaceholder: "בחר דגם...",
    formBikeNotSure: "עוד לא החלטתי, רוצה לשמוע על שניהם",
    btnSubmit: "קבל הצעת מחיר ←",
    btnNoPhone: "← מלא מספר טלפון קודם",
    formPostSubmit: "נחזור אליך תוך שעתיים",
    barSubmit: "קבל הצעת מחיר ←",
    successTitle: "קיבלנו!",
    successDesc: "נחזור אליך תוך שעתיים עם הצעת מחיר. כולל מחיר אופניים, חבילת בטיחות ורישוי — הכל בשיחה אחת.",
    successBike: "דגם שמעניין:",
    successBack: "חזרה לדף הראשי",
    footer: "🇮🇱 שירות אופניים חשמליים לעובדים סינים בישראל",
  },
} as const;

// ============================================================
// WEEKLY COUNTDOWN TIMER
// ============================================================

function useWeeklyCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getTimeUntilSunday() {
      const now = new Date();
      const israelTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
      const day = israelTime.getDay();
      const daysUntilSunday = day === 0 ? 7 : 7 - day;
      const endOfWeek = new Date(israelTime);
      endOfWeek.setDate(israelTime.getDate() + daysUntilSunday);
      endOfWeek.setHours(0, 0, 0, 0);

      const diff = endOfWeek.getTime() - israelTime.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }

    setTimeLeft(getTimeUntilSunday());
    const interval = setInterval(() => setTimeLeft(getTimeUntilSunday()), 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// ============================================================
// PAGE B COMPONENT
// ============================================================

export default function PageB() {
  const [lang, setLang] = useState<Lang>("zh");
  const [selectedBike, setSelectedBike] = useState<BikeId | null>(null);
  const [name, setName] = useState("");
  const [phoneIsrael, setPhoneIsrael] = useState("");
  const [phoneChina, setPhoneChina] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [timerSticky, setTimerSticky] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const timer = useWeeklyCountdown();

  const t = UI[lang];
  const bt = BIKE_TEXT[lang];
  const isRTL = lang === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const grad = isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "he";
  }, [lang, dir]);

  useEffect(() => {
    const el = timerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTimerSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!phoneIsrael.trim() && !phoneChina.trim())) return;
    setSubmitting(true);

    const orderData = {
      name: name.trim(),
      phoneIsrael: phoneIsrael.trim(),
      phoneChina: phoneChina.trim(),
      location: location.trim(),
      bike: selectedBike ? BIKES[selectedBike].name : lang === "zh" ? "未定" : "לא בטוח",
      bikePrice: 0,
      bundle: false,
      bundlePrice: 0,
      licensing: false,
      licensingPrice: 0,
      total: 0,
      source: "page-b",
    };

    console.log("📋 Lead:", orderData);

    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
      } catch {
        // no-cors — data is sent
      }
    } else {
      await new Promise((r) => setTimeout(r, 1200));
    }

    setSubmitting(false);
    setSuccess(true);
  };

  // ── Success Screen ──
  if (success) {
    return (
      <main dir={dir} className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-sm w-full text-center animate-fade-up">
          <div className="text-6xl mb-5">✅</div>
          <h1 className="text-2xl font-bold text-white mb-3">{t.successTitle}</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            {t.successDesc}
          </p>
          {selectedBike && (
            <div className="bg-neutral-950 rounded-xl p-4 mb-6">
              <p className="text-sm text-neutral-400">
                {t.successBike} <span className="text-white font-bold">{bt[selectedBike].displayName}</span>
              </p>
            </div>
          )}
          <button
            onClick={() => { setSuccess(false); setSelectedBike(null); setName(""); setPhoneIsrael(""); setPhoneChina(""); setLocation(""); }}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {t.successBack}
          </button>
        </div>
      </main>
    );
  }

  // ── Main Page ──
  return (
    <main dir={dir} className="min-h-screen bg-neutral-950 text-white pb-28">

      {/* ━━━ STICKY TIMER BAR ━━━ */}
      {timerSticky && (
        <div className="fixed top-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-xl border-b border-amber-500/30 z-50 py-3 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="text-xs font-bold text-amber-400">{t.stickyTimer}</span>
            </div>
            <div dir="ltr" className="flex justify-center gap-2">
              {[timer.days, timer.hours, timer.minutes, timer.seconds].map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-amber-500 text-xl font-bold">:</span>}
                  <div className="bg-neutral-800 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
                    <span className="text-lg font-black text-amber-400 tabular-nums">{String(val).padStart(2, "0")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HERO — Exclusive Offer Hook
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-neutral-950/80 to-neutral-950" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-600/15 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 px-5 pt-10 pb-8 max-w-lg mx-auto">

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "zh" ? "he" : "zh")}
            className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-20 bg-neutral-900/80 backdrop-blur border border-neutral-700 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-neutral-800 transition-colors`}
          >
            {lang === "zh" ? "🇮🇱 עברית" : "🇨🇳 中文"}
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-5 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {t.heroBadge}
          </div>

          <h1 className="text-3xl font-black mb-3 leading-tight animate-fade-up-delay-1">
            {t.heroTitle1}
            <br />
            <span className={`text-transparent bg-clip-text ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-amber-400 to-amber-600`}>
              {t.heroTitle2}
              <br />{t.heroTitle3}
            </span>
          </h1>

          <p className="text-sm text-neutral-400 mt-4 leading-relaxed animate-fade-up-delay-2">
            {t.heroSub1}
            <br />
            <span className="text-amber-300 font-medium">{t.heroSub2}</span>
          </p>

          {/* CTA button */}
          <button
            onClick={scrollToForm}
            className={`w-full mt-6 ${grad} from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base py-4 rounded-xl shadow-lg transition-all animate-fade-up-delay-2 flex items-center justify-center gap-2`}
          >
            {t.barSubmit}
          </button>

          {/* Countdown Timer */}
          <div ref={timerRef} className="mt-6 bg-neutral-900/80 border border-amber-500/20 rounded-xl p-4 animate-fade-up-delay-3">
            <p className="text-xs text-amber-400 font-bold mb-1 text-center">{t.timerLabel}</p>
            <div dir="ltr" className="flex justify-center gap-3">
              <TimerUnit value={timer.days} label={t.days} />
              <span className="text-amber-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.hours} label={t.hours} />
              <span className="text-amber-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.minutes} label={t.minutes} />
              <span className="text-amber-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.seconds} label={t.seconds} />
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-6 animate-fade-up-delay-3">
            <TrustBadge icon="🚚" text={t.freeDelivery} />
            <TrustBadge icon="🛡️" text={t.warranty} />
            <TrustBadge icon="📋" text={t.licensingHelp} />
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
            <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
            {lang === "zh" ? (
              <>已有 <span className="text-amber-400 font-bold">47</span> 位工人选择了我们</>
            ) : (
              <>כבר <span className="text-amber-400 font-bold">47</span> עובדים בחרו אצלנו</>
            )}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. THE PROBLEM
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-black text-white mb-2">{t.problemTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">
          {lang === "zh" ? (
            <>我们跟几十个买了便宜车的工人聊过。<span className="text-red-400 font-bold">他们都付出了惨痛代价：</span></>
          ) : (
            <>דיברנו עם עשרות עובדים שקנו אופניים זולים. <span className="text-red-400 font-bold">כולם שילמו על זה ביוקר:</span></>
          )}
        </p>
        <div className="space-y-3">
          <ProblemCard icon="💥" title={t.problem1Title} desc={t.problem1Desc} />
          <ProblemCard icon="💸" title={t.problem2Title} desc={t.problem2Desc} />
          <ProblemCard icon="👮" title={t.problem3Title} desc={t.problem3Desc} />
          <ProblemCard icon="🗑️" title={t.problem4Title} desc={t.problem4Desc} />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. OUR SOLUTION
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-black text-white mb-2">{t.solutionTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">
          {lang === "zh" ? (
            <>我们直接跟<span className="text-white font-bold">官方进口商</span>合作，拿到了连以色列人都拿不到的条件：</>
          ) : (
            <>עבדנו ישירות עם <span className="text-white font-bold">היבואן הרשמי</span> — מחירים ותנאים שאפילו ישראלים לא מצליחים להשיג:</>
          )}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <SolutionCard icon="🚚" title={t.sol1Title} desc={t.sol1Desc} />
          <SolutionCard icon="🛡️" title={t.sol2Title} desc={t.sol2Desc} />
          <SolutionCard icon="🔧" title={t.sol3Title} desc={t.sol3Desc} />
          <SolutionCard icon="📋" title={t.sol4Title} desc={t.sol4Desc} />
          <SolutionCard icon="💰" title={t.sol5Title} desc={t.sol5Desc} />
          <SolutionCard icon="🏷️" title={t.sol6Title} desc={t.sol6Desc} />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. THE BIKES — No Prices
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-black text-white mb-1">{t.bikesTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">
          {lang === "zh" ? (
            <>质量好、可靠、有完整保修。<span className="text-amber-400 font-medium">留下联系方式，我们发给你专属价格。</span></>
          ) : (
            <>אופניים איכותיות, אמינות, עם אחריות מלאה. <span className="text-amber-400 font-medium">השאר פרטים ונשלח לך מחיר בלעדי.</span></>
          )}
        </p>

        <div className="space-y-5">
          {(["quicker", "orka"] as BikeId[]).map((id) => {
            const bike = BIKES[id];
            const bikeText = bt[id];
            const selected = selectedBike === id;
            return (
              <div
                key={id}
                onClick={() => setSelectedBike(id)}
                className={`relative bg-neutral-900 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  selected
                    ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                    : bike.recommended
                      ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                      : "border-neutral-800 active:border-neutral-600"
                }`}
              >
                {bike.recommended && (
                  <div className={`${grad} from-amber-500 to-amber-600 text-black text-xs font-bold px-4 py-2 text-center`}>
                    {t.recommendedBanner}
                  </div>
                )}

                <div className="h-56 bg-neutral-800/50 flex items-center justify-center overflow-hidden">
                  {imgError[id] ? (
                    <div className="text-neutral-600 text-center">
                      <div className="text-5xl mb-2">🚲</div>
                    </div>
                  ) : (
                    <img
                      src={IMAGES[id]}
                      alt={bike.name}
                      className="w-full h-full object-contain p-4"
                      onError={() => setImgError((prev) => ({ ...prev, [id]: true }))}
                    />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-xl font-black text-white">{bikeText.displayName}</h3>
                      <p className="text-xs text-amber-400 font-medium mt-0.5">{bikeText.tag}</p>
                    </div>
                    {selected && (
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-neutral-300 mt-3 leading-relaxed">{bikeText.shortDesc}</p>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{bikeText.longDesc}</p>

                  <div className="mt-3 bg-neutral-950/50 rounded-lg p-3">
                    <p className="text-[10px] text-amber-400/80 font-medium mb-1">{t.idealForLabel}</p>
                    <p className="text-xs text-neutral-400">{bikeText.idealFor}</p>
                  </div>

                  <div dir="ltr" className="grid grid-cols-3 gap-2 mt-4 mb-4">
                    <SpecChip label={t.specRange} value={`${bike.range} ${t.km}`} />
                    <SpecChip label={t.specBattery} value={bike.battery} />
                    <SpecChip label={t.specMotor} value={bike.motor} />
                    <SpecChip label={t.specWheels} value={bikeText.wheels} />
                    <SpecChip label={t.specWeight} value={bikeText.weight} />
                    <SpecChip label={t.specFoldable} value={t.foldableYes} />
                  </div>

                  {/* Exclusive Price — instead of showing actual price */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-lg font-black text-amber-400">🔒 {t.exclusivePrice}</p>
                    <p className="text-xs text-neutral-400 mt-1">{t.exclusivePriceDesc}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedBike(id); scrollToForm(); }}
                    className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      selected
                        ? "bg-amber-500 text-black"
                        : bike.recommended
                          ? `${grad} from-amber-500 to-amber-600 text-black`
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {selected ? t.btnSelected : t.btnSelect}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. EXTRAS — Brief mention
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-10">
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-3">{t.extrasTitle}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛡️</span>
              <p className="text-sm text-neutral-400">
                {lang === "zh"
                  ? "安全套餐 — 头盔 + 10mm链条锁 + 铝合金手机支架（打包特价）"
                  : "חבילת בטיחות — קסדה + מנעול 10 מ\"מ + מעמד טלפון (מחיר חבילה מיוחד)"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🟡</span>
              <p className="text-sm text-neutral-400">
                {lang === "zh"
                  ? "黄牌上牌服务 — 我们帮你搞定全部流程"
                  : "רישוי לוחית צהובה — אנחנו מטפלים בכל התהליך"
                }
              </p>
            </div>
            <p className="text-xs text-amber-400 font-medium mt-2">
              {lang === "zh"
                ? "详情在报价中一起发给你 👇"
                : "פרטים מלאים בהצעת המחיר 👇"
              }
            </p>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. LEAD-GEN FORM
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={formRef} id="lead-form" className="px-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-black text-white mb-2">{t.formTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">{t.formDesc}</p>

        <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-2xl border border-amber-500/20 p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formName}</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.formNamePlaceholder}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formPhoneIsrael}</label>
            <input type="tel" value={phoneIsrael} onChange={(e) => setPhoneIsrael(e.target.value)} placeholder="05X-XXXXXXX" inputMode="tel" dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-left" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formPhoneChina}</label>
            <input type="tel" value={phoneChina} onChange={(e) => setPhoneChina(e.target.value)} placeholder="+86 XXX-XXXX-XXXX" inputMode="tel" dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-left" />
            <p className="text-[10px] text-neutral-600 mt-1">{t.formPhoneNote}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formLocation}</label>
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  setLocation(t.formLocationError);
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (pos) => setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
                  () => setLocation(""),
                );
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm transition-all hover:border-amber-500/50 flex items-center justify-between"
            >
              {location ? (
                <span className="text-emerald-400 font-medium">{t.formLocationSaved}{location}</span>
              ) : (
                <span className="text-neutral-500">{t.formLocationShare}</span>
              )}
              <span className="text-xs text-neutral-600">GPS</span>
            </button>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.formLocationManual}
              className="w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formBikeLabel}</label>
            <select
              value={selectedBike || ""}
              onChange={(e) => setSelectedBike(e.target.value as BikeId || null)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none"
            >
              <option value="">{t.formBikeNotSure}</option>
              <option value="quicker">{bt.quicker.displayName}</option>
              <option value="orka">{bt.orka.displayName} ⭐</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || (!phoneIsrael.trim() && !phoneChina.trim())}
            className={`w-full ${grad} from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-neutral-700 disabled:to-neutral-700 text-black font-bold text-lg py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (!phoneIsrael.trim() && !phoneChina.trim()) ? (
              t.btnNoPhone
            ) : (
              <>{t.btnSubmit}</>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-600">
            {t.formPostSubmit}
          </p>
        </form>
      </section>

      {/* ━━━ STICKY BOTTOM BAR ━━━ */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 px-4 py-3 z-50"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={scrollToForm}
            disabled={submitting}
            className={`w-full ${grad} from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.25)] pulse-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {t.barSubmit}
          </button>
        </div>
      </div>

      {/* ━━━ FOOTER ━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12 mb-4">
        <div className="text-center text-xs text-neutral-600 space-y-1">
          <p>{t.footer}</p>
          <p className="text-neutral-700 mt-3">© 2026</p>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-neutral-800 rounded-lg w-12 h-12 flex items-center justify-center">
        <span className="text-xl font-black text-amber-400 tabular-nums">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-[9px] text-neutral-600 mt-1 block">{label}</span>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl py-2.5 px-1.5 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-[10px] font-bold text-neutral-200 leading-tight">{text}</div>
    </div>
  );
}

function ProblemCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 flex gap-3">
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-red-300">{title}</h3>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SolutionCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3.5 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-xs font-bold text-white mb-1">{title}</h3>
      <p className="text-[10px] text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-950/50 rounded-lg px-2 py-2 text-center">
      <div className="text-[9px] text-neutral-500 mb-0.5">{label}</div>
      <div className="text-[11px] font-medium text-neutral-300">{value}</div>
    </div>
  );
}
