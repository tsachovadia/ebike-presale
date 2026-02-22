"use client";

import { useState, useRef } from "react";

// ============================================================
// ⚙️ CONFIGURATION — Edit these values to customize the page
// ============================================================

/** Google Apps Script URL for form submissions → Google Sheets */
const GOOGLE_SCRIPT_URL = "";

/** Product images — replace with your own hosted URLs */
const IMAGES = {
  quicker: "https://tamirmotors.co.il/wp-content/uploads/2024/11/QUICKER-RS.jpg",
  orka: "/bikes/orka.jpg", // ← Put your ORKA image in public/bikes/orka.jpg
};

// ============================================================

type BikeId = "quicker" | "orka";

const BIKES: Record<BikeId, {
  name: string;
  displayName: string;
  tag: string;
  desc: string;
  range: string;
  battery: string;
  motor: string;
  wheels: string;
  marketPrice: number;
  price: number;
  recommended: boolean;
}> = {
  quicker: {
    name: "QUICKER RS",
    displayName: "QUICKER RS - דגם סטנדרט",
    tag: "הבחירה לנסיעות עירוניות",
    desc: "קל וזריז, אידיאלי לנסיעות יומיומיות לעבודה וחזרה. מושלם לרחובות העיר.",
    range: "35-45",
    battery: "48V 13Ah",
    motor: "500W",
    wheels: "מגנזיום 3.0\"",
    marketPrice: 3600,
    price: 3150,
    recommended: false,
  },
  orka: {
    name: "ORKA FAT TIRE",
    displayName: "ORKA - דגם פרימיום",
    tag: "סוס העבודה · מומלץ",
    desc: "עוצמה מטורפת וטווח נסיעה ארוך במיוחד. נבנה במיוחד לאתרי בנייה ונסיעות ארוכות.",
    range: "65-80",
    battery: "48V 21Ah",
    motor: "750W",
    wheels: "בלון רחב 4.5\"",
    marketPrice: 5500,
    price: 4450,
    recommended: true,
  },
};

const BUNDLE_PRICE = 327;

const BUNDLE_ITEMS = [
  { icon: "🔒", text: "מנעול שרשרת 10 מ\"מ - מאסיבי נגד גניבה" },
  { icon: "⛑️", text: "קסדת פריסטייל - בטיחותית ונוחה" },
  { icon: "📱", text: "מעמד טלפון מאלומיניום - יציב בנסיעה" },
];

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function Home() {
  const [selectedBike, setSelectedBike] = useState<BikeId | null>(null);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const bikePrice = selectedBike ? BIKES[selectedBike].price : 0;
  const total = bikePrice + (bundleAdded ? BUNDLE_PRICE : 0);
  const savings = selectedBike
    ? BIKES[selectedBike].marketPrice - BIKES[selectedBike].price
    : 0;

  const selectBike = (id: BikeId) => {
    setSelectedBike(id);
    setTimeout(() => {
      document.getElementById("bundle-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBike || !name.trim() || !phone.trim()) return;

    setSubmitting(true);

    const orderData = {
      name: name.trim(),
      phone: phone.trim(),
      location: location.trim(),
      bike: BIKES[selectedBike].name,
      bikePrice: BIKES[selectedBike].price,
      bundle: bundleAdded,
      bundlePrice: bundleAdded ? BUNDLE_PRICE : 0,
      total,
    };

    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      console.error("Submit error:", err);
    }

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
                  <span>📦 חבילת אביזרים</span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                <span className="text-xl font-black text-red-500">₪{total.toLocaleString()}</span>
                <span className="font-bold text-white">סה״כ</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setSelectedBike(null);
              setBundleAdded(false);
              setName("");
              setPhone("");
              setLocation("");
            }}
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

      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-neutral-950/80 to-neutral-950" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/15 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 px-5 pt-10 pb-8 max-w-lg mx-auto">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-5 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            מבצע מיוחד · מלאי מוגבל
          </div>

          <h1 className="text-3xl font-black mb-3 leading-tight animate-fade-up-delay-1">
            מרכז האופניים החשמליים
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-500 to-amber-400">
              הבלעדי לעובדים סינים
            </span>
          </h1>

          <p className="text-sm text-neutral-400 mt-4 leading-relaxed animate-fade-up-delay-2">
            אופניים חשמליים באיכות גבוהה, במחירים הכי נמוכים בישראל. משלוח עד הדלת, אחריות לשנה, שירות בסינית.
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-6 animate-fade-up-delay-3">
            <TrustBadge icon="🚚" text="משלוח חינם" />
            <TrustBadge icon="🛡️" text="אחריות שנה" />
            <TrustBadge icon="📋" text="סיוע ברישוי" />
          </div>

          {/* Social proof */}
          <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500 animate-fade-up-delay-3">
            <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
            כבר <span className="text-amber-400 font-bold">47</span> עובדים בחרו אצלנו
          </div>
        </div>
      </section>

      {/* ━━━ STEP 1: CHOOSE BIKE ━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-4">
        <StepHeader step={1} title="בחר דגם" />

        <div className="space-y-4">
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
                    : "border-neutral-800 active:border-neutral-600"
                }`}
              >
                {/* Recommended badge */}
                {bike.recommended && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-l from-red-600 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                    ⭐ מומלץ
                  </div>
                )}

                {/* Bike image */}
                <div className="h-52 bg-neutral-800/50 flex items-center justify-center overflow-hidden">
                  {imgError[id] ? (
                    <div className="text-neutral-600 text-center">
                      <div className="text-5xl mb-2">🚲</div>
                      <div className="text-xs">טוען תמונה...</div>
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

                {/* Bike details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-white">{bike.displayName}</h3>
                      <p className="text-xs text-neutral-500">{bike.tag}</p>
                    </div>
                    {selected && (
                      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-neutral-400 mb-3 mt-2">{bike.desc}</p>

                  {/* Specs grid */}
                  <div dir="ltr" className="grid grid-cols-2 gap-2 mb-4">
                    <SpecChip label="טווח נסיעה" value={`${bike.range} ק״מ`} />
                    <SpecChip label="סוללה" value={bike.battery} />
                    <SpecChip label="מנוע" value={bike.motor} />
                    <SpecChip label="גלגלים" value={bike.wheels} />
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-2xl font-black text-red-500">
                      ₪{bike.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-neutral-600 line-through">
                      ₪{bike.marketPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium">
                      חיסכון ₪{(bike.marketPrice - bike.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-600 mt-2">
                    * המחיר כולל משלוח עד הדלת ואחריות לשנה
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━━ STEP 2: BUNDLE ━━━ */}
      <section id="bundle-section" className="px-4 max-w-lg mx-auto mt-10">
        <StepHeader step={2} title="חבילת אביזרים" />

        <div
          onClick={() => setBundleAdded(!bundleAdded)}
          className={`bg-neutral-900 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ${
            bundleAdded
              ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              : "border-neutral-800 active:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">חבילת בטיחות ותחזוקה</h3>
              <p className="text-xs text-neutral-500 mt-0.5">כל מה שצריך לרכיבה בטוחה</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-amber-400">₪{BUNDLE_PRICE}</span>
              {/* Toggle switch */}
              <div
                className={`w-12 h-7 rounded-full transition-colors duration-300 flex items-center px-1 ${
                  bundleAdded ? "bg-amber-500" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    bundleAdded ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {BUNDLE_ITEMS.map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <span className="text-sm text-neutral-200">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ LICENSE PLATE INFO ━━━ */}
      <section className="px-4 max-w-lg mx-auto mt-10">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex gap-3 items-start">
            <div className="text-2xl mt-0.5">🟡</div>
            <div>
              <h3 className="text-base font-bold text-amber-400 mb-2">לוחית רישוי צהובה</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-2">
                לפי החוק בישראל, אופניים חשמליים חייבים רישוי (לוחית צהובה) כדי לנסוע בכביש באופן חוקי.
                לאחר הרכישה, נפנה אתכם לגורם מקצועי שיטפל עבורכם בכל תהליך הרישוי.
              </p>
              <div className="mt-3 pt-3 border-t border-amber-500/10">
                <p className="text-[11px] text-neutral-600">
                  * עלות הרישוי אינה כלולה במחיר האופניים
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ STEP 3: ORDER FORM ━━━ */}
      <section ref={formRef} id="order-form" className="px-4 max-w-lg mx-auto mt-10">
        <StepHeader step={3} title="מלא פרטים ושלח הזמנה" />

        <form onSubmit={handleSubmit} id="order-form-element" className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          {/* Bike selection dropdown */}
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
              בחירת דגם
            </label>
            <select
              required
              value={selectedBike || ""}
              onChange={(e) => setSelectedBike(e.target.value as BikeId)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all appearance-none"
            >
              <option value="" disabled>בחר דגם אופניים...</option>
              <option value="quicker">QUICKER RS - דגם סטנדרט (₪{BIKES.quicker.price.toLocaleString()})</option>
              <option value="orka">ORKA FAT TIRE - דגם פרימיום (₪{BIKES.orka.price.toLocaleString()}) ⭐</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
              שם מלא
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס את שמך"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
              מספר טלפון
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05X-XXXXXXX"
              inputMode="tel"
              dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-left"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
              מיקום (עיר / אתר בנייה)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="לדוגמה: אתר בנייה בתל אביב, מעונות בראשון לציון..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            />
          </div>

          {/* Order summary inside form */}
          {selectedBike && (
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-300 mb-3">סיכום הזמנה</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>🚲 {BIKES[selectedBike].displayName}</span>
                  <span>₪{BIKES[selectedBike].price.toLocaleString()}</span>
                </div>
                {bundleAdded && (
                  <div className="flex justify-between text-neutral-400">
                    <span>📦 חבילת אביזרים</span>
                    <span>₪{BUNDLE_PRICE}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>🚚 משלוח עד הדלת</span>
                  <span className="text-emerald-400 font-medium">חינם!</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-white text-base">סה״כ לתשלום</span>
                  <span className="text-2xl font-black text-red-500">₪{total.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="text-center text-xs text-emerald-400 font-medium">
                    חוסך ₪{savings.toLocaleString()} ממחיר השוק! 🎉
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit button */}
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

          <p className="text-[11px] text-center text-neutral-600 mt-2">
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
            </div>
            <button
              onClick={() => {
                if (!name.trim() || !phone.trim()) {
                  formRef.current?.scrollIntoView({ behavior: "smooth" });
                  return;
                }
                const form = document.getElementById("order-form-element") as HTMLFormElement;
                form?.requestSubmit();
              }}
              disabled={submitting}
              className="bg-gradient-to-l from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.25)] pulse-glow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>שלח הזמנה ←</>
              )}
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

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl py-3 px-2 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs font-bold text-neutral-200">{text}</div>
    </div>
  );
}

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-sm font-bold flex-shrink-0">
        {step}
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-950/50 rounded-lg px-3 py-2 text-center">
      <div className="text-[10px] text-neutral-500 mb-0.5">{label}</div>
      <div className="text-xs font-medium text-neutral-300">{value}</div>
    </div>
  );
}
