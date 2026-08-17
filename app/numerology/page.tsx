"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Calculator, Sparkles, User, Calendar, Hash, Loader2 } from "lucide-react";

const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};

function reduceToSingle(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = String(num).split("").reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

function calculateLifePath(birthDate: string): number {
  const clean = birthDate.replace(/-/g, "");
  return reduceToSingle(clean.split("").reduce((a, b) => a + parseInt(b), 0));
}

function calculateExpression(name: string): number {
  const sum = name.toLowerCase().replace(/[^a-z]/g, "").split("").reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0);
  return reduceToSingle(sum);
}

function calculateSoulUrge(name: string): number {
  const vowels = name.toLowerCase().replace(/[^aeiou]/g, "").split("");
  const sum = vowels.reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0);
  return reduceToSingle(sum);
}

function calculateBirthday(birthDate: string): number {
  const day = parseInt(birthDate.split("-")[2]);
  return reduceToSingle(day);
}

function calculatePersonalYear(birthDate: string, forDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [fy] = forDate.split("-").map(Number);
  return reduceToSingle(fy + bm + bd);
}

function calculatePersonalMonth(birthDate: string, forDate: string): number {
  const py = calculatePersonalYear(birthDate, forDate);
  const month = parseInt(forDate.split("-")[1]);
  return reduceToSingle(py + month);
}

function calculatePersonalDay(birthDate: string, forDate: string): number {
  const pm = calculatePersonalMonth(birthDate, forDate);
  const day = parseInt(forDate.split("-")[2]);
  return reduceToSingle(pm + day);
}

interface NumberProfile {
  lifePath: number;
  expressionNum: number;
  soulUrgeNum: number;
  birthdayNum: number;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
}

const NUMBER_MEANINGS: Record<number, { title: string; meaning: string }> = {
  1: { title: "The Leader", meaning: "Independence, innovation, and pioneering spirit. You are here to lead, not follow." },
  2: { title: "The Diplomat", meaning: "Cooperation, sensitivity, and balance. You unite people and bring peace." },
  3: { title: "The Communicator", meaning: "Creativity, joy, and self-expression. Your words carry power to uplift." },
  4: { title: "The Builder", meaning: "Stability, discipline, and hard work. You establish foundations that last." },
  5: { title: "The Freedom Seeker", meaning: "Change, adventure, and versatility. You thrive in dynamic environments." },
  6: { title: "The Nurturer", meaning: "Responsibility, family, and service. You are the heart of your community." },
  7: { title: "The Seeker", meaning: "Spirituality, analysis, and inner wisdom. You are called to deep truth." },
  8: { title: "The Powerhouse", meaning: "Authority, abundance, and material mastery. You manifest kingdom wealth." },
  9: { title: "The Humanitarian", meaning: "Compassion, completion, and universal love. You serve the greater good." },
  11: { title: "The Illuminator", meaning: "Intuition, inspiration, and spiritual insight. A master number of revelation." },
  22: { title: "The Master Builder", meaning: "Practical idealism and large-scale manifestation. You build what others dream." },
  33: { title: "The Master Teacher", meaning: "Christ consciousness and unconditional love. You lift others through sacrifice." },
};

function getNumberMeaning(num: number) {
  return NUMBER_MEANINGS[num] || { title: "Unknown", meaning: "No meaning found for this number." };
}

function calculateFullProfile(birthDate: string, name: string, forDate: string): NumberProfile {
  return {
    lifePath: calculateLifePath(birthDate),
    expressionNum: calculateExpression(name),
    soulUrgeNum: calculateSoulUrge(name),
    birthdayNum: calculateBirthday(birthDate),
    personalYear: calculatePersonalYear(birthDate, forDate),
    personalMonth: calculatePersonalMonth(birthDate, forDate),
    personalDay: calculatePersonalDay(birthDate, forDate),
  };
}

export default function NumerologyPage() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [forDate, setForDate] = useState(new Date().toISOString().split("T")[0]);
  const [profile, setProfile] = useState<NumberProfile | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculate = () => {
    if (!name || !birthDate) return;
    setCalculating(true);
    setTimeout(() => {
      setProfile(calculateFullProfile(birthDate, name, forDate));
      setCalculating(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text">
      <header className="border-b border-throne-border bg-throne-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="shrink-0">
              <Crown className="w-5 h-5 text-throne-gold" />
            </Link>
            <div className="h-6 w-px bg-throne-border" />
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-throne-text-muted" />
              <h1 className="text-sm font-heading text-throne-text">BLUEPRINT ENGINE</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <Sparkles className="w-8 h-8 text-throne-gold mx-auto mb-4" />
          <h2 className="text-2xl font-heading text-throne-text mb-3">Discover Your Kingdom Numbers</h2>
          <p className="text-sm text-throne-text-muted max-w-lg mx-auto leading-relaxed">
            Every name vibrates. Every birth date carries a code. Calculate your Life Path, Expression,
            Soul Urge, and daily personal numbers.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-16">
          <div className="p-6 rounded-2xl border border-throne-border bg-throne-surface/40 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs text-throne-text-muted mb-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                placeholder="Nwankwo Moses Ezechukwu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-throne-bg border border-throne-border text-sm text-throne-text placeholder:text-throne-text-muted/40 focus:outline-none focus:border-throne-gold/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-throne-text-muted mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-throne-bg border border-throne-border text-sm text-throne-text focus:outline-none focus:border-throne-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-throne-text-muted mb-2">
                  <Hash className="w-3.5 h-3.5" /> Calculate For
                </label>
                <input
                  type="date"
                  value={forDate}
                  onChange={(e) => setForDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-throne-bg border border-throne-border text-sm text-throne-text focus:outline-none focus:border-throne-gold/50 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={calculate}
              disabled={!name || !birthDate || calculating}
              className="w-full py-2.5 rounded-lg bg-throne-gold text-throne-bg text-sm font-bold hover:bg-throne-goldLight disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {calculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {calculating ? "Calculating..." : "Calculate Blueprint"}
            </button>
          </div>
        </div>

        {profile && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-xs font-heading text-throne-text-muted uppercase tracking-widest mb-4">
                Core Numbers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumCard number={profile.lifePath} label="Life Path" description="Your soul's mission and primary lesson." highlight />
                <NumCard number={profile.expressionNum} label="Expression" description="Your natural talents and abilities." />
                <NumCard number={profile.soulUrgeNum} label="Soul Urge" description="Your innermost desires and motivations." />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-heading text-throne-text-muted uppercase tracking-widest mb-4">
                Personal Numbers for{" "}
                {new Date(forDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumCard number={profile.personalYear} label="Personal Year" description="The overarching theme of your year." />
                <NumCard number={profile.personalMonth} label="Personal Month" description="The focus this month." />
                <NumCard number={profile.personalDay} label="Personal Day" description="The energy available today." />
              </div>
            </div>

            {profile.birthdayNum && (
              <div className="p-5 rounded-xl border border-throne-border bg-throne-surface/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-heading text-throne-gold">{profile.birthdayNum}</span>
                  <span className="text-sm text-throne-text">Birthday Number</span>
                </div>
                <p className="text-xs text-throne-text-muted leading-relaxed">
                  {getNumberMeaning(profile.birthdayNum).meaning}
                </p>
              </div>
            )}
          </div>
        )}

        {!profile && (
          <div className="mt-8">
            <h3 className="text-xs font-heading text-throne-text-muted uppercase tracking-widest mb-4">
              Number Reference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map((num) => {
                const info = NUMBER_MEANINGS[num];
                return (
                  <div key={num} className="p-3 rounded-lg border border-throne-border bg-throne-surface/30 hover:border-throne-gold/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-heading text-throne-text w-6">{num}</span>
                      <span className="text-xs text-throne-text-muted">{info?.title}</span>
                    </div>
                    <p className="text-[11px] text-throne-text-muted leading-relaxed">{info?.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NumCard({
  number,
  label,
  description,
  highlight,
}: {
  number: number;
  label: string;
  description: string;
  highlight?: boolean;
}) {
  const meaning = getNumberMeaning(number);
  return (
    <div
      className={`p-5 rounded-xl border transition-all ${
        highlight
          ? "border-throne-gold/30 bg-throne-gold/5"
          : "border-throne-border bg-throne-surface/30"
      }`}
    >
      <div className="text-[10px] font-heading text-throne-text-muted uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className={`text-3xl font-heading mb-1 ${highlight ? "text-throne-gold" : "text-throne-text"}`}>
        {number}
      </div>
      <div className="text-xs text-throne-text-muted font-medium mb-2">{meaning.title}</div>
      <p className="text-[11px] text-throne-text-muted leading-relaxed">{description}</p>
    </div>
  );
}