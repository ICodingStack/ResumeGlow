/**
 * ResumeGlow — js/ats-optimizer.js
 * ATS compatibility scoring and check generation.
 * Fully client-side — no external API required.
 */

/**
 * Run all ATS checks against resume data.
 * @param {Object} data - resume data object
 * @returns {{ score: number, checks: Array }}
 */
function runATSAnalysis(data) {
  const checks = [];
  let totalPoints = 0;
  let earnedPoints = 0;

  function check(label, detail, pass, weight = 10) {
    totalPoints += weight;
    if (pass) earnedPoints += weight;
    checks.push({ label, detail, pass });
  }

  // ── Contact Info ──────────────────────────────────
  check(
    'Contact information present',
    pass => pass ? 'Name, email, and phone detected.' : 'Add your email and phone number.',
    !!(data.name && data.email && data.phone),
    8
  );

  check(
    'Professional email address',
    pass => pass ? 'Email looks professional.' : 'Avoid unprofessional email addresses (e.g. coolkid@...).',
    !!(data.email && !/(cool|fun|party|gamer|sexy|hot|123)/i.test(data.email)),
    5
  );

  // ── Summary ───────────────────────────────────────
  const summaryWords = (data.summary || '').trim().split(/\s+/).filter(Boolean).length;
  check(
    'Professional summary included',
    summaryWords >= 20 ? 'Summary is well-developed.' : summaryWords > 0 ? 'Summary is too short — aim for 40–80 words.' : 'Add a professional summary for ATS parsing.',
    summaryWords >= 20,
    10
  );

  // ── Experience ────────────────────────────────────
  const jobs = (data.experience || []).filter(j => j.title && j.company);
  check(
    'Work experience entries',
    jobs.length >= 1 ? `${jobs.length} position(s) detected.` : 'Add at least one work experience entry.',
    jobs.length >= 1,
    12
  );

  const bulletsTotal = jobs.reduce((n, j) => n + (j.bullets || []).filter(b => b.trim()).length, 0);
  check(
    'Achievement bullet points',
    bulletsTotal >= 3 ? `${bulletsTotal} bullet points found — good depth.` : 'Add more bullet points (aim for 3–5 per role).',
    bulletsTotal >= 3,
    10
  );

  // Check for quantified achievements (numbers/percentages)
  const allBullets = jobs.flatMap(j => j.bullets || []).join(' ');
  const hasNumbers = /\d+[%x×]|\$[\d,]+|\d+\s*(million|thousand|k\b)/i.test(allBullets);
  check(
    'Quantified achievements',
    hasNumbers ? 'Numbers and metrics found — great for ATS and humans!' : 'Add metrics (e.g. "increased sales by 30%") to stand out.',
    hasNumbers,
    12
  );

  // Action verbs
  const ACTION_VERBS = ['led','managed','built','created','designed','developed','increased','reduced','improved','launched','delivered','achieved','optimized','coordinated','implemented','established','streamlined','generated','negotiated','spearheaded','drove','executed'];
  const bulletText = allBullets.toLowerCase();
  const verbCount = ACTION_VERBS.filter(v => bulletText.includes(v)).length;
  check(
    'Strong action verbs',
    verbCount >= 3 ? `${verbCount} strong action verbs detected.` : 'Start bullets with strong verbs (Led, Built, Increased, etc.).',
    verbCount >= 3,
    8
  );

  // ── Education ─────────────────────────────────────
  const edu = (data.education || []).filter(e => e.degree && e.school);
  check(
    'Education section',
    edu.length >= 1 ? 'Education details present.' : 'Add your educational background.',
    edu.length >= 1,
    8
  );

  // ── Skills ────────────────────────────────────────
  check(
    'Skills section populated',
    (data.skills || []).length >= 5 ? `${data.skills.length} skills listed — excellent.` : `Only ${(data.skills||[]).length} skills — add more relevant keywords.`,
    (data.skills || []).length >= 5,
    12
  );

  check(
    'Sufficient keyword density',
    (data.skills || []).length >= 8 ? 'Keyword density looks good.' : 'ATS systems scan for keywords — list 8–15 relevant skills.',
    (data.skills || []).length >= 8,
    8
  );

  // ── Dates ─────────────────────────────────────────
  const allDates = jobs.map(j => j.startDate + j.endDate).join('');
  check(
    'Employment dates present',
    allDates.trim().length > 5 ? 'Employment dates detected.' : 'Add start and end dates to each position.',
    allDates.trim().length > 5,
    7
  );

  // ── Length proxy ──────────────────────────────────
  const totalText = [
    data.name, data.summary,
    ...jobs.map(j => j.title + j.company + (j.bullets||[]).join(' ')),
    ...(data.skills||[])
  ].join(' ').split(/\s+/).filter(Boolean).length;

  check(
    'Resume length appropriate',
    totalText >= 200 ? 'Resume has sufficient content.' : 'Resume feels thin — add more detail to experience and skills.',
    totalText >= 200,
    8
  );

  // ── Compute score ─────────────────────────────────
  const rawScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const score = Math.min(100, Math.max(0, rawScore));

  return { score, checks };
}

/**
 * Analyse a job description against a resume and return match insights.
 * @param {string} jdText - raw job description text
 * @param {Object} resumeData - resume data object
 * @returns {{ matchScore: number, found: string[], missing: string[], suggestions: string[] }}
 */
function analyzeJobDescription(jdText, resumeData) {
  if (!jdText || !jdText.trim()) return null;

  // Build resume text corpus
  const resumeText = [
    resumeData.name,
    resumeData.title,
    resumeData.summary,
    ...(resumeData.skills || []),
    ...(resumeData.experience || []).flatMap(j => [j.title, j.company, ...(j.bullets || [])]),
    ...(resumeData.education || []).map(e => e.degree + ' ' + e.school),
    ...(resumeData.projects || []).map(p => p.name + ' ' + p.description + ' ' + p.tech),
    ...(resumeData.certifications || [])
  ].join(' ').toLowerCase();

  // Extract meaningful keywords from JD
  const stopWords = new Set([
    'the','and','or','in','on','at','to','for','of','a','an','is','are','was','were',
    'be','been','being','have','has','had','do','does','did','will','would','could',
    'should','may','might','shall','can','need','must','this','that','these','those',
    'with','from','by','as','up','about','into','through','during','including',
    'responsibilities','requirements','qualifications','experience','role','position',
    'team','work','working','ability','strong','excellent','good','great','looking',
    'we','our','you','your','their','its','company','join','help','using','use',
    'also','both','each','other','more','such','own','than','then','too','very','just'
  ]);

  // Tokenize JD
  const jdWords = jdText
    .toLowerCase()
    .replace(/[^\w\s+#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w) && isNaN(w));

  // Frequency map
  const freq = {};
  jdWords.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  // Multi-word tech phrases to look for
  const TECH_PHRASES = [
    'machine learning','deep learning','natural language','computer vision',
    'product management','project management','agile methodology','scrum master',
    'data analysis','data science','data engineering','software development',
    'full stack','front end','back end','cloud computing','devops','ci/cd',
    'user experience','user research','design thinking','a/b testing',
    'stakeholder management','cross functional','go to market','p&l',
    'sql server','react native','node.js','type script','vue.js',
    'amazon web services','google cloud','azure','kubernetes','docker'
  ];

  const jdLower = jdText.toLowerCase();
  const foundPhrases = TECH_PHRASES.filter(p => jdLower.includes(p));

  // Top keywords by frequency (excluding noise)
  const topKeywords = Object.entries(freq)
    .filter(([w]) => w.length > 3)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 30)
    .map(([w]) => w);

  // Combine and deduplicate
  const allKeywords = [...new Set([...foundPhrases, ...topKeywords])].slice(0, 25);

  // Check what's in the resume
  const found = [];
  const missing = [];

  allKeywords.forEach(kw => {
    // Normalise: strip spaces for matching
    const normalised = kw.replace(/\s+/g, '');
    if (resumeText.includes(kw) || resumeText.replace(/\s+/g,'').includes(normalised)) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  });

  // Match score
  const matchScore = allKeywords.length > 0
    ? Math.round((found.length / allKeywords.length) * 100)
    : 0;

  // Generate smart suggestions
  const suggestions = [];

  if (missing.length > 0) {
    suggestions.push(`Add missing keywords to your Skills or Summary: ${missing.slice(0,3).join(', ')}.`);
  }

  const jdHasYearsReq = jdText.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (jdHasYearsReq) {
    suggestions.push(`Job requires ${jdHasYearsReq[1]}+ years of experience — ensure your dates reflect this.`);
  }

  if (jdLower.includes('leadership') || jdLower.includes('manage') || jdLower.includes('team lead')) {
    const hasLeadership = resumeText.includes('led') || resumeText.includes('managed') || resumeText.includes('mentored');
    if (!hasLeadership) suggestions.push('Role emphasises leadership — highlight team management in your bullet points.');
  }

  if ((jdLower.includes('remote') || jdLower.includes('distributed')) && !resumeText.includes('remote')) {
    suggestions.push('Mention remote work experience if applicable — it is highlighted in the JD.');
  }

  if (matchScore < 50) {
    suggestions.push('Your match score is below 50% — tailor your summary to echo the job description language.');
  }

  if (!resumeData.summary || resumeData.summary.length < 100) {
    suggestions.push('Expand your Professional Summary to include role-specific language from the job description.');
  }

  return {
    matchScore: Math.min(100, matchScore),
    found: found.slice(0, 12),
    missing: missing.slice(0, 10),
    suggestions: suggestions.slice(0, 5)
  };
}
