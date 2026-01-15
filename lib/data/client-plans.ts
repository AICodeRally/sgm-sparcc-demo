/**
 * Client Plan Data Loader
 * Loads client plan documents from processed markdown files
 */

import fs from 'fs';
import path from 'path';

// Configurable base path - set via environment variable or use default
const CLIENT_PLANS_BASE_PATH = process.env.CLIENT_PLANS_PATH || path.join(process.cwd(), 'data/client-plans');
const PROCESSED_PATH = path.join(CLIENT_PLANS_BASE_PATH, 'processed');

export interface ClientPlanMetadata {
  planCode: string;
  title: string;
  division: string;
  role: string;
  effectiveDate: string;
  planYear: number;
  version: string;
  status: string;
  company: string;
}

export interface ClientPlanSection {
  id: string;
  sectionNumber: string;
  title: string;
  content: string;
  level: number;
  category: string;
}

export interface ClientPlan {
  metadata: ClientPlanMetadata;
  sections: ClientPlanSection[];
  rawContent: string;
}

/**
 * Load plan manifest
 */
export function loadPlanManifest() {
  try {
    const manifestPath = path.join(CLIENT_PLANS_BASE_PATH, 'plans-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return null;
    }
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(manifestContent);
  } catch (error) {
    console.error('Error loading plan manifest:', error);
    return null;
  }
}

/**
 * Load a specific client plan by plan code
 */
export function loadClientPlan(planCode: string): ClientPlan | null {
  try {
    const filePath = path.join(PROCESSED_PATH, `${planCode}.md`);

    if (!fs.existsSync(filePath)) {
      console.error(`Plan file not found: ${filePath}`);
      return null;
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { metadata, sections } = parsePlanMarkdown(rawContent, planCode);

    return {
      metadata,
      sections,
      rawContent,
    };
  } catch (error) {
    console.error(`Error loading plan ${planCode}:`, error);
    return null;
  }
}

/**
 * Parse markdown plan content into structured sections
 */
function parsePlanMarkdown(markdown: string, planCode: string): {
  metadata: ClientPlanMetadata;
  sections: ClientPlanSection[];
} {
  const lines = markdown.split('\n');

  // Extract metadata from the header
  const metadata: ClientPlanMetadata = {
    planCode,
    title: '',
    division: '',
    role: '',
    effectiveDate: '',
    planYear: 2025,
    version: '1.0',
    status: 'Active',
    company: 'Demo Client',
  };

  // Parse metadata
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      metadata.title = line.substring(2).trim();
    } else if (line.startsWith('**Plan Code:**')) {
      metadata.planCode = line.replace('**Plan Code:**', '').trim();
    } else if (line.startsWith('**Division:**')) {
      metadata.division = line.replace('**Division:**', '').trim();
    } else if (line.startsWith('**Role:**')) {
      metadata.role = line.replace('**Role:**', '').trim();
    } else if (line.startsWith('**Effective Date:**')) {
      metadata.effectiveDate = line.replace('**Effective Date:**', '').trim();
    } else if (line.startsWith('**Plan Year:**')) {
      const yearMatch = line.match(/\d{4}/);
      if (yearMatch) metadata.planYear = parseInt(yearMatch[0]);
    } else if (line.startsWith('**Version:**')) {
      metadata.version = line.replace('**Version:**', '').trim();
    } else if (line.startsWith('**Status:**')) {
      metadata.status = line.replace('**Status:**', '').trim();
    } else if (line.startsWith('**Company:**')) {
      metadata.company = line.replace('**Company:**', '').trim();
    }
  }

  // Parse sections
  const sections: ClientPlanSection[] = [];
  let currentSection: ClientPlanSection | null = null;
  let sectionContent: string[] = [];
  let sectionCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match headers (## or ###)
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match || h3Match) {
      // Save previous section
      if (currentSection) {
        currentSection.content = sectionContent.join('\n').trim();
        sections.push(currentSection);
      }

      // Start new section
      const title = (h2Match || h3Match)![1];
      const level = h2Match ? 2 : 3;
      sectionCounter++;

      // Determine category
      let category = 'PLAN_DETAILS';
      if (title.toLowerCase().includes('overview')) category = 'PLAN_OVERVIEW';
      else if (title.toLowerCase().includes('definition')) category = 'DEFINITIONS';
      else if (title.toLowerCase().includes('commission') || title.toLowerCase().includes('calculation')) category = 'COMPENSATION';
      else if (title.toLowerCase().includes('term') || title.toLowerCase().includes('condition')) category = 'TERMS_CONDITIONS';
      else if (title.toLowerCase().includes('payout') || title.toLowerCase().includes('payment')) category = 'PAYOUTS';

      currentSection = {
        id: `section-${sectionCounter}`,
        sectionNumber: level === 2 ? `${sectionCounter}.0` : `${Math.floor(sectionCounter / 10)}.${sectionCounter % 10}`,
        title,
        content: '',
        level,
        category,
      };

      sectionContent = [];
    } else if (currentSection) {
      // Add content to current section
      sectionContent.push(line);
    }
  }

  // Add final section
  if (currentSection) {
    currentSection.content = sectionContent.join('\n').trim();
    sections.push(currentSection);
  }

  return { metadata, sections };
}

/**
 * Get all available client plans
 */
export function getAllClientPlans(): string[] {
  try {
    if (!fs.existsSync(PROCESSED_PATH)) {
      return [];
    }

    return fs.readdirSync(PROCESSED_PATH)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error listing plans:', error);
    return [];
  }
}

