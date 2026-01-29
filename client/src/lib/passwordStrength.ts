export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordAnalysis {
  strength: PasswordStrength;
  score: number;
  length: number;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  isCommonPassword: boolean;
  hasSequentialChars: boolean;
  hasRepeatingChars: boolean;
  estimatedCrackTime: string;
  alphabetSize: number;
  crackTimeEstimate: CrackTimeEstimate;
}

export interface AttackPreset {
  id: string;
  labelKey: string;
  guessesPerSecond: number;
  notesKey: string;
}

export interface CrackTimeEstimate {
  log10SecondsAvg: number;
  log10SecondsWorst: number;
  log10Keyspace: number;
  avgTimeFormatted: FormattedDuration;
  worstTimeFormatted: FormattedDuration;
}

export interface FormattedDuration {
  value: number;
  unitKey: string;
  isScientific: boolean;
  mantissa?: number;
  exponent?: number;
  displayString: string;
}

export const ATTACK_PRESETS: Record<string, AttackPreset> = {
  OFFLINE_FAST_HASH: {
    id: "OFFLINE_FAST_HASH",
    labelKey: "passwordTraining.presetFastHash",
    guessesPerSecond: 3.0e11,
    notesKey: "passwordTraining.presetFastHashNotes",
  },
  OFFLINE_BCRYPT: {
    id: "OFFLINE_BCRYPT",
    labelKey: "passwordTraining.presetBcrypt",
    guessesPerSecond: 9375,
    notesKey: "passwordTraining.presetBcryptNotes",
  },
};

export const DEFAULT_PRESET_ID = "OFFLINE_FAST_HASH";

const CHARSET_SIZES = {
  LOWER: 26,
  UPPER: 26,
  DIGIT: 10,
  SYMBOL: 33,
};

interface TimeUnit {
  key: string;
  secondsPerUnit: number;
}

const TIME_UNITS: TimeUnit[] = [
  { key: "seconds", secondsPerUnit: 1 },
  { key: "minutes", secondsPerUnit: 60 },
  { key: "hours", secondsPerUnit: 3600 },
  { key: "days", secondsPerUnit: 86400 },
  { key: "years", secondsPerUnit: 31557600 },
];

const COMMON_PASSWORDS = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "master",
  "dragon",
  "admin",
  "letmein",
  "welcome",
  "login",
  "princess",
  "starwars",
  "password1",
  "password123",
  "iloveyou",
  "sunshine",
  "default",
  "guest",
  "wifi",
  "network",
  "home",
  "router",
  "internet",
  "pass1234",
  "changeme",
];

const SEQUENTIAL_PATTERNS = [
  "abc",
  "bcd",
  "cde",
  "def",
  "efg",
  "fgh",
  "ghi",
  "hij",
  "ijk",
  "jkl",
  "klm",
  "lmn",
  "mno",
  "nop",
  "opq",
  "pqr",
  "qrs",
  "rst",
  "stu",
  "tuv",
  "uvw",
  "vwx",
  "wxy",
  "xyz",
  "123",
  "234",
  "345",
  "456",
  "567",
  "678",
  "789",
  "890",
  "qwe",
  "wer",
  "ert",
  "rty",
  "tyu",
  "yui",
  "uio",
  "iop",
  "asd",
  "sdf",
  "dfg",
  "fgh",
  "ghj",
  "hjk",
  "jkl",
  "zxc",
  "xcv",
  "cvb",
  "vbn",
  "bnm",
];

function hasSequentialChars(password: string): boolean {
  const lower = password.toLowerCase();
  return SEQUENTIAL_PATTERNS.some((seq) => lower.includes(seq));
}

function hasRepeatingChars(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_PASSWORDS.some(
    (common) => lower === common || lower.includes(common) || common.includes(lower)
  );
}

function calculateAlphabetSize(
  hasLowercase: boolean,
  hasUppercase: boolean,
  hasNumbers: boolean,
  hasSymbols: boolean
): number {
  let size = 0;
  if (hasLowercase) size += CHARSET_SIZES.LOWER;
  if (hasUppercase) size += CHARSET_SIZES.UPPER;
  if (hasNumbers) size += CHARSET_SIZES.DIGIT;
  if (hasSymbols) size += CHARSET_SIZES.SYMBOL;
  return size > 0 ? size : 26;
}

function estimateCrackTimeLog10(
  length: number,
  alphabetSize: number,
  guessesPerSecond: number
): { log10SecondsAvg: number; log10SecondsWorst: number; log10Keyspace: number } {
  const log10Keyspace = length * Math.log10(alphabetSize);
  const log10GuessRate = Math.log10(guessesPerSecond);
  const log10SecondsWorst = log10Keyspace - log10GuessRate;
  const log10SecondsAvg = log10Keyspace - log10GuessRate - Math.log10(2);

  return { log10SecondsAvg, log10SecondsWorst, log10Keyspace };
}

function formatDurationFromLog10(log10Seconds: number): FormattedDuration {
  if (!isFinite(log10Seconds) || log10Seconds < 0) {
    return {
      value: 0,
      unitKey: "instant",
      isScientific: false,
      displayString: "instant",
    };
  }

  let bestUnit: TimeUnit = TIME_UNITS[0];
  for (const unit of TIME_UNITS) {
    const log10ValueInUnit = log10Seconds - Math.log10(unit.secondsPerUnit);
    if (log10ValueInUnit >= 0) {
      bestUnit = unit;
    }
  }

  const log10Value = log10Seconds - Math.log10(bestUnit.secondsPerUnit);

  if (log10Value >= 6) {
    const exponent = Math.floor(log10Value);
    const mantissa = Math.pow(10, log10Value - exponent);
    return {
      value: mantissa * Math.pow(10, exponent),
      unitKey: bestUnit.key,
      isScientific: true,
      mantissa: parseFloat(mantissa.toFixed(1)),
      exponent,
      displayString: `${mantissa.toFixed(1)}×10^${exponent}`,
    };
  }

  const value = Math.pow(10, log10Value);
  const roundedValue = value < 10 ? parseFloat(value.toFixed(1)) : Math.round(value);

  return {
    value: roundedValue,
    unitKey: bestUnit.key,
    isScientific: false,
    displayString: roundedValue.toString(),
  };
}

export function calculateCrackTime(
  length: number,
  alphabetSize: number,
  presetId: string = DEFAULT_PRESET_ID
): CrackTimeEstimate {
  if (length <= 0 || alphabetSize <= 0) {
    return {
      log10SecondsAvg: -Infinity,
      log10SecondsWorst: -Infinity,
      log10Keyspace: 0,
      avgTimeFormatted: formatDurationFromLog10(-Infinity),
      worstTimeFormatted: formatDurationFromLog10(-Infinity),
    };
  }

  const preset = ATTACK_PRESETS[presetId] || ATTACK_PRESETS[DEFAULT_PRESET_ID];
  const { log10SecondsAvg, log10SecondsWorst, log10Keyspace } = estimateCrackTimeLog10(
    length,
    alphabetSize,
    preset.guessesPerSecond
  );

  return {
    log10SecondsAvg,
    log10SecondsWorst,
    log10Keyspace,
    avgTimeFormatted: formatDurationFromLog10(log10SecondsAvg),
    worstTimeFormatted: formatDurationFromLog10(log10SecondsWorst),
  };
}

function estimateCrackTimeLabel(score: number, length: number): string {
  if (length < 8) return "instant";
  if (score < 3) return "seconds";
  if (score < 5) return "minutes";
  if (score < 7) return "hours";
  if (score < 9) return "days";
  if (score < 11) return "months";
  if (score < 13) return "years";
  return "centuries";
}

export function analyzePassword(
  password: string,
  presetId: string = DEFAULT_PRESET_ID
): PasswordAnalysis {
  const length = password.length;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  const commonPassword = isCommonPassword(password);
  const sequential = hasSequentialChars(password);
  const repeating = hasRepeatingChars(password);

  const alphabetSize = calculateAlphabetSize(hasLowercase, hasUppercase, hasNumbers, hasSymbols);

  let score = 0;

  if (length >= 8) score += 1;
  if (length >= 12) score += 2;
  if (length >= 16) score += 2;
  if (length >= 20) score += 1;

  if (hasLowercase) score += 1;
  if (hasUppercase) score += 2;
  if (hasNumbers) score += 1;
  if (hasSymbols) score += 3;

  if (commonPassword) score -= 5;
  if (sequential) score -= 2;
  if (repeating) score -= 1;

  const charTypesUsed = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  if (charTypesUsed >= 3) score += 2;
  if (charTypesUsed === 4) score += 2;

  score = Math.max(0, score);

  let strength: PasswordStrength;
  if (length < 8 || commonPassword || score < 5) {
    strength = "weak";
  } else if (score < 9 || length < 12) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  const crackTimeEstimate = calculateCrackTime(length, alphabetSize, presetId);

  return {
    strength,
    score,
    length,
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSymbols,
    isCommonPassword: commonPassword,
    hasSequentialChars: sequential,
    hasRepeatingChars: repeating,
    estimatedCrackTime: estimateCrackTimeLabel(score, length),
    alphabetSize,
    crackTimeEstimate,
  };
}

export function getWeakExamplePassword(): string {
  return "wifi2024";
}

export function formatKeyspace(log10Keyspace: number): string {
  if (log10Keyspace < 6) {
    return Math.round(Math.pow(10, log10Keyspace)).toLocaleString();
  }
  const exponent = Math.floor(log10Keyspace);
  const mantissa = Math.pow(10, log10Keyspace - exponent);
  return `${mantissa.toFixed(1)}×10^${exponent}`;
}
