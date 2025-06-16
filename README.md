# JustGuide Backend

JustGuide is an AI-powered platform that helps users understand, complete, and manage complex legal documents with global legal framework support. This backend provides the database schema and API endpoints for the core functionality.

## Database Schema

### Core Tables

1. **users** - User profiles and authentication
   - `id` (uuid, primary key)
   - `name` (text, required)
   - `email` (text, unique, required)  
   - `hashed_password` (text, managed by Supabase Auth)
   - `language` (text, default 'en')
   - `literacy_level` (text, default 'basic')
   - `uploaded_documents` (jsonb array)
   - `history` (jsonb object)
   - Timestamps: `created_at`, `updated_at`

2. **documents** - Uploaded legal documents with metadata
   - `id` (uuid, primary key)
   - `title` (text, required)
   - `document_type` (text, required)
   - `language` (text, default 'en')
   - `file_url` (text, required)
   - `extracted_text` (text)
   - `user_id` (uuid, foreign key to users)
   - `legal_framework_id` (uuid, foreign key to legal_frameworks)
   - `country` (text)
   - `region` (text)
   - `upload_date` (timestamptz, default now)
   - Timestamps: `created_at`, `updated_at`

3. **simplified_guides** - AI-generated plain language summaries
   - `id` (uuid, primary key)
   - `document_id` (uuid, foreign key to documents)
   - `summary` (text, required)
   - `step_by_step_explanation` (text, required)
   - `reading_level` (text, default 'elementary')
   - Timestamps: `created_at`, `updated_at`

4. **assisted_responses** - User responses filled with AI assistance
   - `id` (uuid, primary key)
   - `document_id` (uuid, foreign key to documents)
   - `user_id` (uuid, foreign key to users)
   - `answers` (jsonb object)
   - `completion_status` (text, default 'in_progress')
   - Timestamps: `created_at`, `updated_at`
   - Unique constraint: (document_id, user_id)

5. **legal_history** - User legal interactions tracking
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to users)
   - `procedure_type` (text, required)
   - `result` (text, required)
   - `date` (timestamptz, default now)
   - Timestamps: `created_at`, `updated_at`

6. **legal_entities** - Legal institutions and entities database
   - `id` (uuid, primary key)
   - `name` (text, required)
   - `type` (text, required)
   - `city` (text, required)
   - `contact_email` (text)
   - `submission_url` (text)
   - Timestamps: `created_at`, `updated_at`

### Global Legal Framework Tables

7. **legal_frameworks** - Global legal system definitions
   - `id` (uuid, primary key)
   - `country` (text, required)
   - `region` (text)
   - `legal_system_type` (text, required) - common_law, civil_law, islamic_law, hybrid, international
   - `supported_document_types` (jsonb array)
   - `notes` (text) - jurisdiction-specific disclaimers
   - `official_sources` (jsonb array) - links to official legal resources
   - Timestamps: `created_at`, `updated_at`

8. **user_settings** - User preferences and legal context
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to users)
   - `preferred_country` (text)
   - `preferred_region` (text)
   - `legal_framework_id` (uuid, foreign key to legal_frameworks)
   - `language` (text, default 'en')
   - `legal_literacy_level` (text, default 'basic') - basic, intermediate, expert
   - Timestamps: `created_at`, `updated_at`
   - Unique constraint: (user_id)

## Supported Legal Frameworks

### Americas
- **USA**: Federal + State-specific (California, New York, Texas)
- **Mexico**: Federal civil law system
- **Colombia**: National civil law with constitutional influences
- **Argentina**: Federal civil law with unified code
- **Chile**: National civil law with modern reforms

### Europe
- **Spain**: National civil law with EU regulations
- **France**: Civil law with EU applicability
- **Germany**: Federal civil law with EU regulations
- **United Kingdom**: Common law (England and Wales)

### Asia-Pacific
- **China**: National civil law with socialist characteristics
- **India**: Federal common law with statutory modifications
- **Japan**: National civil law system

### Middle East & Africa
- **UAE**: Federal civil law with Islamic law influences
- **Saudi Arabia**: Islamic law (Sharia) based system
- **Egypt**: Civil law with Sharia influences
- **Nigeria**: Federal common law with customary law
- **Kenya**: Common law with constitutional reforms
- **South Africa**: Mixed system (Roman-Dutch, English, customary)

### Global Fallback
- **International**: General principles for unsupported jurisdictions

## API Endpoints

### Edge Functions

All APIs are implemented as Supabase Edge Functions with full CRUD operations:

1. **users-api** - User management and authentication
2. **documents-api** - Document upload and management
3. **guides-api** - Simplified guides management
4. **responses-api** - Assisted responses management
5. **legal-history-api** - Legal history tracking
6. **legal-entities-api** - Legal entities management
7. **legal-frameworks-api** - Legal framework management
8. **user-settings-api** - User preferences and legal context
9. **document-parser** - Document text extraction and language detection
10. **legal-simplifier** - Legal text simplification with jurisdiction awareness

### Document Parser API

The document parser API extracts text from legal documents and detects their language:

**Endpoint:** `POST /functions/v1/document-parser`

**Request Body:**
```json
{
  "file_url": "https://example.com/document.pdf",  // Optional: URL to document
  "file_content": "base64_encoded_content",        // Optional: Base64 encoded file
  "file_type": "pdf"                               // Required: pdf, docx, or image
}
```

**Response:**
```json
{
  "extracted_text": "Plain text content of the document...",
  "detected_language": "es"  // ISO language code
}
```

### Legal Simplifier API

The legal simplifier API converts complex legal text into plain language with jurisdiction awareness:

**Endpoint:** `POST /functions/v1/legal-simplifier`

**Request Body:**
```json
{
  "extracted_text": "Complex legal text...",
  "language": "es",
  "country": "Mexico",
  "region": "Federal",
  "legal_system_type": "civil_law",
  "legal_literacy_level": "basic"
}
```

**Response:**
```json
{
  "simplified_summary": "Simplified text with jurisdiction context...",
  "reading_level": "basic",
  "jurisdiction_note": "Mexico (Federal) - civil_law law"
}
```

**Features:**
- Jurisdiction-specific legal term translations
- Legal system awareness (common law vs civil law vs Islamic law)
- Literacy level adaptation (basic, intermediate, expert)
- Country and region-specific context
- Multilingual support (English, Spanish, French, Portuguese, German, Arabic, Chinese, Hindi)

### Legal Frameworks API

**Endpoint:** `GET /functions/v1/legal-frameworks-api`

**Query Parameters:**
- `country` - Filter by country
- `legal_system_type` - Filter by legal system

**Response:**
```json
{
  "frameworks": [
    {
      "id": "uuid",
      "country": "USA",
      "region": "California",
      "legal_system_type": "common_law",
      "supported_document_types": ["contract", "lease", "will"],
      "notes": "California has strong tenant protection laws...",
      "official_sources": ["https://leginfo.legislature.ca.gov"]
    }
  ]
}
```

### User Settings API

**Endpoint:** `GET /functions/v1/user-settings-api?user_id={uuid}`

**Response:**
```json
{
  "settings": {
    "user_id": "uuid",
    "preferred_country": "Mexico",
    "preferred_region": "Federal",
    "legal_framework_id": "uuid",
    "language": "es",
    "legal_literacy_level": "basic",
    "legal_frameworks": {
      "country": "Mexico",
      "legal_system_type": "civil_law",
      "supported_document_types": ["contrato", "arrendamiento"]
    }
  }
}
```

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Legal frameworks are publicly readable
- Proper foreign key constraints and cascading deletes
- Authentication handled by Supabase Auth

## Global Features

### Jurisdiction Intelligence
- Automatic legal framework detection based on user location or document type
- Context-aware simplification based on legal system (common law vs civil law)
- Country and region-specific legal term translations
- Jurisdiction disclaimers in exported documents

### Multilingual Support
- Full internationalization across 8+ languages
- Language-specific legal terminology
- Culturally appropriate explanations
- UTF-8 compliant PDF exports with proper character encoding

### Legal Literacy Adaptation
- **Basic**: Simple vocabulary, short sentences, extensive explanations
- **Intermediate**: Moderate complexity, some legal terms with explanations
- **Expert**: Full legal terminology with context

### Document Processing Workflow

1. **User Setup** - Configure country, region, language, and literacy level
2. **Upload Document** - System detects or assigns legal framework
3. **Parse Document** - Extract text with jurisdiction awareness
4. **Simplify Text** - Apply jurisdiction-specific simplification
5. **Generate Guide** - Create step-by-step instructions with local context
6. **Export PDF** - Generate professionally formatted guide with jurisdiction disclaimers

### Usage

To connect to Supabase, click the "Connect to Supabase" button in the top right of Bolt to set up your Supabase project with the required environment variables.

Run the migration file to set up the legal frameworks and user settings tables:
```sql
-- Run the create_legal_frameworks.sql migration
```

The system will automatically populate with legal frameworks for major jurisdictions worldwide.