"use client";

import { useState, useRef, useEffect } from "react";

// ============================================================
// ⚙️ CONFIGURATION
// ============================================================

const IMAGES = {
  quicker: "/bikes/quicker-rs.jpg",
  orka: "/bikes/orka.jpg",
};

type BikeId = "quicker" | "orka";

const BIKES: Record<BikeId, {
  name: string;
  displayName: string;
  tag: string;
  shortDesc: string;
  longDesc: string;
  idealFor: string;
  range: string;
  battery: string;
  motor: string;
  wheels: string;
  weight: string;
  marketPrice: number;
  price: number;
  recommended: boolean;
}> = {
  quicker: {
    name: "QUICKER RS",
    displayName: "QUICKER RS - דגם סטנדרט",
    tag: "הבחירה החכמה לנסיעות עירוניות",
    shortDesc: "קל, זריז ואמין. מושלם למי שנוסע כל יום לעבודה וחזרה.",
    longDesc: "שלדת אלומיניום 6061 קלת משקל, גלגלי מגנזיום 20 אינץ׳ עם צמיגי 3.0 לאחיזה מעולה בכביש. בלמי דיסק מכניים, שיכוך קדמי הידראולי, 7 הילוכי שימנו ותצוגת LCD דיגיטלית. מתקפל לאחסון קל.",
    idealFor: "נסיעות יומיומיות עד 40 ק\"מ, כבישים סלולים, רוכבים שמחפשים אופניים קלים ומהירים",
    range: "35-45",
    battery: "48V 13Ah",
    motor: "500W",
    wheels: "מגנזיום 3.0\"",
    weight: "24 ק\"ג",
    marketPrice: 3600,
    price: 3250,
    recommended: false,
  },
  orka: {
    name: "ORKA FAT TIRE",
    displayName: "ORKA - דגם פרימיום",
    tag: "סוס העבודה · הנבחר ביותר",
    shortDesc: "עוצמה, טווח ויציבות. נבנה לאתרי בנייה ושטח.",
    longDesc: "שלדת אלומיניום 6061 מחוזקת, גלגלי בלון רחבים 4.5 אינץ׳ שעוברים על כל שטח — חול, בוץ, אבנים. בלמי שמן הידראוליים, שיכוך מלא (קדמי + אחורי), 6 הילוכי שימנו. סוללת ענק 21Ah לטווח של עד 80 ק\"מ.",
    idealFor: "אתרי בנייה, שבילי שטח, נסיעות ארוכות מעל 50 ק\"מ, רוכבים כבדים, מי שרוצה את הטוב ביותר",
    range: "65-80",
    battery: "48V 21Ah",
    motor: "750W",
    wheels: "בלון 4.5\"",
    weight: "29.5 ק\"ג",
    marketPrice: 5500,
    price: 4450,
    recommended: true,
  },
};

const BUNDLE_PRICE = 327;
const BUNDLE_TOTAL_SEPARATE = 417;
const LICENSING_PRICE = 189;

const BUNDLE_ITEMS = [
  {
    icon: "⛑️",
    name: "קסדה מאושרת תקן ישראלי",
    price: 179,
    desc: "חובה לפי החוק. קנס של ₪250 על רכיבה בלי קסדה! קסדה נוחה ומאווררת שעומדת בתקן ישראלי.",
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
];

// ============================================================
// WEEKLY COUNTDOWN TIMER
// ============================================================

function useWeeklyCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getTimeUntilSunday() {
      const now = new Date();
      // Israel timezone offset
      const israelTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
      const day = israelTime.getDay(); // 0 = Sunday
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
  const formRef = useRef<HTMLDivElement>(null);
  const timer = useWeeklyCountdown();

  const bikePrice = selectedBike ? BIKES[selectedBike].price : 0;
  const bundleCost = bundleAdded ? BUNDLE_PRICE : 0;
  const licensingCost = licensingAdded ? LICENSING_PRICE : 0;
  const total = bikePrice + bundleCost + licensingCost;
  const savings = selectedBike ? BIKES[selectedBike].marketPrice - BIKES[selectedBike].price : 0;
  const totalSavings = savings + (bundleAdded ? BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE : 0);

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
    };

    // Log for now — will connect to Typeform/Notion later
    console.log("📋 Order:", orderData);
    await new Promise((r) => setTimeout(r, 1200));

    setSubmitting(false);
    setSuccess(true);
  };

  // ── Success Screen ──
  if (success) {
    return (
      <main dir="rtl" className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-sm w-full text-center animate-fade-up">
          <div className="text-6xl mb-5">✅</div>
          <h1 className="text-2xl font-bold text-white mb-3">ההזמנה נשלחה בהצלחה!</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            תודה על ההזמנה! ניצור איתך קשר טלפוני תוך 24 שעות
            <br />לאישור פרטי ההזמנה ותיאום משלוח.
          </p>
          <div className="bg-neutral-950 rounded-xl p-4 mb-6 text-right">
            <div className="text-sm text-neutral-400 space-y-2">
              <div className="flex justify-between">
                <span>₪{bikePrice.toLocaleString()}</span>
                <span>🚲 {selectedBike && BIKES[selectedBike].displayName}</span>
              </div>
              {bundleAdded && (
                <div className="flex justify-between">
                  <span>₪{BUNDLE_PRICE}</span>
                  <span>📦 חבילת בטיחות</span>
                </div>
              )}
              {licensingAdded && (
                <div className="flex justify-between">
                  <span>₪{LICENSING_PRICE}</span>
                  <span>📋 שירות רישוי</span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                <span className="text-xl font-black text-red-500">₪{total.toLocaleString()}</span>
                <span className="font-bold text-white">סה״כ</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setSuccess(false); setSelectedBike(null); setBundleAdded(false); setLicensingAdded(false); setName(""); setPhoneIsrael(""); setPhoneChina(""); setLocation(""); }}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            חזרה לדף הראשי
          </button>
        </div>
      </main>
    );
  }

  // ── Main Page ──
  return (
    <main dir="rtl" className="min-h-screen bg-neutral-950 text-white pb-36">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HERO — Emotional Hook + Urgency
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-neutral-950/80 to-neutral-950" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/15 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 px-5 pt-10 pb-8 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-5 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            הצעה מוגבלת · המחירים עולים בסוף השבוע
          </div>

          <h1 className="text-3xl font-black mb-3 leading-tight animate-fade-up-delay-1">
            אופניים חשמליים
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-500 to-amber-400">
              עם שירות שלא תמצאו
              <br />בשום מקום אחר
            </span>
          </h1>

          <p className="text-sm text-neutral-400 mt-4 leading-relaxed animate-fade-up-delay-2">
            משלוח עד הדלת, אחריות שנה, עזרה ברישוי.
            <br />
            <span className="text-neutral-300 font-medium">הכל כלול. בלי הפתעות.</span>
          </p>

          {/* Countdown Timer */}
          <div className="mt-6 bg-neutral-900/80 border border-red-500/20 rounded-xl p-4 animate-fade-up-delay-3">
            <p className="text-xs text-neutral-500 mb-2 text-center">המחירים האלה תקפים עוד:</p>
            <div dir="ltr" className="flex justify-center gap-3">
              <TimerUnit value={timer.days} label="ימים" />
              <span className="text-red-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.hours} label="שעות" />
              <span className="text-red-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.minutes} label="דקות" />
              <span className="text-red-500 text-xl font-bold mt-1">:</span>
              <TimerUnit value={timer.seconds} label="שניות" />
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-6 animate-fade-up-delay-3">
            <TrustBadge icon="🚚" text="משלוח חינם" />
            <TrustBadge icon="🛡️" text="אחריות שנה" />
            <TrustBadge icon="📋" text="עזרה ברישוי" />
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
            <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
            כבר <span className="text-amber-400 font-bold">47</span> עובדים בחרו אצלנו
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. THE PROBLEM — Why Bad Bikes Ruin Lives
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-black text-white mb-2">⚠️ עשרות פועלים כבר נתקעו — רק כי חסכו 500 ₪ באופניים</h2>
        <p className="text-sm text-neutral-400 mb-5">
          דיברנו עם עשרות עובדים שקנו אופניים זולים. <span className="text-red-400 font-bold">כולם שילמו על זה ביוקר.</span> יום שהאופניים לא עובדות — זה יום שאתה לא מרוויח:
        </p>

        <div className="space-y-3">
          <ProblemCard
            icon="💥"
            title="אופניים זולים = נתקעת באמצע הדרך"
            desc="הפסד יום עבודה = הפסד של ₪1,000-3,000. ובעיות עם הבוס — לך תספר לו סיפורים. ההפרש במחיר לא שווה את הסיכון."
          />
          <ProblemCard
            icon="💸"
            title="בלי אחריות — כל תקלה מהכיס שלך"
            desc="מנוע שנשרף? סוללה שמתה? בלי אחריות אתה משלם 500-1,500 ₪ מהכיס. וזה קורה הרבה יותר מהר ממה שחושבים."
          />
          <ProblemCard
            icon="👮"
            title="בלי לוחית צהובה — קנס של ₪1,000"
            desc="משטרת ישראל נותנת קנסות. בלי רישוי ובלי קסדה = קנסות של אלפי שקלים. קנס אחד כבר יותר מההפרש במחיר."
          />
          <ProblemCard
            icon="🗑️"
            title="אופניים זולים = 0 ערך מכירה חוזרת"
            desc="אופניים ממותג מוכר שומרים על ערך. אופניים זולים בלי מותג — אי אפשר למכור אותם. כסף זרוק."
          />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. OUR SOLUTION — Why We're Different
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-black text-white mb-2">✅ למה דווקא אצלנו?</h2>
        <p className="text-sm text-neutral-400 mb-5">
          עבדנו ישירות עם <span className="text-white font-bold">היבואן הרשמי</span> והצלחנו לכופף אותו — מחירים, שירות ותנאים שאפילו ישראלים לא מצליחים להשיג:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <SolutionCard icon="🚚" title="משלוח עד אליך" desc="חוסך לך יום עבודה. האופניים מגיעות אליך — לא אתה אליהן." />
          <SolutionCard icon="🛡️" title="שנה אחריות" desc="כל תקלה חוץ מפנצ׳רים — אנחנו מטפלים. בלי תשלום נוסף." />
          <SolutionCard icon="🔧" title="מרכזי שירות" desc="עשרות מרכזי שירות ברחבי הארץ. תמיד יש לך לאן לפנות." />
          <SolutionCard icon="📋" title="רישוי ב-₪189" desc="אנחנו שולחים אותך לשותף שלנו. תהליך הכי קל שיש." />
          <SolutionCard icon="💰" title="ערך מכירה חוזרת" desc="מותגים מוכרים עם ביקוש בשוק. כשתרצה למכור — יש קונים." />
          <SolutionCard icon="🏷️" title="מחיר שלא תמצא" desc="מחירים שאפילו ישראלים לא מצליחים להשיג. ישירות מהיבואן." />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. THE BIKES — Detailed Product Cards
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-black text-white mb-1">🚲 דיברנו עם פועלים ועם המומחים — וריכזנו 2 דגמים</h2>
        <p className="text-sm text-neutral-400 mb-5">
          אופניים איכותיות, אמינות, עם אחריות מלאה. <span className="text-white font-medium">ואת האמת — גם במחיר שאי אפשר למצוא בשום מקום אחר.</span> מחירים שאפילו ישראלים לא מצליחים להשיג.
        </p>

        <div className="space-y-5">
          {(["quicker", "orka"] as BikeId[]).map((id) => {
            const bike = BIKES[id];
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
                  <div className="bg-gradient-to-l from-red-600 to-amber-500 text-white text-xs font-bold px-4 py-2 text-center">
                    ⭐ הנבחר ביותר — טווח כפול, עוצמה מקסימלית
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
                      <h3 className="text-xl font-black text-white">{bike.displayName}</h3>
                      <p className="text-xs text-amber-400 font-medium mt-0.5">{bike.tag}</p>
                    </div>
                    {selected && (
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-neutral-300 mt-3 leading-relaxed">{bike.shortDesc}</p>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{bike.longDesc}</p>

                  <div className="mt-3 bg-neutral-950/50 rounded-lg p-3">
                    <p className="text-[10px] text-amber-400/80 font-medium mb-1">מתאים במיוחד ל:</p>
                    <p className="text-xs text-neutral-400">{bike.idealFor}</p>
                  </div>

                  <div dir="ltr" className="grid grid-cols-3 gap-2 mt-4 mb-4">
                    <SpecChip label="טווח" value={`${bike.range} ק״מ`} />
                    <SpecChip label="סוללה" value={bike.battery} />
                    <SpecChip label="מנוע" value={bike.motor} />
                    <SpecChip label="גלגלים" value={bike.wheels} />
                    <SpecChip label="משקל" value={bike.weight} />
                    <SpecChip label="מתקפל" value="כן ✓" />
                  </div>

                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-3xl font-black text-red-500">₪{bike.price.toLocaleString()}</span>
                    <span className="text-base text-neutral-600 line-through">₪{bike.marketPrice.toLocaleString()}</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                      חוסך ₪{(bike.marketPrice - bike.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-600 mt-2">
                    * כולל משלוח עד הדלת + אחריות שנה
                  </p>

                  <button
                    onClick={(e) => { e.stopPropagation(); selectBike(id); }}
                    className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      selected
                        ? "bg-red-500 text-white"
                        : bike.recommended
                          ? "bg-gradient-to-l from-red-600 to-amber-500 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {selected ? "✓ נבחר" : bike.recommended ? "⭐ בחר את הפרימיום" : "בחר דגם זה"}
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
            className="mt-4 bg-gradient-to-l from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-4 cursor-pointer active:bg-amber-500/15 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-bold text-amber-400 mb-1">שקול את ה-ORKA — הפרש של רק ₪{(BIKES.orka.price - BIKES.quicker.price).toLocaleString()}</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  ₪{(BIKES.orka.price - BIKES.quicker.price).toLocaleString()} יותר = סוללה כפולה ({BIKES.orka.battery} במקום {BIKES.quicker.battery}), מנוע {BIKES.orka.motor} במקום {BIKES.quicker.motor}, וטווח של {BIKES.orka.range} ק״מ. <span className="text-amber-400">שווה למי שנוסע מרחקים.</span>
                </p>
                <p className="text-xs text-amber-400 font-bold mt-2">לחץ כאן לשדרג ←</p>
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
          <p className="text-xs text-red-400 font-bold">⚠️ 87% מהלקוחות שלנו לוקחים את החבילה — כי הם מבינים שזה חוסך כאב ראש</p>
        </div>

        <h2 className="text-xl font-black text-white mb-1">🛡️ חבילת בטיחות — חובה לכל רוכב</h2>
        <p className="text-sm text-neutral-400 mb-2">
          אל תקנו אופניים בלי זה. <span className="text-red-400 font-bold">ברגע שיצאת לכביש בלי קסדה — זה קנס ₪250 מיידי.</span>
        </p>
        <p className="text-sm text-neutral-500 mb-5">
          בלי מנעול 10 מ״מ — האופניים ייגנבו תוך שבוע. אנחנו ראינו את זה עשרות פעמים.
          <br /><span className="text-amber-400 font-medium">לכן אספנו את 3 הפריטים הכי קריטיים במחיר מיוחד:</span>
        </p>

        <div className="space-y-3 mb-4">
          {BUNDLE_ITEMS.map((item) => (
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
            <span className="text-neutral-400">קסדה + מנעול + מעמד בנפרד:</span>
            <span className="text-neutral-500 line-through font-medium">₪{BUNDLE_TOTAL_SEPARATE}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-400 font-bold">בחבילה דרכנו:</span>
            <span className="text-amber-400 font-black text-lg">₪{BUNDLE_PRICE}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-800 text-center">
            <span className="text-emerald-400 text-sm font-bold">אתה חוסך ₪{BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE} — כמעט קסדה חינם!</span>
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
                <h3 className="text-lg font-bold text-white">{bundleAdded ? "✓ חבילה נוספה!" : "הוסף חבילת בטיחות"}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-neutral-500 line-through">₪{BUNDLE_TOTAL_SEPARATE}</span>
                <span className="text-xl font-black text-amber-400">₪{BUNDLE_PRICE}</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  חוסך ₪{BUNDLE_TOTAL_SEPARATE - BUNDLE_PRICE}
                </span>
              </div>
              {!bundleAdded && (
                <p className="text-[11px] text-red-400 mt-1.5">לחץ כאן להוסיף ← מומלץ מאוד</p>
              )}
            </div>
            <div
              className={`w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
                bundleAdded ? "bg-amber-500" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  bundleAdded ? "-translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        {!bundleAdded && (
          <p className="text-[11px] text-neutral-600 text-center mt-2">
            💡 טיפ: לקוחות שלא לקחו חבילה התחרטו אחרי הקנס הראשון
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
              <h3 className="text-base font-bold text-amber-400 mb-2">רישוי לוחית צהובה — ₪{LICENSING_PRICE}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                בישראל <span className="text-white font-medium">חובה</span> לוחית צהובה לרכיבה חוקית. בלי לוחית — קנס של ₪1,000 ואפילו תפיסת האופניים.
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                אנחנו שולחים אותך לשותף שלנו שמטפל בכל התהליך. <span className="text-white font-medium">₪{LICENSING_PRICE} בלבד — הכי קל שיש.</span>
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
                  <span className="text-sm text-white font-medium">הוסף שירות רישוי</span>
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
        <h2 className="text-xl font-black text-white mb-5">📝 מלא פרטים ושלח הזמנה</h2>

        <form onSubmit={handleSubmit} id="order-form-element" className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">בחירת דגם</label>
            <select
              required
              value={selectedBike || ""}
              onChange={(e) => setSelectedBike(e.target.value as BikeId)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all appearance-none"
            >
              <option value="" disabled>בחר דגם אופניים...</option>
              <option value="quicker">QUICKER RS — ₪{BIKES.quicker.price.toLocaleString()}</option>
              <option value="orka">ORKA FAT TIRE — ₪{BIKES.orka.price.toLocaleString()} ⭐</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">שם מלא</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="הכנס את שמך"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">מספר טלפון ישראלי</label>
            <input type="tel" value={phoneIsrael} onChange={(e) => setPhoneIsrael(e.target.value)} placeholder="05X-XXXXXXX" inputMode="tel" dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-left" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">מספר טלפון סיני</label>
            <input type="tel" value={phoneChina} onChange={(e) => setPhoneChina(e.target.value)} placeholder="+86 XXX-XXXX-XXXX" inputMode="tel" dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-left" />
            <p className="text-[10px] text-neutral-600 mt-1">צריך לפחות מספר אחד — ישראלי או סיני</p>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">כתובת למשלוח</label>
            <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="לדוגמה: אתר בנייה בתל אביב, כתובת מגורים..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
          </div>

          {/* Order summary with crossed-out market prices */}
          {selectedBike && (
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-300 mb-3">סיכום הזמנה</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-neutral-400">
                  <span>🚲 {BIKES[selectedBike].displayName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 line-through">₪{BIKES[selectedBike].marketPrice.toLocaleString()}</span>
                    <span className="text-white font-bold">₪{BIKES[selectedBike].price.toLocaleString()}</span>
                  </div>
                </div>
                {bundleAdded && (
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>📦 חבילת בטיחות</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600 line-through">₪{BUNDLE_TOTAL_SEPARATE}</span>
                      <span className="text-white font-bold">₪{BUNDLE_PRICE}</span>
                    </div>
                  </div>
                )}
                {licensingAdded && (
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>📋 שירות רישוי</span>
                    <span className="text-white font-bold">₪{LICENSING_PRICE}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>🚚 משלוח עד הדלת</span>
                  <span className="text-emerald-400 font-medium">חינם!</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-base">סה״כ לתשלום</span>
                    <div className="text-left">
                      <span className="text-2xl font-black text-red-500">₪{total.toLocaleString()}</span>
                      {totalSavings > 0 && (
                        <div className="text-xs text-neutral-600 line-through">₪{(total + totalSavings).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  {totalSavings > 0 && (
                    <div className="text-center text-xs text-emerald-400 font-bold mt-2 bg-emerald-500/5 py-1.5 rounded-lg">
                      🎉 חוסך סה״כ ₪{totalSavings.toLocaleString()} ממחיר השוק!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedBike || submitting}
            className="w-full bg-gradient-to-l from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-neutral-700 disabled:to-neutral-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : !selectedBike ? (
              "← בחר דגם קודם"
            ) : (
              <>שלח הזמנה ←</>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-600">
            לאחר השליחה, ניצור איתך קשר טלפוני לאישור ההזמנה
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
              <div className="text-[11px] text-neutral-500">סה״כ</div>
              <div className="text-xl font-black text-red-500">₪{total.toLocaleString()}</div>
              {totalSavings > 0 && (
                <div className="text-[10px] text-emerald-400">חוסך ₪{totalSavings.toLocaleString()}</div>
              )}
            </div>
            <button
              onClick={scrollToForm}
              disabled={submitting}
              className="bg-gradient-to-l from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.25)] pulse-glow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              שלח הזמנה ←
            </button>
          </div>
        </div>
      )}

      {/* ━━━ FOOTER ━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-12 mb-4">
        <div className="text-center text-xs text-neutral-600 space-y-1">
          <p>🇮🇱 שירות אופניים חשמליים לעובדים סינים בישראל</p>
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
