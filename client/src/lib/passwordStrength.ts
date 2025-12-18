export type PasswordStrength = 'weak' | 'medium' | 'strong';

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
}

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', 'admin', 'letmein', 'welcome', 'login', 'princess', 'starwars',
  'password1', 'password123', 'iloveyou', 'sunshine', 'default', 'guest',
  'wifi', 'network', 'home', 'router', 'internet', 'pass1234', 'changeme'
];

const SEQUENTIAL_PATTERNS = [
  'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl',
  'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv',
  'uvw', 'vwx', 'wxy', 'xyz',
  '123', '234', '345', '456', '567', '678', '789', '890',
  'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
  'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
  'zxc', 'xcv', 'cvb', 'vbn', 'bnm'
];

function hasSequentialChars(password: string): boolean {
  const lower = password.toLowerCase();
  return SEQUENTIAL_PATTERNS.some(seq => lower.includes(seq));
}

function hasRepeatingChars(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_PASSWORDS.some(common => 
    lower === common || lower.includes(common) || common.includes(lower)
  );
}

function estimateCrackTime(score: number, length: number): string {
  if (length < 8) return 'instant';
  if (score < 3) return 'seconds';
  if (score < 5) return 'minutes';
  if (score < 7) return 'hours';
  if (score < 9) return 'days';
  if (score < 11) return 'months';
  if (score < 13) return 'years';
  return 'centuries';
}

export function analyzePassword(password: string): PasswordAnalysis {
  const length = password.length;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const commonPassword = isCommonPassword(password);
  const sequential = hasSequentialChars(password);
  const repeating = hasRepeatingChars(password);

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
    strength = 'weak';
  } else if (score < 9 || length < 12) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

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
    estimatedCrackTime: estimateCrackTime(score, length),
  };
}

export function getWeakExamplePassword(): string {
  return 'wifi2024';
}
