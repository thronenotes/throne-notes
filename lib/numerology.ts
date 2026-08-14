/**
 * Throne Notes Numerology Engine
 */

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8
};

export function calculateLifePath(birthDate: string): number {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return reduceToSingleDigit(day + month + year);
}

export function calculateExpression(name: string): number {
  const sum = name.toLowerCase().replace(/[^a-z]/g, '').split('')
    .reduce((acc, char) => acc + (LETTER_VALUES[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

export function calculateSoulUrge(name: string): number {
  const vowels = name.toLowerCase().replace(/[^aeiou]/g, '').split('');
  const sum = vowels.reduce((acc, char) => acc + (LETTER_VALUES[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

export function calculateBirthday(birthDate: string): number {
  const day = new Date(birthDate).getDate();
  return reduceToSingleDigit(day);
}

export function calculatePersonalYear(birthDate: string, forDate?: string): number {
  const target = forDate ? new Date(forDate) : new Date();
  const birth = new Date(birthDate);
  const sum = birth.getDate() + (birth.getMonth() + 1) + target.getFullYear();
  return reduceToSingleDigit(sum);
}

export function calculatePersonalMonth(birthDate: string, forDate?: string): number {
  const pYear = calculatePersonalYear(birthDate, forDate);
  const target = forDate ? new Date(forDate) : new Date();
  return reduceToSingleDigit(pYear + target.getMonth() + 1);
}

export function calculatePersonalDay(birthDate: string, forDate?: string): number {
  const pMonth = calculatePersonalMonth(birthDate, forDate);
  const target = forDate ? new Date(forDate) : new Date();
  return reduceToSingleDigit(pMonth + target.getDate());
}

export function calculateFullProfile(birthDate: string, name: string, forDate?: string) {
  return {
    life_path: calculateLifePath(birthDate),
    expression_num: calculateExpression(name),
    soul_urge_num: calculateSoulUrge(name),
    birthday_num: calculateBirthday(birthDate),
    personal_year: calculatePersonalYear(birthDate, forDate),
    personal_month: calculatePersonalMonth(birthDate, forDate),
    personal_day: calculatePersonalDay(birthDate, forDate),
  };
}

export const NUMBER_MEANINGS: Record<number, { title: string; meaning: string }> = {
  1: { title: "The Leader", meaning: "Independence, initiative, originality." },
  2: { title: "The Peacemaker", meaning: "Diplomacy, cooperation, sensitivity." },
  3: { title: "The Creator", meaning: "Expression, creativity, joy." },
  4: { title: "The Builder", meaning: "Stability, discipline, hard work." },
  5: { title: "The Freedom Seeker", meaning: "Adventure, change, versatility." },
  6: { title: "The Nurturer", meaning: "Responsibility, service, love." },
  7: { title: "The Seeker", meaning: "Spirituality, wisdom, introspection." },
  8: { title: "The Powerhouse", meaning: "Authority, abundance, karma." },
  9: { title: "The Humanitarian", meaning: "Compassion, completion, love." },
  11: { title: "The Illuminator", meaning: "Intuition, inspiration, spiritual insight." },
  22: { title: "The Master Builder", meaning: "Practical idealism, large-scale manifestation." },
  33: { title: "The Master Teacher", meaning: "Christ consciousness, universal love." },
};

export function getNumberMeaning(num: number) {
  return NUMBER_MEANINGS[num] || { title: "Unknown", meaning: "Number meaning not found." };
}
