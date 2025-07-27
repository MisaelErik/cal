
export interface InitialData {
  [key: string]: number | string;
}

export interface CalculationStep {
  step_name: string;
  target_variable: string;
  formula_name: string;
  inputs: { [key: string]: number | string };
  generated_formula?: string; // For experimental mode
}

export interface CalculationPlan {
  interpretation: string;
  initial_data: InitialData;
  final_target_variable: string;
  calculation_steps: CalculationStep[];
}

export interface ExecutedStep extends CalculationStep {
  result: number | string;
  substituted_formula: string;
}

export type Provider = 'gemini_studio' | 'openrouter_kimi' | 'openrouter_mistral' | 'openrouter_geo' | 'openrouter_deepseek' | 'all';
export type Mode = 'preciso' | 'experimental';

export interface AppResult {
    provider: string;
    plan: CalculationPlan | null;
    executedSteps: ExecutedStep[] | null;
    error: string | null;
    rawError: any | null;
}

export type UserRole = 'free' | 'pro' | 'owner';

export interface User {
    id: string;
    username: string;
    password: string;
    role: UserRole;
    credits: number;
    creditsConfig: {
        initialAmount: number;
        renewalDays: number; // 0 for no renewal
    };
    lastCreditReset: string; // ISO date string
    proExpiresAt?: string; // ISO date string, for timed Pro subscriptions
    redeemedCodes?: string[]; // Array of code IDs
}

export interface HistoryItem {
  id: string;
  problemDescription: string;
  results: AppResult[];
  timestamp: number;
}

export type View = 'solver' | 'manual' | 'history' | 'admin' | 'database';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface RedeemCode {
  id: string;
  code: string;
  rewards: {
    credits: number;
    proDays: number;
  };
  maxUses: number; // 0 for infinite
  usersWhoRedeemed: string[]; // Array of user IDs
}

export interface BroadcastMessage {
  id: string;
  content: string;
  targetUserId?: string; // If undefined, it's for all users
  timestamp: number;
}

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}
