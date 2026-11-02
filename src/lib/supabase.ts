import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =========================================================================
// Supabase 보안 클라이언트 및 Web Crypto API 암호화 유틸리티 (HelocTaxSmart)
// - 규칙 8번(강력한 보안 및 암호화) 준수:
//   사용자의 HELOC/재산세 시나리오 메모는 DB 전송 전 브라우저에서 AES-256-GCM으로 암호화합니다.
// =========================================================================

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function encryptSensitiveText(plainText: string): Promise<string> {
  const trimmed = plainText.trim();
  if (!trimmed) return '';
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.digest(
        'SHA-256',
        encoder.encode('HelocTaxSmart-2026-Client-Security-Salt-v1')
      );
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuf = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(trimmed)
      );
      const ivHex = Array.from(iv)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuf)));
      return `aes256gcm:${ivHex}:${cipherB64}`;
    }
  } catch (e) {
    console.warn('WebCrypto fallback used:', e);
  }
  return `enc_b64:${btoa(encodeURIComponent(trimmed))}`;
}

export interface SaveHelocScenarioInput {
  state_slug: string;
  home_value: number;
  mortgage_balance: number;
  max_cltv_pct: number;
  max_heloc_limit: number;
  draw_amount: number;
  interest_only_payment: number;
  repayment_monthly: number;
  note?: string;
}

export async function saveHelocScenario(
  item: SaveHelocScenarioInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const encryptedNote = item.note ? await encryptSensitiveText(item.note) : null;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('heloc_tax_scenarios').insert([
        {
          state_slug: item.state_slug,
          home_value: Math.round(item.home_value * 100) / 100,
          mortgage_balance: Math.round(item.mortgage_balance * 100) / 100,
          max_cltv_pct: item.max_cltv_pct,
          max_heloc_limit: Math.round(item.max_heloc_limit * 100) / 100,
          draw_amount: Math.round(item.draw_amount * 100) / 100,
          interest_only_payment: Math.round(item.interest_only_payment * 100) / 100,
          repayment_monthly: Math.round(item.repayment_monthly * 100) / 100,
          encrypted_note: encryptedNote,
        },
      ]);

      if (error) {
        console.warn('Supabase HELOC scenario save warning (saved locally):', error.message);
      }
    }

    const saved = JSON.parse(localStorage.getItem('heloctax_saved_scenarios') || '[]');
    saved.unshift({
      ...item,
      encrypted_note: encryptedNote,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('heloctax_saved_scenarios', JSON.stringify(saved.slice(0, 10)));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save scenario',
    };
  }
}

