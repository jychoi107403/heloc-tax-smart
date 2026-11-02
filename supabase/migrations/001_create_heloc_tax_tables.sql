-- ==============================================================================
-- 001_create_heloc_tax_tables.sql
-- 목적: HelocTaxSmart 사이트의 HELOC 한도/상환 시나리오 저장 및 보안 피드백 테이블 생성
-- 규칙 준수:
--   1. 파일명 앞에 001_ 순서 번호 부여 및 supabase/migrations 폴더 내 정리
--   2. 모든 사용자 메모 및 식별 정보는 클라이언트에서 AES-256-GCM / SHA-256 암호화 후 저장
--   3. Row Level Security (RLS) 활성화로 익명 사용자의 타인 데이터 조회 원천 차단
-- ==============================================================================

-- 1. HELOC 한도 및 월 상환액 시나리오 저장 테이블
CREATE TABLE IF NOT EXISTS public.heloc_tax_scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    state_slug VARCHAR(64) NOT NULL,            -- 선택한 주 슬러그
    home_value NUMERIC(12, 2) NOT NULL,         -- 현재 주택 시세 ($)
    mortgage_balance NUMERIC(12, 2) NOT NULL,   -- 남은 1순위 모기지 잔액 ($)
    max_cltv_pct NUMERIC(5, 2) NOT NULL,        -- 최대 CLTV 한도 (%)
    max_heloc_limit NUMERIC(12, 2) NOT NULL,    -- 산출된 최대 HELOC 한도 ($)
    draw_amount NUMERIC(12, 2) NOT NULL,        -- 실제 인출(Draw) 희망 금액 ($)
    interest_only_payment NUMERIC(10, 2) NOT NULL, -- 거치 기간 월 이자 납입금 ($)
    repayment_monthly NUMERIC(10, 2) NOT NULL,  -- 상환 기간 월 원리금 납입금 ($)
    encrypted_note TEXT                         -- 클라이언트 AES-256-GCM 암호화된 메모
);

CREATE INDEX IF NOT EXISTS idx_heloc_tax_scenarios_state ON public.heloc_tax_scenarios (state_slug);
CREATE INDEX IF NOT EXISTS idx_heloc_tax_scenarios_created_at ON public.heloc_tax_scenarios (created_at DESC);

ALTER TABLE public.heloc_tax_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous heloc scenario insert"
    ON public.heloc_tax_scenarios
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. 사이트 보안 피드백 테이블
CREATE TABLE IF NOT EXISTS public.heloc_tax_feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    category VARCHAR(50) NOT NULL,
    email_sha256_hash VARCHAR(128),
    encrypted_contact TEXT,
    message TEXT NOT NULL,
    page_url TEXT,
    status VARCHAR(30) DEFAULT 'new' NOT NULL
);

ALTER TABLE public.heloc_tax_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous heloc feedback insert"
    ON public.heloc_tax_feedbacks
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

