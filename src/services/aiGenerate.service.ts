import { z } from 'zod';
import { AppError } from '../utils/AppError';

const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
// llama-3.3-70b queue-times-out on NIM; nemotron-49b measured ~43s with high quality.
const DEFAULT_MODEL = 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
const TIMEOUT_MS = 120_000;
const TOTAL_BUDGET_MS = 140_000;

// Keep in sync with commonIcons in frontend ServiceFormStep1.tsx
const ALLOWED_ICONS = [
  'Receipt', 'FileText', 'Calculator', 'Building2', 'Award', 'Scale',
  'Briefcase', 'Shield', 'CheckCircle', 'Users', 'Zap', 'TrendingUp',
  'Landmark', 'Banknote', 'Percent', 'BadgeCheck', 'FileBadge', 'Stamp',
  'ClipboardCheck', 'FileCheck', 'FileSearch', 'FileSpreadsheet', 'Wallet',
  'CircleDollarSign', 'CreditCard', 'Library', 'Gavel', 'Building',
  'BadgeDollarSign', 'ChartBar', 'ChartLine', 'ChartPie', 'Coins', 'IndianRupee',
  'HandCoins', 'PiggyBank', 'ReceiptIndianRupee', 'CirclePercent',
  'FilePenLine', 'FileChartColumn', 'FileClock', 'FolderSearch',
  'ShieldCheck', 'ShieldAlert', 'BriefcaseBusiness', 'Store',
  'WalletCards', 'WalletMinimal', 'TicketCheck', 'BadgePercent',
  'CircleCheck', 'CircleHelp', 'ClipboardList', 'ClipboardSignature',
  'DollarSign', 'Handshake', 'NotebookPen', 'Scan', 'ShieldHalf',
  'ShieldQuestion', 'Signature', 'TicketPercent', 'UserCheck',
  'UsersRound', 'FolderCheck', 'FolderClock', 'FolderKey',
];

export interface GenerateServiceInput {
  title: string;
  category?: string;
  subcategory?: string;
}

export interface GeneratedServiceDetails {
  shortDescription: string;
  longDescription: string;
  iconName: string;
  price: { min: number; max: number; currency: string };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: { step: number; title: string; description: string; duration: string }[];
  faqs: { id: string; question: string; answer: string }[];
}

const rawResponseSchema = z.object({
  shortDescription: z.string().min(10),
  longDescription: z.string().min(50),
  iconName: z.string().min(1),
  price: z.object({
    min: z.number().min(0).max(10_000_000),
    max: z.number().min(0).max(10_000_000),
    currency: z.string().default('INR'),
  }),
  duration: z.string().min(1),
  features: z.array(z.string().min(1)).min(3),
  benefits: z.array(z.string().min(1)).min(3),
  requirements: z.array(z.string().min(1)).min(1),
  process: z
    .array(
      z.object({
        step: z.number().optional(),
        title: z.string().min(1),
        description: z.string().min(1),
        duration: z.string().min(1),
      })
    )
    .min(3),
  faqs: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .min(3),
});

const buildSystemPrompt = (): string => `You are a senior consultant at an Indian tax, compliance and business-registration firm. You know current Indian regulations, government fees, timelines and documentation requirements (GST, Income Tax, MCA/ROC, trademarks, IPO, banking & finance, legal services).

Given a service title, produce complete website content for that service. Respond with ONLY a single JSON object — no markdown, no code fences, no commentary — with exactly these keys:

{
  "shortDescription": "string, 50-400 characters, one crisp paragraph",
  "longDescription": "string, 200+ characters, 2-3 plain-text paragraphs separated by \\n\\n",
  "iconName": "one of: ${ALLOWED_ICONS.join(', ')}",
  "price": { "min": number, "max": number, "currency": "INR" },
  "duration": "string like '7-10 working days'",
  "features": ["5-8 short strings — what is included in the service"],
  "benefits": ["4-6 short strings — outcomes for the client"],
  "requirements": ["3-8 short strings — documents/prerequisites, e.g. 'PAN Card of all directors'"],
  "process": [{ "step": 1, "title": "string", "description": "string", "duration": "string like '1-2 days'" } /* 4-6 steps */],
  "faqs": [{ "question": "string", "answer": "string" } /* 4-6 items */]
}

Rules:
- price is the realistic ALL-IN market range in INR (government fees + professional fees) for this service in India.
- Content must be specific to the exact service, factual and client-facing. No placeholder text.`;

const buildUserPrompt = (input: GenerateServiceInput): string => {
  const parts = [`Service title: ${input.title}`];
  if (input.category) parts.push(`Category: ${input.category}`);
  if (input.subcategory) parts.push(`Subcategory: ${input.subcategory}`);
  return parts.join('\n');
};

/** Strip code fences / prose and parse the first JSON object in the text. */
const extractJson = (text: string): unknown => {
  const cleaned = text.replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model output');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

const callNim = async (
  messages: { role: string; content: string }[],
  timeoutMs: number
): Promise<string> => {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    throw new AppError('AI generation is not configured on the server', 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(NIM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.NIM_MODEL || DEFAULT_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`NIM API error ${response.status}: ${body.slice(0, 500)}`);
      throw new AppError('AI generation failed — please try again', 502);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new AppError('AI generation failed — please try again', 502);
    }
    return content;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new AppError('AI generation timed out — please try again', 502);
    }
    console.error('NIM request failed:', error);
    throw new AppError('AI generation failed — please try again', 502);
  } finally {
    clearTimeout(timer);
  }
};

const sanitize = (
  raw: z.infer<typeof rawResponseSchema>
): GeneratedServiceDetails => {
  const min = Math.min(raw.price.min, raw.price.max);
  const max = Math.max(raw.price.min, raw.price.max);
  const now = Date.now();
  return {
    shortDescription: raw.shortDescription.slice(0, 500),
    longDescription: raw.longDescription,
    iconName: ALLOWED_ICONS.includes(raw.iconName) ? raw.iconName : 'FileText',
    price: { min, max, currency: 'INR' },
    duration: raw.duration,
    features: raw.features,
    benefits: raw.benefits,
    requirements: raw.requirements,
    process: raw.process.map((p, i) => ({
      step: i + 1,
      title: p.title,
      description: p.description,
      duration: p.duration,
    })),
    faqs: raw.faqs.map((f, i) => ({
      id: `faq-${now}-${i}`,
      question: f.question,
      answer: f.answer,
    })),
  };
};

export const generateServiceDetails = async (
  input: GenerateServiceInput
): Promise<GeneratedServiceDetails> => {
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(input) },
  ];

  const deadline = Date.now() + TOTAL_BUDGET_MS;

  // Attempt 1, then one retry with a stronger JSON reminder.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 5_000) {
      throw new AppError('AI generation timed out — please try again', 502);
    }
    const content = await callNim(
      attempt === 1
        ? messages
        : [
            ...messages,
            {
              role: 'user',
              content:
                'Your previous output was not valid JSON matching the schema. Return ONLY the JSON object, nothing else.',
            },
          ],
      Math.min(TIMEOUT_MS, remaining)
    );
    try {
      const parsed = rawResponseSchema.parse(extractJson(content));
      return sanitize(parsed);
    } catch (error) {
      console.error(`AI generate parse/validation failed (attempt ${attempt}):`, error);
      if (attempt === 2) {
        throw new AppError('AI generation failed — please try again', 502);
      }
    }
  }
  // Unreachable, but satisfies TypeScript.
  throw new AppError('AI generation failed — please try again', 502);
};
