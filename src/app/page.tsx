"use client";

import { useState, useRef, useEffect } from "react";

// ============================================================
// ⚙️ CONFIGURATION
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
  marketPrice: number;
  price: number;
  recommended: boolean;
}> = {
  quicker: {
    name: "QUICKER RS",
    range: "35-45",
    battery: "48V 13Ah",
    motor: "500W",
    marketPrice: 3600,
    price: 3250,
    recommended: false,
  },
  orka: {
    name: "ORKA FAT TIRE",
    range: "65-80",
    battery: "48V 21Ah",
    motor: "750W",
    marketPrice: 5500,
    price: 4450,
    recommended: true,
  },
};

const BUNDLE_PRICE = 327;
const BUNDLE_TOTAL_SEPARATE = 417;
const LICENSING_PRICE = 189;

// ⬇️ Google Apps Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwa_-87L0XHa0-QLMO2L2QAtOIFg_Gne3lfzsS1KJVk9jvPGg-gJl6wrUYMbdABd60-/exec";

// ============================================================
// 🌐 TRANSLATIONS
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
      longDesc: "6061铝合金轻量车架，20英寸镁合金轮毂配3.0宽胎，抓地力出色。机械碟刹，液压前减震，禧玛诺7速变速，LCD数字显示屏。可折叠方便存放。",
      idealFor: "每天通勤40公里以内，铺装道路，追求轻便快速的骑手",
      wheels: "镁合金 3.0\"",
      weight: "24公斤",
    },
    orka: {
      displayName: "ORKA - 高级款",
      tag: "工地之王 · 最受欢迎",
      shortDesc: "强劲、远程、稳定。专为工地和越野打造。",
      longDesc: "加固6061铝合金车架，4.5英寸宽胎什么路都能走 — 沙地、泥地、石子路。液压油碟刹，全减震（前+后），禧玛诺6速变速。超大21Ah电池，续航可达80公里。",
      idealFor: "建筑工地，越野路面，50公里以上长途，体重较大的骑手，想要最好的",
      wheels: "宽胎 4.5\"",
      weight: "29.5公斤",
    },
  },
  he: {
    quicker: {
      displayName: "QUICKER RS - דגם סטנדרט",
      tag: "הבחירה החכמה לנסיעות עירוניות",
      shortDesc: "קל, זריז ואמין. מושלם למי שנוסע כל יום לעבודה וחזרה.",
      longDesc: "שלדת אלומיניום 6061 קלת משקל, גלגלי מגנזיום 20 אינץ׳ עם צמיגי 3.0 לאחיזה מעולה בכביש. בלמי דיסק מכניים, שיכוך קדמי הידראולי, 7 הילוכי שימנו ותצוגת LCD דיגיטלית. מתקפל לאחסון קל.",
      idealFor: "נסיעות יומיומיות עד 40 ק\"מ, כבישים סלולים, רוכבים שמחפשים אופניים קלים ומהירים",
      wheels: "מגנזיום 3.0\"",
      weight: "24 ק\"ג",
    },
    orka: {
      displayName: "ORKA - דגם פרימיום",
      tag: "סוס העבודה · הנבחר ביותר",
      shortDesc: "עוצמה, טווח ויציבות. נבנה לאתרי בנייה ושטח.",
      longDesc: "שלדת אלומיניום 6061 מחוזקת, גלגלי בלון רחבים 4.5 אינץ׳ שעוברים על כל שטח — חול, בוץ, אבנים. בלמי שמן הידראוליים, שיכוך מלא (קדמי + אחורי), 6 הילוכי שימנו. סוללת ענק 21Ah לטווח של עד 80 ק\"מ.",
      idealFor: "אתרי בנייה, שבילי שטח, נסיעות ארוכות מעל 50 ק\"מ, רוכבים כבדים, מי שרוצה את הטוב ביותר",
      wheels: "בלון 4.5\"",
      weight: "29.5 ק\"ג",
    },
  },
};

const BUNDLE_ITEMS_TEXT: Record<Lang, Array<{ icon: string; name: string; price: number; desc: string }>> = {
  zh: [
    {
      icon: "⛑️",
      name: "以色列标准认证头盔",
      price: 179,
      desc: "法律规定必须戴。不戴头盔罚₪250！工地安全帽骑车不保护头部 — 需要专门的符合以色列标准的头盔。",
    },
    {
      icon: "🔒",
      name: "10mm链条锁",
      price: 149,
      desc: "普通锁是6mm — 小偷10秒就剪断。10mm = 真正的防盗。别省锁的钱。",
    },
    {
      icon: "📱",
      name: "铝合金手机支架",
      price: 89,
      desc: "铝合金，不是廉价塑料。颠簸路面也稳固。导航不用手离把手。",
    },
  ],
  he: [
    {
      icon: "⛑️",
      name: "קסדה מאושרת תקן ישראלי",
      price: 179,
      desc: "חובה לפי החוק. קנס של ₪250 על רכיבה בלי קסדה! קסדת בנייה לא מגנה על הראש ברכיבה — צריך קסדה ייעודית שעומדת בתקן ישראלי.",
    },
    {
      icon: "🔒",
      name: "מנעול שרשרת 10 מ\"מ",
      price: 149,
      desc: "מנעולים רגילים הם 6 מ\"מ — גנב חותך אותם ב-10 שניות. 10 מ\"מ = הגנה אמיתית. אל תחסכו על המנעול.",
    },
    {
      icon: "📱",
      name: "מעמד טלפון מאלומיניום",
      price: 89,
      desc: "אלומיניום, לא פלסטיק זול. נשאר יציב גם בכבישים משובשים. ניווט בלי להוריד ידיים מהכידון.",
    },
  ],
};

const UI = {
  zh: {
    // Sticky timer
    stickyTimer: "📦 库存有限 — 价格将在以下时间后上涨：",
    // Hero
    heroBadge: "库存有限 · 本周末价格上涨",
    heroTitle1: "电动自行车",
    heroTitle2: "连以色列人都买不到",
    heroTitle3: "的超低价格",
    heroSub1: "官方进口商直供。送货上门，一年保修，协助上牌。",
    heroSub2: "全包价。库存有限。没有隐藏费用。",
    timerLabel: "📦 库存有限 — 此价格仅剩：",
    days: "天",
    hours: "时",
    minutes: "分",
    seconds: "秒",
    freeDelivery: "免费送货",
    warranty: "一年保修",
    licensingHelp: "协助上牌",
    socialProof: "已有 {count} 位工人选择了我们",
    // Problem
    problemTitle: "⚠️ 几十名工人已经被坑 — 只因为省了₪500买便宜车",
    problem1Title: "便宜车 = 半路抛锚",
    problem1Desc: "一天不能上班 = 损失₪800-2,000。还要跟老板解释 — 你怎么说？价格差那点钱根本不值得冒险。",
    problem2Title: "没保修 — 坏了自己掏钱",
    problem2Desc: "电机烧了？电池坏了？没保修你要自己出₪500-1,500。而且这种事比你想的来得快得多。",
    problem3Title: "没黄牌 — 罚款₪1,000",
    problem3Desc: "以色列警察会开罚单。没牌照没头盔 = 几千₪罚款。一张罚单比你省下的钱还多。",
    problem4Title: "今天骑，明天想卖",
    problem4Desc: "你现在工地离住处15公里。半年后可能换工地，或者回国。好车能卖出去拿回钱。便宜车 — 没人要。",
    // Solution
    solutionTitle: "✅ 为什么选我们？",
    sol1Title: "送货上门",
    sol1Desc: "4个工作日送到家门口。省你一天工 — 车直接送到你那里。",
    sol2Title: "一年保修",
    sol2Desc: "除了扎胎以外的故障 — 我们负责。不加钱。",
    sol3Title: "维修中心",
    sol3Desc: "全以色列几十个维修中心。随时有地方修。",
    sol4Title: "上牌₪189",
    sol4Desc: "我们把你介绍给合作伙伴。最简单的流程。",
    sol5Title: "保值转卖",
    sol5Desc: "知名品牌，市场有需求。想卖 — 有人买。",
    sol6Title: "超低价格",
    sol6Desc: "连以色列人都拿不到的价格。进口商直供。",
    // Bikes
    bikesTitle: "🚲 我们跟工人和专家都聊过 — 选出了2款车",
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
    save: "节省",
    deliveryNote: "* 含免费送货上门（4个工作日）+ 一年保修",
    btnSelected: "✓ 已选",
    btnSelectPremium: "⭐ 选择高级款",
    btnSelectThis: "选择此款",
    upgradeClick: "点这里升级 →",
    // Bundle
    bundleUrgency: "⚠️ 87%的客户都选了套餐 — 因为他们知道这样省心",
    bundleTitle: "🛡️ 安全套餐 — 每位骑手必备",
    bundleAdded: "✓ 套餐已添加！",
    bundleAdd: "添加安全套餐",
    bundleAddHint: "点这里添加 → 强烈推荐",
    bundleTip: "💡 提示：没买套餐的客户，拿到第一张罚单就后悔了",
    // Licensing
    licensingAdd: "添加上牌服务",
    // Form
    formTitle: "📝 填写信息，提交订单",
    formBikeLabel: "选择车型",
    formBikePlaceholder: "请选择车型...",
    formName: "姓名",
    formNamePlaceholder: "请输入你的名字",
    formPhoneIsrael: "可联系的电话（以色列号码）",
    formPhoneChina: "中国电话（如果有）",
    formPhoneNote: "至少填一个能联系到你的电话 — 以色列的或中国的",
    formLocation: "送货地址",
    formLocationShare: "📍 点这里分享位置",
    formLocationSaved: "📍 位置已保存：",
    formLocationError: "浏览器不支持位置分享",
    formLocationManual: "或输入地址 / 工地名称...",
    orderSummary: "订单摘要",
    orderBundle: "📦 安全套餐",
    orderLicensing: "📋 上牌服务",
    orderDelivery: "🚚 免费送货上门",
    orderFree: "免费！",
    orderTotal: "总计",
    btnSubmit: "提交订单 →",
    btnSelectFirst: "← 请先选择车型",
    formPostSubmit: "提交后，我们会电话联系你确认订单",
    // Sticky bar
    barTotal: "总计",
    barSave: "节省",
    barSubmit: "提交订单 →",
    // Success
    successTitle: "订单提交成功！",
    successBack: "返回首页",
    successTotal: "总计",
    // Footer
    footer: "🇮🇱 以色列中国工人电动自行车服务",
  },
  he: {
    stickyTimer: "📦 מלאי מוגבל — המחיר עולה בעוד:",
    heroBadge: "מלאי מוגבל · המחירים עולים בסוף השבוע",
    heroTitle1: "אופניים חשמליים",
    heroTitle2: "במחיר שאפילו ישראלים",
    heroTitle3: "לא מצליחים להשיג",
    heroSub1: "ישירות מהיבואן הרשמי. משלוח עד הדלת, אחריות שנה, עזרה ברישוי.",
    heroSub2: "הכל כלול. מלאי מוגבל. בלי הפתעות.",
    timerLabel: "📦 מלאי מוגבל — המחיר הזה תקף עוד:",
    days: "ימים",
    hours: "שעות",
    minutes: "דקות",
    seconds: "שניות",
    freeDelivery: "משלוח חינם",
    warranty: "אחריות שנה",
    licensingHelp: "עזרה ברישוי",
    socialProof: "כבר {count} עובדים בחרו אצלנו",
    problemTitle: "⚠️ עשרות פועלים כבר נתקעו — רק כי חסכו 500 ₪ באופניים",
    problem1Title: "אופניים זולים = נתקעת באמצע הדרך",
    problem1Desc: "הפסד יום עבודה = הפסד של ₪800-2,000. ובעיות עם הבוס — לך תספר לו סיפורים. ההפרש במחיר לא שווה את הסיכון.",
    problem2Title: "בלי אחריות — כל תקלה מהכיס שלך",
    problem2Desc: "מנוע שנשרף? סוללה שמתה? בלי אחריות אתה משלם 500-1,500 ₪ מהכיס. וזה קורה הרבה יותר מהר ממה שחושבים.",
    problem3Title: "בלי לוחית צהובה — קנס של ₪1,000",
    problem3Desc: "משטרת ישראל נותנת קנסות. בלי רישוי ובלי קסדה = קנסות של אלפי שקלים. קנס אחד כבר יותר מההפרש במחיר.",
    problem4Title: "היום אתה רוכב, מחר תרצה למכור",
    problem4Desc: "היום אתה עובד 15 ק״מ מהאתר. בעוד חצי שנה אולי תעבור אתר, או תחזור הביתה. אופניים איכותיות — תמכור ותקבל כסף בחזרה. אופניים זולות — אף אחד לא ירצה לקנות.",
    solutionTitle: "✅ למה דווקא אצלנו?",
    sol1Title: "משלוח עד אליך",
    sol1Desc: "תוך 4 ימי עסקים עד הדלת. חוסך לך יום עבודה — האופניים מגיעות אליך.",
    sol2Title: "שנה אחריות",
    sol2Desc: "כל תקלה חוץ מפנצ׳רים — אנחנו מטפלים. בלי תשלום נוסף.",
    sol3Title: "מרכזי שירות",
    sol3Desc: "עשרות מרכזי שירות ברחבי הארץ. תמיד יש לך לאן לפנות.",
    sol4Title: "רישוי ב-₪189",
    sol4Desc: "אנחנו שולחים אותך לשותף שלנו. תהליך הכי קל שיש.",
    sol5Title: "ערך מכירה חוזרת",
    sol5Desc: "מותגים מוכרים עם ביקוש בשוק. כשתרצה למכור — יש קונים.",
    sol6Title: "מחיר שלא תמצא",
    sol6Desc: "מחירים שאפילו ישראלים לא מצליחים להשיג. ישירות מהיבואן.",
    bikesTitle: "🚲 דיברנו עם פועלים ועם המומחים — וריכזנו 2 דגמים",
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
    save: "חוסך",
    deliveryNote: "* כולל משלוח עד הדלת (4 ימי עסקים) + אחריות שנה",
    btnSelected: "✓ נבחר",
    btnSelectPremium: "⭐ בחר את הפרימיום",
    btnSelectThis: "בחר דגם זה",
    upgradeClick: "לחץ כאן לשדרג ←",
    bundleUrgency: "⚠️ 87% מהלקוחות שלנו לוקחים את החבילה — כי הם מבינים שזה חוסך כאב ראש",
    bundleTitle: "🛡️ חבילת בטיחות — חובה לכל רוכב",
    bundleAdded: "✓ חבילה נוספה!",
    bundleAdd: "הוסף חבילת בטיחות",
    bundleAddHint: "לחץ כאן להוסיף ← מומלץ מאוד",
    bundleTip: "💡 טיפ: לקוחות שלא לקחו חבילה התחרטו אחרי הקנס הראשון",
    licensingAdd: "הוסף שירות רישוי",
    formTitle: "📝 מלא פרטים ושלח הזמנה",
    formBikeLabel: "בחירת דגם",
    formBikePlaceholder: "בחר דגם אופניים...",
    formName: "שם מלא",
    formNamePlaceholder: "הכנס את שמך",
    formPhoneIsrael: "טלפון שזמין בו (ישראלי)",
    formPhoneChina: "טלפון סיני (אם יש)",
    formPhoneNote: "צריך לפחות מספר אחד שזמין בו — ישראלי או סיני",
    formLocation: "מיקום למשלוח",
    formLocationShare: "📍 לחץ כאן לשתף מיקום",
    formLocationSaved: "📍 מיקום נשמר: ",
    formLocationError: "הדפדפן לא תומך בשיתוף מיקום",
    formLocationManual: "או הקלד כתובת / שם אתר בנייה...",
    orderSummary: "סיכום הזמנה",
    orderBundle: "📦 חבילת בטיחות",
    orderLicensing: "📋 שירות רישוי",
    orderDelivery: "🚚 משלוח עד הדלת",
    orderFree: "חינם!",
    orderTotal: "סה״כ לתשלום",
    btnSubmit: "שלח הזמנה ←",
    btnSelectFirst: "← בחר דגם קודם",
    formPostSubmit: "לאחר השליחה, ניצור איתך קשר טלפוני לאישור ההזמנה",
    barTotal: "סה״כ",
    barSave: "חוסך",
    barSubmit: "שלח הזמנה ←",
    successTitle: "ההזמנה נשלחה בהצלחה!",
    successBack: "חזרה לדף הראשי",
    successTotal: "סה״כ",
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
// PAGE COMPONENT
// ============================================================

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [selectedBike, setSelectedBike] = useState<BikeId | null>(null);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [licensingAdded, setLicensingAdded] = useState(false);
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

  // Translation helpers
  const t = UI[lang];
  const bt = BIKE_TEXT[lang];
  const bi = BUNDLE_ITEMS_TEXT[lang];
  const isRTL = lang === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const grad = isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r";
  const toggleOnX = isRTL ? "-translate-x-6" : "translate-x-6";

  // Update document direction and lang
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

  const bikePrice = selectedBike ? BIKES[selectedBike].price : 0;
  const bundleCost = bundleAdded ? BUNDLE_PRICE : 0;
  const licensingCost = licensingAdded ? LICENSING_PRICE : 0;
  const total = bikePrice + bundleCost + licensingCost;
  const savings = selectedBike ? BIKES[selectedBike].marketPrice - BIKES[selectedBike].price : 0;
  const totalSavings = savings + (bundleAdded ? BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE : 0);
  const priceDiff = BIKES.orka.price - BIKES.quicker.price;

  const selectBike = (id: BikeId) => {
    setSelectedBike(id);
    setTimeout(() => {
      document.getElementById("bundle-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBike || !name.trim() || (!phoneIsrael.trim() && !phoneChina.trim())) return;
    setSubmitting(true);

    const orderData = {
      name: name.trim(),
      phoneIsrael: phoneIsrael.trim(),
      phoneChina: phoneChina.trim(),
      location: location.trim(),
      bike: BIKES[selectedBike].name,
      bikePrice: BIKES[selectedBike].price,
      bundle: bundleAdded,
      bundlePrice: bundleCost,
      licensing: licensingAdded,
      licensingPrice: licensingCost,
      total,
      source: "page-a",
    };

    console.log("📋 Order:", orderData);

    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
      } catch {
        // no-cors doesn't return readable response, but data is sent
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
            {lang === "zh" ? (
              <>感谢你的订单！我们会在24小时内电话联系你<br />确认订单详情并安排送货。</>
            ) : (
              <>תודה על ההזמנה! ניצור איתך קשר טלפוני תוך 24 שעות<br />לאישור פרטי ההזמנה ותיאום משלוח.</>
            )}
          </p>
          <div className="bg-neutral-950 rounded-xl p-4 mb-6">
            <div className="text-sm text-neutral-400 space-y-2">
              <div className="flex justify-between">
                <span>🚲 {selectedBike && bt[selectedBike].displayName}</span>
                <span>₪{bikePrice.toLocaleString()}</span>
              </div>
              {bundleAdded && (
                <div className="flex justify-between">
                  <span>{t.orderBundle}</span>
                  <span>₪{BUNDLE_PRICE}</span>
                </div>
              )}
              {licensingAdded && (
                <div className="flex justify-between">
                  <span>{t.orderLicensing}</span>
                  <span>₪{LICENSING_PRICE}</span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                <span className="font-bold text-white">{t.successTotal}</span>
                <span className="text-xl font-black text-red-500">₪{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setSuccess(false); setSelectedBike(null); setBundleAdded(false); setLicensingAdded(false); setName(""); setPhoneIsrael(""); setPhoneChina(""); setLocation(""); }}
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
    <main dir={dir} className="min-h-screen bg-neutral-950 text-white pb-36">

      {/* ━━━ STICKY TIMER BAR ━━━ */}
      {timerSticky && (
        <div className="fixed top-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-xl border-b border-red-500/30 z-50 py-3 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold text-red-400">{t.stickyTimer}</span>
            </div>
            <div dir="ltr" className="flex justify-center gap-2">
              <div className="bg-neutral-800 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
                <span className="text-lg font-black text-red-400 tabular-nums">{String(timer.days).padStart(2, "0")}</span>
              </div>
              <span className="text-red-500 text-xl font-bold self-center">:</span>
              <div className="bg-neutral-800 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
                <span className="text-lg font-black text-red-400 tabular-nums">{String(timer.hours).padStart(2, "0")}</span>
              </div>
              <span className="text-red-500 text-xl font-bold self-center">:</span>
              <div className="bg-neutral-800 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
                <span className="text-lg font-black text-red-400 tabular-nums">{String(timer.minutes).padStart(2, "0")}</span>
              </div>
              <span className="text-red-500 text-xl font-bold self-center">:</span>
              <div className="bg-neutral-800 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
                <span className="text-lg font-black text-red-400 tabular-nums">{String(timer.seconds).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HERO — Emotional Hook + Urgency
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-neutral-950/80 to-neutral-950" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/15 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 px-5 pt-10 pb-8 max-w-lg mx-auto">

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "zh" ? "he" : "zh")}
            className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-20 bg-neutral-900/80 backdrop-blur border border-neutral-700 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-neutral-800 transition-colors`}
          >
            {lang === "zh" ? "🇮🇱 עברית" : "🇨🇳 中文"}
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-5 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            {t.heroBadge}
          </div>

          <h1 className="text-3xl font-black mb-3 leading-tight animate-fade-up-delay-1">
            {t.heroTitle1}
            <br />
            <span className={`text-transparent bg-clip-text ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-red-500 to-amber-400`}>
              {t.heroTitle2}
              <br />{t.heroTitle3}
            </span>
          </h1>

          <p className="text-sm text-neutral-400 mt-4 leading-relaxed animate-fade-up-delay-2">
            {t.heroSub1}
            <br />
            <span className="text-neutral-300 font-medium">{t.heroSub2}</span>
          </p>

          {/* Countdown Timer */}
          <div ref={timerRef} className="mt-6 bg-neutral-900/80 border border-red-500/20 rounded-xl p-4 animate-fade-up-delay-3">
            <p className="text-xs text-red-400 font-bold mb-1 text-center">{t.timerLabel}</p>
            <div dir="ltr" className="flex justify-center gap-3">
              <TimerUnit value={timer.days} label={t.days} />
              <span className="text-red-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.hours} label={t.hours} />
              <span className="text-red-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.minutes} label={t.minutes} />
              <span className="text-red-500 text-xl font-bold mt-1">:</span>
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
          2. THE PROBLEM — Why Bad Bikes Ruin Lives
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-black text-white mb-2">{t.problemTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">
          {lang === "zh" ? (
            <>我们跟几十个买了便宜车的工人聊过。<span className="text-red-400 font-bold">他们都付出了惨痛代价。</span>车坏了不能骑 — 就是一天赚不到钱：</>
          ) : (
            <>דיברנו עם עשרות עובדים שקנו אופניים זולים. <span className="text-red-400 font-bold">כולם שילמו על זה ביוקר.</span> יום שהאופניים לא עובדות — זה יום שאתה לא מרוויח:</>
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
          3. OUR SOLUTION — Why We're Different
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-black text-white mb-2">{t.solutionTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">
          {lang === "zh" ? (
            <>我们直接跟<span className="text-white font-bold">官方进口商</span>合作，拿到了连以色列人都拿不到的价格、服务和条件：</>
          ) : (
            <>עבדנו ישירות עם <span className="text-white font-bold">היבואן הרשמי</span> והצלחנו לכופף אותו — מחירים, שירות ותנאים שאפילו ישראלים לא מצליחים להשיג:</>
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
          4. THE BIKES — Detailed Product Cards
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-black text-white mb-1">{t.bikesTitle}</h2>
        <p className="text-sm text-neutral-400 mb-5">
          {lang === "zh" ? (
            <>质量好、可靠、有完整保修。<span className="text-white font-medium">说实话 — 价格也是别处找不到的。</span>连以色列人都买不到这个价。</>
          ) : (
            <>אופניים איכותיות, אמינות, עם אחריות מלאה. <span className="text-white font-medium">ואת האמת — גם במחיר שאי אפשר למצוא בשום מקום אחר.</span> מחירים שאפילו ישראלים לא מצליחים להשיג.</>
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
                onClick={() => selectBike(id)}
                className={`relative bg-neutral-900 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  selected
                    ? "border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]"
                    : bike.recommended
                      ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                      : "border-neutral-800 active:border-neutral-600"
                }`}
              >
                {bike.recommended && (
                  <div className={`${grad} from-red-600 to-amber-500 text-white text-xs font-bold px-4 py-2 text-center`}>
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
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
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

                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-3xl font-black text-red-500">₪{bike.price.toLocaleString()}</span>
                    <span className="text-base text-neutral-600 line-through">₪{bike.marketPrice.toLocaleString()}</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                      {t.save} ₪{(bike.marketPrice - bike.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-600 mt-2">
                    {t.deliveryNote}
                  </p>

                  <button
                    onClick={(e) => { e.stopPropagation(); selectBike(id); }}
                    className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      selected
                        ? "bg-red-500 text-white"
                        : bike.recommended
                          ? `${grad} from-red-600 to-amber-500 text-white`
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {selected ? t.btnSelected : bike.recommended ? t.btnSelectPremium : t.btnSelectThis}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade nudge — shows when QUICKER is selected */}
        {selectedBike === "quicker" && (
          <div
            onClick={() => selectBike("orka")}
            className={`mt-4 ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-4 cursor-pointer active:bg-amber-500/15 transition-all`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-bold text-amber-400 mb-1">
                  {lang === "zh"
                    ? `考虑ORKA — 只多₪${priceDiff.toLocaleString()}`
                    : `שקול את ה-ORKA — הפרש של רק ₪${priceDiff.toLocaleString()}`
                  }
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {lang === "zh" ? (
                    <>多₪{priceDiff.toLocaleString()} = 双倍电池（{BIKES.orka.battery}换{BIKES.quicker.battery}），{BIKES.orka.motor}电机换{BIKES.quicker.motor}，续航{BIKES.orka.range}公里。<span className="text-amber-400">远距离骑行很划算。</span></>
                  ) : (
                    <>₪{priceDiff.toLocaleString()} יותר = סוללה כפולה ({BIKES.orka.battery} במקום {BIKES.quicker.battery}), מנוע {BIKES.orka.motor} במקום {BIKES.quicker.motor}, וטווח של {BIKES.orka.range} ק״מ. <span className="text-amber-400">שווה למי שנוסע מרחקים.</span></>
                  )}
                </p>
                <p className="text-xs text-amber-400 font-bold mt-2">{t.upgradeClick}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. BUNDLE — Safety Package
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="bundle-section" className="px-4 max-w-lg mx-auto mt-12">
        {/* Urgency banner */}
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-xs text-red-400 font-bold">{t.bundleUrgency}</p>
        </div>

        <h2 className="text-xl font-black text-white mb-1">{t.bundleTitle}</h2>
        <p className="text-sm text-neutral-400 mb-2">
          {lang === "zh" ? (
            <>别光买车不买这个。<span className="text-red-400 font-bold">上路不戴头盔 — 直接罚₪250。</span></>
          ) : (
            <>אל תקנו אופניים בלי זה. <span className="text-red-400 font-bold">ברגע שיצאת לכביש בלי קסדה — זה קנס ₪250 מיידי.</span></>
          )}
        </p>
        <p className="text-sm text-neutral-500 mb-5">
          {lang === "zh" ? (
            <>没有10mm锁链 — 车一周内就被偷。我们见过太多了。<br /><span className="text-amber-400 font-medium">所以我们把最关键的3样东西打包，给你特价：</span></>
          ) : (
            <>בלי מנעול 10 מ״מ — האופניים ייגנבו תוך שבוע. אנחנו ראינו את זה עשרות פעמים.<br /><span className="text-amber-400 font-medium">לכן אספנו את 3 הפריטים הכי קריטיים במחיר מיוחד:</span></>
          )}
        </p>

        <div className="space-y-3 mb-4">
          {bi.map((item) => (
            <div key={item.name} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-neutral-500 line-through">₪{item.price}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price breakdown visual */}
        <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-neutral-400">
              {lang === "zh" ? "头盔 + 锁 + 支架 分开买：" : "קסדה + מנעול + מעמד בנפרד:"}
            </span>
            <span className="text-neutral-500 line-through font-medium">₪{BUNDLE_TOTAL_SEPARATE}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-400 font-bold">
              {lang === "zh" ? "套餐价：" : "בחבילה דרכנו:"}
            </span>
            <span className="text-amber-400 font-black text-lg">₪{BUNDLE_PRICE}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-800 text-center">
            <span className="text-emerald-400 text-sm font-bold">
              {lang === "zh"
                ? `你省了₪${BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE} — 头盔几乎免费！`
                : `אתה חוסך ₪${BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE} — כמעט קסדה חינם!`
              }
            </span>
          </div>
        </div>

        <div
          onClick={() => setBundleAdded(!bundleAdded)}
          className={`rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ${
            bundleAdded
              ? "bg-amber-500/10 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
              : "bg-neutral-900 border-red-500/40 active:border-red-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{bundleAdded ? t.bundleAdded : t.bundleAdd}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-neutral-500 line-through">₪{BUNDLE_TOTAL_SEPARATE}</span>
                <span className="text-xl font-black text-amber-400">₪{BUNDLE_PRICE}</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {t.save} ₪{BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE}
                </span>
              </div>
              {!bundleAdded && (
                <p className="text-[11px] text-red-400 mt-1.5">{t.bundleAddHint}</p>
              )}
            </div>
            <div
              className={`w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
                bundleAdded ? "bg-amber-500" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  bundleAdded ? toggleOnX : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        {!bundleAdded && (
          <p className="text-[11px] text-neutral-600 text-center mt-2">
            {t.bundleTip}
          </p>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. LICENSING — ₪189 Add-on
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-10">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex gap-3 items-start">
            <div className="text-2xl mt-0.5">🟡</div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-400 mb-2">
                {lang === "zh"
                  ? `黄牌上牌服务 — ₪${LICENSING_PRICE}`
                  : `רישוי לוחית צהובה — ₪${LICENSING_PRICE}`
                }
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                {lang === "zh" ? (
                  <>在以色列<span className="text-white font-medium">必须</span>有黄牌才能合法骑车。没牌 — 罚₪1,000，甚至扣车。</>
                ) : (
                  <>בישראל <span className="text-white font-medium">חובה</span> לוחית צהובה לרכיבה חוקית. בלי לוחית — קנס של ₪1,000 ואפילו תפיסת האופניים.</>
                )}
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                {lang === "zh" ? (
                  <>我们把你介绍给合作伙伴，他们负责全部流程。<span className="text-white font-medium">₪{LICENSING_PRICE}全包 — 最简单的方式。</span></>
                ) : (
                  <>אנחנו שולחים אותך לשותף שלנו שמטפל בכל התהליך. <span className="text-white font-medium">₪{LICENSING_PRICE} בלבד — הכי קל שיש.</span></>
                )}
              </p>

              <div
                onClick={() => setLicensingAdded(!licensingAdded)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  licensingAdded
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-neutral-900 border border-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    licensingAdded ? "bg-amber-500 border-amber-500" : "border-neutral-600"
                  }`}>
                    {licensingAdded && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-sm text-white font-medium">{t.licensingAdd}</span>
                </div>
                <span className="text-sm font-bold text-amber-400">₪{LICENSING_PRICE}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. ORDER FORM
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={formRef} id="order-form" className="px-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-black text-white mb-5">{t.formTitle}</h2>

        <form onSubmit={handleSubmit} id="order-form-element" className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formBikeLabel}</label>
            <select
              required
              value={selectedBike || ""}
              onChange={(e) => setSelectedBike(e.target.value as BikeId)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all appearance-none"
            >
              <option value="" disabled>{t.formBikePlaceholder}</option>
              <option value="quicker">{bt.quicker.displayName} — ₪{BIKES.quicker.price.toLocaleString()}</option>
              <option value="orka">{bt.orka.displayName} — ₪{BIKES.orka.price.toLocaleString()} ⭐</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formName}</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.formNamePlaceholder}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formPhoneIsrael}</label>
            <input type="tel" value={phoneIsrael} onChange={(e) => setPhoneIsrael(e.target.value)} placeholder="05X-XXXXXXX" inputMode="tel" dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-left" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">{t.formPhoneChina}</label>
            <input type="tel" value={phoneChina} onChange={(e) => setPhoneChina(e.target.value)} placeholder="+86 XXX-XXXX-XXXX" inputMode="tel" dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-left" />
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
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm transition-all hover:border-red-500/50 flex items-center justify-between"
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
              className="w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Order summary */}
          {selectedBike && (
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-300 mb-3">{t.orderSummary}</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-neutral-400">
                  <span>🚲 {bt[selectedBike].displayName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 line-through">₪{BIKES[selectedBike].marketPrice.toLocaleString()}</span>
                    <span className="text-white font-bold">₪{BIKES[selectedBike].price.toLocaleString()}</span>
                  </div>
                </div>
                {bundleAdded && (
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>{t.orderBundle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600 line-through">₪{BUNDLE_TOTAL_SEPARATE}</span>
                      <span className="text-white font-bold">₪{BUNDLE_PRICE}</span>
                    </div>
                  </div>
                )}
                {licensingAdded && (
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>{t.orderLicensing}</span>
                    <span className="text-white font-bold">₪{LICENSING_PRICE}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>{t.orderDelivery}</span>
                  <span className="text-emerald-400 font-medium">{t.orderFree}</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-base">{t.orderTotal}</span>
                    <div className="text-end">
                      <span className="text-2xl font-black text-red-500">₪{total.toLocaleString()}</span>
                      {totalSavings > 0 && (
                        <div className="text-xs text-neutral-600 line-through">₪{(total + totalSavings).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  {totalSavings > 0 && (
                    <div className="text-center text-xs text-emerald-400 font-bold mt-2 bg-emerald-500/5 py-1.5 rounded-lg">
                      {lang === "zh"
                        ? `🎉 共节省₪${totalSavings.toLocaleString()}！`
                        : `🎉 חוסך סה״כ ₪${totalSavings.toLocaleString()} ממחיר השוק!`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedBike || submitting}
            className={`w-full ${grad} from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-neutral-700 disabled:to-neutral-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : !selectedBike ? (
              t.btnSelectFirst
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
      {selectedBike && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 px-4 py-3 z-50"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-neutral-500">{t.barTotal}</div>
              <div className="text-xl font-black text-red-500">₪{total.toLocaleString()}</div>
              {totalSavings > 0 && (
                <div className="text-[10px] text-emerald-400">{t.barSave} ₪{totalSavings.toLocaleString()}</div>
              )}
            </div>
            <button
              onClick={scrollToForm}
              disabled={submitting}
              className={`${grad} from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.25)] pulse-glow transition-all disabled:opacity-50 flex items-center gap-2`}
            >
              {t.barSubmit}
            </button>
          </div>
        </div>
      )}

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
        <span className="text-xl font-black text-red-400 tabular-nums">{String(value).padStart(2, "0")}</span>
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
