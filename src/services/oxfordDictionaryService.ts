// Oxford Dictionary API service - converted from oxford.py
export interface Pronunciation {
  prefix: string | null;
  ipa: string | null;
  url: string | null;
}

export interface Definition {
  property?: string;
  label?: string;
  refer?: string;
  references?: { id: string; name: string }[];
  description?: string;
  examples: string[];
  extra_example: string[];
}

export interface NamespaceDefinition {
  namespace: string | null;
  definitions: Definition[];
}

export interface Idiom {
  name: string;
  summary: {
    label?: string;
    refer?: string;
    references?: { id: string; name: string }[];
  };
  definitions: Definition[];
}

export interface OtherResult {
  name: string;
  id: string;
  wordform?: string;
}

export interface NearbyWord {
  name: string;
  id: string;
  wordform?: string;
}

export interface Topic {
  name: string;
  cefr?: string;
  href: string;
}

export interface WordInfo {
  id: string;
  name: string;
  wordform: string | null;
  pronunciations: Pronunciation[];
  property?: string;
  cefrLevel?: string;
  definitions: NamespaceDefinition[];
  idioms: Idiom[];
  other_results?: { [key: string]: OtherResult[] }[];
  phrasal_verbs?: { name: string; id: string }[];
  nearbyWords?: NearbyWord[];
  topics?: Topic[];
}

export class WordNotFoundError extends Error {
  constructor() {
    super('Word not found in dictionary');
    this.name = 'WordNotFoundError';
  }
}

// Backend API server for Oxford Dictionary (avoids CORS issues)
// Run: python3 server/dictionary_server.py
// Then update API_BASE to point to your backend
const API_BASE = 'http://127.0.0.1:3001';

// CORS proxy fallback (only used if backend is not available)
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];
const BASE_URL = 'https://www.oxfordlearnersdictionaries.com/definition/english/';

// Extract word ID from link
export const extractId = (link: string): string => {
  return link.split('/').pop() || '';
};

// Get prefix from audio filename
export const getPrefixFromFilename = (filename: string): string | null => {
  if (filename.includes('_gb_')) return 'BrE';
  if (filename.includes('_us_')) return 'NAmE';
  return null;
};

// Parse HTML and extract word information
export const parseWordHtml = (html: string, word: string): WordInfo => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Helper function to select elements
  const select = (selector: string): Element[] => Array.from(doc.querySelectorAll(selector));
  const selectFirst = (selector: string): Element | null => doc.querySelector(selector);

  // Get word name
  const titleEl = selectFirst('.top-container .headword');
  const name = titleEl?.textContent?.trim() || word;

  // Get word ID
  const entryEl = selectFirst('#entryContent > .entry');
  const id = entryEl?.getAttribute('id') || word;

  // Get word form (noun, verb, etc.)
  const wordformEl = selectFirst('.top-container .pos');
  const wordform = wordformEl?.textContent?.trim() || null;

  // Get global property
  const propertyEl = selectFirst('.top-container .grammar');
  const property = propertyEl?.textContent?.trim() || undefined;

  // Get CEFR level (A1, A2, B1, B2, C1, C2) from word list symbols
  let cefrLevel: string | undefined;
  
  // Look for level in the symbols div (e.g., /wordlists/...?level=c1)
  const symbolsEl = selectFirst('div.symbols');
  if (symbolsEl) {
    const links = symbolsEl.querySelectorAll('a');
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const levelMatch = href.match(/level=([a-z]\d)/i);
      if (levelMatch) {
        cefrLevel = levelMatch[1].toUpperCase();
        break;
      }
    }
    
    // Alternative: check for span class like ox5ksym_c1
    if (!cefrLevel) {
      const spanEl = symbolsEl.querySelector('span[class*="ox5ksym"]');
      if (spanEl) {
        const className = spanEl.className || '';
        const classMatch = className.match(/ox5ksym_([a-z]\d)/i);
        if (classMatch) {
          cefrLevel = classMatch[1].toUpperCase();
        }
      }
    }
  }

  // Get pronunciations
  const britain: Pronunciation = { prefix: null, ipa: null, url: null };
  const america: Pronunciation = { prefix: null, ipa: null, url: null };

  const britainPronEl = selectFirst('[geo=br] .phon');
  const americaPronEl = selectFirst('[geo=n_am] .phon');
  
  if (britainPronEl) {
    britain.ipa = britainPronEl.textContent?.trim() || null;
    britain.prefix = 'BrE';
  }
  if (americaPronEl) {
    america.ipa = americaPronEl.textContent?.trim() || null;
    america.prefix = 'nAmE';
  }

  const britainAudioEl = selectFirst('[geo=br] [data-src-ogg]');
  const americaAudioEl = selectFirst('[geo=n_am] [data-src-ogg]');
  
  if (britainAudioEl) {
    britain.url = britainAudioEl.getAttribute('data-src-ogg') || null;
  }
  if (americaAudioEl) {
    america.url = americaAudioEl.getAttribute('data-src-ogg') || null;
  }

  if (britain.prefix === null && britain.url) {
    britain.prefix = getPrefixFromFilename(britain.url);
  }
  if (america.prefix === null && america.url) {
    america.prefix = getPrefixFromFilename(america.url);
  }

  // Parse full definitions
  const parseDefinition = (parentTag: Element): Definition => {
    const definition: Definition = { examples: [], extra_example: [] };
    
    const propertyTag = parentTag.querySelector('.grammar');
    if (propertyTag) definition.property = propertyTag.textContent?.trim();
    
    const labelTag = parentTag.querySelector('.labels');
    if (labelTag) definition.label = labelTag.textContent?.trim();
    
    const referTag = parentTag.querySelector('.dis-g');
    if (referTag) definition.refer = referTag.textContent?.trim();
    
    const defTag = parentTag.querySelector('.def');
    if (defTag) definition.description = defTag.textContent?.trim();
    
    const exampleTags = parentTag.querySelectorAll('.examples .x');
    definition.examples = Array.from(exampleTags).map(el => el.textContent?.trim() || '');
    
    const extraExampleTags = parentTag.querySelectorAll('[unbox=extra_examples] .examples .unx');
    definition.extra_example = Array.from(extraExampleTags).map(el => el.textContent?.trim() || '');
    
    return definition;
  };

  const namespaceTags = select('.senses_multiple > .shcut-g');
  const definitions: NamespaceDefinition[] = [];
  
  if (namespaceTags.length > 0) {
    for (const namespaceTag of namespaceTags) {
      const namespaceEl = namespaceTag.querySelector('h2.shcut');
      const namespace = namespaceEl?.textContent?.trim() || null;
      const definitionTags = namespaceTag.querySelectorAll('.sense');
      const defs: Definition[] = Array.from(definitionTags).map(parseDefinition);
      definitions.push({ namespace, definitions: defs });
    }
  } else {
    const defBodyTags = select('.senses_multiple');
    if (defBodyTags.length > 0) {
      const definitionTags = defBodyTags[0].querySelectorAll('.sense');
      const defs: Definition[] = Array.from(definitionTags).map(parseDefinition);
      definitions.push({ namespace: '__GLOBAL__', definitions: defs });
    }
  }

  // Get idioms
  const idiomTags = select('.idioms > .idm-g');
  const idioms: Idiom[] = [];
  
  for (const idiomTag of idiomTags) {
    let idiomName = '';
    const idmEl = idiomTag.querySelector('.idm-l');
    if (idmEl) {
      idiomName = idmEl.textContent?.trim() || '';
    } else {
      const simpleIdmEl = idiomTag.querySelector('.idm');
      idiomName = simpleIdmEl?.textContent?.trim() || '';
    }
    
    const summary: Idiom['summary'] = {};
    const labelTag = idiomTag.querySelector('.labels');
    if (labelTag) summary.label = labelTag.textContent?.trim();
    
    const referTag = idiomTag.querySelector('.dis-g');
    if (referTag) summary.refer = referTag.textContent?.trim();
    
    const defTags = idiomTag.querySelectorAll('.sense');
    const idiomDefs: Definition[] = Array.from(defTags).map(parseDefinition);
    
    idioms.push({ name: idiomName, summary, definitions: idiomDefs });
  }

  // Get nearby words
  const nearbyWords: NearbyWord[] = [];
  const nearbySection = selectFirst('.nearby');
  if (nearbySection) {
    const nearbyLinks = nearbySection.querySelectorAll('a');
    for (const link of nearbyLinks) {
      const dataEl = link.querySelector('data.hwd');
      if (dataEl) {
        const hwdEl = dataEl.querySelector('.hwd');
        const posEl = dataEl.querySelector('pos');
        const wordName = hwdEl?.textContent?.trim() || dataEl.textContent?.trim() || '';
        const wordform = posEl?.textContent?.trim() || undefined;
        const href = link.getAttribute('href') || '';
        const id = extractId(href);
        
        if (wordName && id && id !== word) {
          nearbyWords.push({ name: wordName, id, wordform });
        }
      }
    }
  }

  // Get topics
  const topics: Topic[] = [];
  const topicElements = select('.topic-g');
  for (const topicEl of topicElements) {
    const topicNameEl = topicEl.querySelector('.topic_name');
    const topicCefrEl = topicEl.querySelector('.topic_cefr');
    const linkEl = topicEl.querySelector('a');
    
    if (topicNameEl) {
      topics.push({
        name: topicNameEl.textContent?.trim() || '',
        cefr: topicCefrEl?.textContent?.trim() || undefined,
        href: linkEl?.getAttribute('href') || '',
      });
    }
  }

  // Build the full word info object
  const wordInfo: WordInfo = {
    id,
    name,
    wordform,
    pronunciations: [britain, america],
    definitions,
    idioms,
  };

  if (property) wordInfo.property = property;
  if (cefrLevel) wordInfo.cefrLevel = cefrLevel;
  if (nearbyWords.length > 0) wordInfo.nearbyWords = nearbyWords;
  if (topics.length > 0) wordInfo.topics = topics;

  // Add phrasal verbs if it's a verb
  if (wordform === 'verb') {
    const phrasalVerbTags = select('.phrasal_verb_links a');
    const phrasalVerbs = phrasalVerbTags.map(tag => {
      const xhEl = tag.querySelector('.xh');
      return {
        name: xhEl?.textContent?.trim() || '',
        id: extractId(tag.getAttribute('href') || '')
      };
    });
    wordInfo.phrasal_verbs = phrasalVerbs;
  }

  return wordInfo;
};

// Free Dictionary API fallback (no API key required, CORS-friendly)
const FREE_DICT_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Try backend API first, then Free Dictionary API, then CORS proxies
export const fetchWordInfo = async (word: string): Promise<WordInfo> => {
  // First try: Use backend Python server (recommended - no CORS issues)
  try {
    const apiUrl = `${API_BASE}/api/dictionary/${encodeURIComponent(word.toLowerCase())}`;
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });

    if (response.ok) {
      const data = await response.json();
      if (data.error) {
        if (data.error === 'Word not found' || response.status === 404) {
          throw new WordNotFoundError();
        }
        throw new Error(data.error);
      }
      return transformPythonData(data);
    }
  } catch (error) {
    console.log('Backend unavailable, trying Free Dictionary API...');
  }

  // Second try: Free Dictionary API (no API key, CORS-friendly)
  try {
    const response = await fetch(`${FREE_DICT_BASE}/${encodeURIComponent(word.toLowerCase())}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return transformFreeDictData(data[0]);
      }
    } else if (response.status === 404) {
      throw new WordNotFoundError();
    }
  } catch (error) {
    if (error instanceof WordNotFoundError) throw error;
    console.log('Free Dictionary API unavailable, trying CORS proxies...');
  }

  // Third try: Use CORS proxies to access Oxford directly
  let lastError: Error | null = null;

  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(BASE_URL + word)}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new WordNotFoundError();
        }
        throw new Error(`Failed to fetch word: ${response.statusText}`);
      }

      const html = await response.text();

      if (html.includes('<html') || html.includes('<!DOCTYPE')) {
        return parseWordHtml(html, word);
      }

      continue;
    } catch (error) {
      lastError = error as Error;
      if (error instanceof WordNotFoundError) {
        throw error;
      }
      continue;
    }
  }

  throw new Error(`Error fetching word "${word}": All methods failed. ${lastError?.message || 'Unknown error'}`);
};

// Transform Free Dictionary API response to WordInfo
const transformFreeDictData = (data: any): WordInfo => {
  const name = data.word || '';
  const phonetics = data.phonetics || [];

  const pronunciations: Pronunciation[] = [];
  for (const p of phonetics) {
    if (p.text || p.audio) {
      pronunciations.push({
        prefix: null,
        ipa: p.text || null,
        url: p.audio || null,
      });
    }
  }

  const definitions: NamespaceDefinition[] = [];
  for (const meaning of data.meanings || []) {
    const partOfSpeech = meaning.partOfSpeech || '';
    const defs: Definition[] = [];

    for (const def of meaning.definitions || []) {
      defs.push({
        property: partOfSpeech,
        description: def.definition || '',
        examples: def.example ? [def.example] : [],
        extra_example: [],
      });
    }

    definitions.push({ namespace: partOfSpeech, definitions: defs });
  }

  return {
    id: name,
    name,
    wordform: null,
    pronunciations: pronunciations.length > 0 ? pronunciations : [{ prefix: null, ipa: data.phonetic || null, url: null }],
    cefrLevel: getCefrLevel(name),
    definitions,
    idioms: [],
    nearbyWords: [],
    topics: [],
    phrasal_verbs: [],
    other_results: [],
  };
};

// Transform Python dict structure to match frontend interface
const transformPythonData = (pythonData: any): WordInfo => {
  // Extract CEFR level from other_results or word data
  let cefrLevel: string | undefined;
  
  // Try to get level from Oxford 5000 wordlist link
  if (pythonData.other_results) {
    for (const resultGroup of pythonData.other_results) {
      for (const [key, results] of Object.entries(resultGroup)) {
        if (key.toLowerCase().includes('ox') || key.toLowerCase().includes('word')) {
          const resultsArray = results as any[];
          for (const item of resultsArray) {
            const href = item.href || item.id || '';
            const match = href.match(/level=([a-z]\d)/i);
            if (match) {
              cefrLevel = match[1].toUpperCase();
              break;
            }
          }
        }
      }
    }
  }

  // Fallback to preset levels
  if (!cefrLevel) {
    cefrLevel = getCefrLevel(pythonData.name || '');
  }

  return {
    id: pythonData.id || '',
    name: pythonData.name || '',
    wordform: pythonData.wordform || null,
    pronunciations: pythonData.pronunciations || [],
    property: pythonData.property,
    cefrLevel,
    definitions: transformDefinitions(pythonData.definitions),
    idioms: transformIdioms(pythonData.idioms),
    phrasal_verbs: pythonData.phrasal_verbs,
    other_results: pythonData.other_results,
  };
};

const transformDefinitions = (defs: any[]): NamespaceDefinition[] => {
  if (!defs) return [];
  return defs.map(ns => ({
    namespace: ns.namespace || ns[0] || null,
    definitions: ns.definitions || ns[1] || [],
  }));
};

const transformIdioms = (idioms: any[]): Idiom[] => {
  if (!idioms) return [];
  return idioms.map(idiom => ({
    name: typeof idiom === 'string' ? idiom : idiom.name || '',
    summary: typeof idiom === 'object' ? (idiom.summary || {}) : {},
    definitions: typeof idiom === 'object' ? (idiom.definitions || []) : [],
  }));
};

// Sample common English words for vocabulary practice with CEFR levels
export const commonWords = [
  'aberration', 'ephemeral', 'ubiquitous', 'serendipity', 'eloquent',
  'resilient', 'meticulous', 'pragmatic', 'altruistic', 'pervasive',
  'ethereal', 'cogent', 'derogatory', 'fortuitous', 'garrulous',
  'hackneyed', 'iconoclastic', 'jubilant', 'kinetic', 'luminous',
  'magnanimous', 'nefarious', 'obsequious', 'prevalent', 'quintessential',
  'resplendent', 'sagacious', 'tangible'
];

// Preset CEFR levels for common words (fallback when API doesn't return level)
export const presetCefrLevels: { [word: string]: string } = {
  // A1 - Beginner
  'hello': 'A1', 'good': 'A1', 'big': 'A1', 'run': 'A1', 'walk': 'A1',
  'house': 'A1', 'water': 'A1', 'food': 'A1', 'book': 'A1', 'time': 'A1',
  'world': 'A1', 'people': 'A1', 'life': 'A1', 'way': 'A1',
  
  // A2 - Elementary  
  'beautiful': 'A2', 'important': 'A2', 'different': 'A2',
  'happy': 'A2', 'difficult': 'A2', 'experience': 'A2', 'problem': 'A2',
  'answer': 'A2', 'question': 'A2', 'believe': 'A2', 'understand': 'A2',
  
  // B1 - Intermediate
  'resilient': 'B2', 'jubilant': 'B2', 'kinetic': 'B2', 'tangible': 'B2',
  
  // B2 - Upper Intermediate
  'serendipity': 'B2', 'pragmatic': 'B2',
  
  // C1 - Advanced
  'meticulous': 'C1', 'eloquent': 'C1', 'altruistic': 'C1', 'aberration': 'C1',
  'cogent': 'C1', 'derogatory': 'C1', 'luminous': 'C1', 'prevalent': 'C1',
  
  // C2 - Proficiency
  'ephemeral': 'C2', 'ubiquitous': 'C2', 'pervasive': 'C2', 'ethereal': 'C2',
  'fortuitous': 'C2', 'garrulous': 'C2', 'hackneyed': 'C2', 'iconoclastic': 'C2',
  'magnanimous': 'C2', 'nefarious': 'C2', 'obsequious': 'C2', 'quintessential': 'C2',
  'resplendent': 'C2', 'sagacious': 'C2',
};

// Get CEFR level with fallback to preset
export const getCefrLevel = (word: string): string | undefined => {
  const lowerWord = word.toLowerCase();
  return presetCefrLevels[lowerWord];
};