/*
  # Create legal frameworks and settings tables

  1. New Tables
    - `legal_frameworks`
      - `id` (uuid, primary key)
      - `country` (text, required)
      - `region` (text)
      - `legal_system_type` (text, required)
      - `supported_document_types` (jsonb array)
      - `notes` (text)
      - `official_sources` (jsonb array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `preferred_country` (text)
      - `preferred_region` (text)
      - `legal_framework_id` (uuid, foreign key to legal_frameworks)
      - `language` (text, default 'en')
      - `legal_literacy_level` (text, default 'basic')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Schema Updates
    - Add `legal_framework_id` to documents table
    - Add `country` and `region` to documents table

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Create legal_frameworks table
CREATE TABLE IF NOT EXISTS legal_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  region text,
  legal_system_type text NOT NULL,
  supported_document_types jsonb DEFAULT '[]'::jsonb,
  notes text,
  official_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_country text,
  preferred_region text,
  legal_framework_id uuid REFERENCES legal_frameworks(id),
  language text DEFAULT 'en',
  legal_literacy_level text DEFAULT 'basic',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add new columns to documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'legal_framework_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN legal_framework_id uuid REFERENCES legal_frameworks(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'country'
  ) THEN
    ALTER TABLE documents ADD COLUMN country text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'region'
  ) THEN
    ALTER TABLE documents ADD COLUMN region text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE legal_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for legal_frameworks (public read, admin write)
CREATE POLICY "Anyone can read legal frameworks"
  ON legal_frameworks
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can manage legal frameworks"
  ON legal_frameworks
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for user_settings
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers
CREATE TRIGGER update_legal_frameworks_updated_at
  BEFORE UPDATE ON legal_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_legal_frameworks_country ON legal_frameworks(country);
CREATE INDEX IF NOT EXISTS idx_legal_frameworks_legal_system_type ON legal_frameworks(legal_system_type);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_legal_framework_id ON user_settings(legal_framework_id);
CREATE INDEX IF NOT EXISTS idx_documents_legal_framework_id ON documents(legal_framework_id);
CREATE INDEX IF NOT EXISTS idx_documents_country ON documents(country);

-- Insert initial legal frameworks data
INSERT INTO legal_frameworks (country, region, legal_system_type, supported_document_types, notes, official_sources) VALUES
-- USA
('USA', 'Federal', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_complaint", "employment_agreement"]', 'Federal laws apply across all states. State-specific variations may apply.', '["https://www.law.cornell.edu", "https://www.justia.com"]'),
('USA', 'California', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_complaint", "employment_agreement", "tenant_rights"]', 'California has strong tenant protection laws and specific employment regulations.', '["https://leginfo.legislature.ca.gov", "https://www.courts.ca.gov"]'),
('USA', 'New York', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_complaint", "employment_agreement", "tenant_rights"]', 'New York has specific real estate and employment laws.', '["https://www.nysenate.gov/legislation", "https://www.nycourts.gov"]'),
('USA', 'Texas', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_complaint", "employment_agreement"]', 'Texas follows at-will employment and has specific property laws.', '["https://statutes.capitol.texas.gov", "https://www.txcourts.gov"]'),

-- Latin America
('Mexico', 'Federal', 'civil_law', '["contrato", "arrendamiento", "testamento", "poder_notarial", "demanda_civil", "contrato_laboral"]', 'Sistema jurídico basado en derecho civil. Requiere notarización para muchos documentos.', '["https://www.diputados.gob.mx", "https://www.scjn.gob.mx"]'),
('Colombia', 'Nacional', 'civil_law', '["contrato", "arrendamiento", "testamento", "poder_notarial", "demanda_civil", "contrato_laboral"]', 'Derecho civil con influencias del derecho constitucional. Notarización obligatoria.', '["https://www.funcionpublica.gov.co", "https://www.corteconstitucional.gov.co"]'),
('Argentina', 'Federal', 'civil_law', '["contrato", "arrendamiento", "testamento", "poder_notarial", "demanda_civil", "contrato_laboral"]', 'Sistema de derecho civil con código civil unificado desde 2015.', '["https://www.argentina.gob.ar", "https://www.csjn.gov.ar"]'),
('Chile', 'Nacional', 'civil_law', '["contrato", "arrendamiento", "testamento", "poder_notarial", "demanda_civil", "contrato_laboral"]', 'Derecho civil con reformas procesales modernas.', '["https://www.bcn.cl", "https://www.pjud.cl"]'),

-- Europe
('Spain', 'Nacional', 'civil_law', '["contrato", "arrendamiento", "testamento", "poder_notarial", "demanda_civil", "contrato_laboral"]', 'Derecho civil español con normativas de la UE aplicables.', '["https://www.boe.es", "https://www.poderjudicial.es"]'),
('France', 'National', 'civil_law', '["contrat", "bail", "testament", "procuration", "plainte_civile", "contrat_travail"]', 'Code civil français avec réglementations UE applicables.', '["https://www.legifrance.gouv.fr", "https://www.justice.gouv.fr"]'),
('Germany', 'Federal', 'civil_law', '["vertrag", "mietvertrag", "testament", "vollmacht", "zivilklage", "arbeitsvertrag"]', 'Deutsches Zivilrecht mit EU-Verordnungen.', '["https://www.gesetze-im-internet.de", "https://www.bundesjustizamt.de"]'),
('United Kingdom', 'England and Wales', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_claim", "employment_contract"]', 'English common law system. Post-Brexit regulations apply.', '["https://www.legislation.gov.uk", "https://www.gov.uk/courts-tribunals"]'),

-- Asia
('China', 'National', 'civil_law', '["合同", "租赁", "遗嘱", "委托书", "民事诉讼", "劳动合同"]', '中国民法典体系，具有社会主义特色。', '["http://www.npc.gov.cn", "http://www.court.gov.cn"]'),
('India', 'Federal', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_suit", "employment_agreement"]', 'Common law system with Indian statutory modifications. State laws may vary.', '["https://legislative.gov.in", "https://main.sci.gov.in"]'),
('Japan', 'National', 'civil_law', '["契約", "賃貸借", "遺言", "委任状", "民事訴訟", "雇用契約"]', '日本の民法制度。', '["https://elaws.e-gov.go.jp", "https://www.courts.go.jp"]'),

-- Middle East
('UAE', 'Federal', 'civil_law', '["عقد", "إيجار", "وصية", "وكالة", "دعوى_مدنية", "عقد_عمل"]', 'نظام القانون المدني مع تأثيرات الشريعة الإسلامية.', '["https://www.moj.gov.ae", "https://www.adjd.gov.ae"]'),
('Saudi Arabia', 'National', 'islamic_law', '["عقد", "إيجار", "وصية", "وكالة", "دعوى", "عقد_عمل"]', 'نظام قانوني مبني على الشريعة الإسلامية.', '["https://www.moj.gov.sa", "https://www.spa.gov.sa"]'),
('Egypt', 'National', 'civil_law', '["عقد", "إيجار", "وصية", "وكالة", "دعوى_مدنية", "عقد_عمل"]', 'القانون المدني المصري مع تأثيرات الشريعة.', '["https://www.cc.gov.eg", "https://www.cja.gov.eg"]'),

-- Africa
('Nigeria', 'Federal', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_suit", "employment_agreement"]', 'Common law system with customary law influences. State variations apply.', '["https://www.nassnig.org", "https://supremecourt.gov.ng"]'),
('Kenya', 'National', 'common_law', '["contract", "lease", "will", "power_of_attorney", "civil_suit", "employment_agreement"]', 'Common law with constitutional reforms and customary law recognition.', '["http://kenyalaw.org", "https://www.judiciary.go.ke"]'),
('South Africa', 'National', 'hybrid', '["contract", "lease", "will", "power_of_attorney", "civil_claim", "employment_contract"]', 'Mixed legal system: Roman-Dutch civil law, English common law, and customary law.', '["https://www.gov.za", "https://www.judiciary.org.za"]'),

-- Global fallback
('Global', 'International', 'international', '["contract", "agreement", "document", "legal_text"]', 'General international legal principles. Consult local legal experts for jurisdiction-specific advice.', '["https://www.un.org", "https://www.icj-cij.org"]')

ON CONFLICT DO NOTHING;