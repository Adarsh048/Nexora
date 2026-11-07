/**
 * Enterprise Email Classification and Entity Extraction Engine for Recruitment Communications
 */

// Heuristic keyword definitions for recruitment communications
const PATTERNS = {
  OFFER: [
    /offer of employment/i,
    /formal offer/i,
    /job offer/i,
    /pleased to offer you/i,
    /delighted to offer you/i,
    /congratulations on your offer/i,
    /we are excited to offer you/i,
    /offer letter/i,
    /compensation package/i,
    /welcome to the team/i,
    /employment agreement/i,
    /verbal offer/i,
  ],
  INTERVIEW: [
    /invite you to interview/i,
    /interview invitation/i,
    /invitation to interview/i,
    /schedule a (technical|screening|first round|final round|virtual|phone|video|behavioral|system design|coding) interview/i,
    /schedule your interview/i,
    /speak with the hiring team/i,
    /conversation with our team/i,
    /conversation with the team/i,
    /interview scheduled/i,
    /reschedule your interview/i,
    /next round of interviews/i,
    /introductory call/i,
    /phone screen/i,
    /technical round/i,
    /zoom\.us\/j\//i,
    /meet\.google\.com\//i,
    /teams\.microsoft\.com\//i,
    /calendly\.com\//i,
    /goodtime\.io\//i,
    /hirevue/i,
  ],
  ASSESSMENT: [
    /online assessment/i,
    /coding assessment/i,
    /technical challenge/i,
    /hackerrank/i,
    /codility/i,
    /codesignal/i,
    /take-home challenge/i,
    /take-home assignment/i,
    /complete our assessment/i,
    /timed test/i,
    /assessment invitation/i,
    /programming challenge/i,
    /skill assessment/i,
  ],
  REJECTION: [
    /not be progressing with your application/i,
    /not be moving forward/i,
    /will not be moving forward/i,
    /decided to move forward with other candidates/i,
    /pursue other candidates/i,
    /unable to offer you an interview/i,
    /unable to offer you the position/i,
    /unfortunately, at this time/i,
    /decided not to proceed/i,
    /regret to inform you/i,
    /position has been filled/i,
    /position has been closed/i,
    /not selected for this role/i,
    /wish you the best in your search/i,
  ],
  CONFIRMATION: [
    /thank you for applying/i,
    /thanks for applying/i,
    /we received your application/i,
    /application received/i,
    /acknowledging receipt of your application/i,
    /application has been submitted/i,
    /thanks for your interest in/i,
    /we have successfully received your application/i,
    /application confirmation/i,
    /your application was sent/i,
  ],
  RECRUITER_COMMUNICATION: [
    /reviewing your application/i,
    /update regarding your application/i,
    /recruiter at/i,
    /talent acquisition/i,
    /hiring team/i,
    /candidacy update/i,
  ],
};

const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'live.com',
  'msn.com',
]);

const GENERIC_WORDS = new Set([
  'career',
  'careers',
  'job',
  'jobs',
  'application',
  'applications',
  'update',
  'updates',
  'interview',
  'invitation',
  'invitations',
  'your',
  'the',
  'team',
  'talent',
  'recruiting',
  'recruitment',
  'hiring',
  'hr',
  'staffing',
  'work',
  'company',
  'candidate',
]);

/**
 * Classifies an incoming email based on its subject, sender, and snippet
 */
export function classifyEmail({ subject = '', sender = '', snippet = '' }) {
  const combined = `${subject} ${snippet}`.toLowerCase();

  // 1. Test Offer first (highest career impact)
  for (const pattern of PATTERNS.OFFER) {
    if (pattern.test(combined)) {
      return {
        category: 'Offer',
        suggestedStatus: 'Offer',
        confidence: 96,
        reason: 'Detected formal offer of employment details',
      };
    }
  }

  // 2. Test Interview Invitation / Scheduling
  for (const pattern of PATTERNS.INTERVIEW) {
    if (pattern.test(combined)) {
      return {
        category: 'Interview',
        suggestedStatus: 'Interview',
        confidence: 94,
        reason: 'Detected interview invitation or scheduling link',
      };
    }
  }

  // 3. Test Assessment Invitation
  for (const pattern of PATTERNS.ASSESSMENT) {
    if (pattern.test(combined)) {
      return {
        category: 'Assessment',
        suggestedStatus: 'Assessment',
        confidence: 90,
        reason: 'Detected online assessment or coding challenge invite',
      };
    }
  }

  // 4. Test Rejection
  for (const pattern of PATTERNS.REJECTION) {
    if (pattern.test(combined)) {
      return {
        category: 'Rejection',
        suggestedStatus: 'Rejected',
        confidence: 92,
        reason: 'Detected notification of application status closure',
      };
    }
  }

  // 5. Test Application Confirmation
  for (const pattern of PATTERNS.CONFIRMATION) {
    if (pattern.test(combined)) {
      return {
        category: 'Confirmation',
        suggestedStatus: 'Applied',
        confidence: 88,
        reason: 'Detected submission acknowledgment from company ATS',
      };
    }
  }

  // 6. Recruiter Communication
  for (const pattern of PATTERNS.RECRUITER_COMMUNICATION) {
    if (pattern.test(combined)) {
      return {
        category: 'Recruiter Communication',
        suggestedStatus: null,
        confidence: 70,
        reason: 'General recruiter outreach or status update check-in',
      };
    }
  }

  return {
    category: 'Recruiter Communication',
    suggestedStatus: null,
    confidence: 60,
    reason: 'Recruitment correspondence parsed from inbox',
  };
}

/**
 * Extracts accurate company name & job title from sender domain, sender name, subject, and snippet
 */
export function extractCompanyInfo(senderEmail = '', senderName = '', subject = '', snippet = '') {
  let detectedCompany = '';
  let detectedJobTitle = '';

  // 1. Analyze Email Domain
  let domainCompany = '';
  const domainMatch = senderEmail.match(/@([a-zA-Z0-9.-]+)/);
  if (domainMatch && domainMatch[1]) {
    const rawDomain = domainMatch[1].toLowerCase();
    if (!GENERIC_EMAIL_DOMAINS.has(rawDomain)) {
      if (rawDomain.includes('myworkdayjobs.com')) {
        const sub = rawDomain.replace('.myworkdayjobs.com', '').split('.')[0];
        if (sub && sub.length > 2) domainCompany = capitalize(sub);
      } else if (
        !rawDomain.includes('greenhouse') &&
        !rawDomain.includes('lever.co') &&
        !rawDomain.includes('ashbyhq') &&
        !rawDomain.includes('smartrecruiters') &&
        !rawDomain.includes('icims') &&
        !rawDomain.includes('jobvite') &&
        !rawDomain.includes('bamboohr')
      ) {
        // Corporate domain: jobs@anthropic.com -> Anthropic, hr@stripe.com -> Stripe
        let clean = rawDomain.replace(/^(jobs\.|careers\.|mail\.|notifications\.|recruiting\.|noreply\.|hr\.)/, '');
        clean = clean.split('.')[0];
        if (clean && clean.length > 2) {
          domainCompany = capitalize(clean);
        }
      }
    }
  }

  // 2. Analyze Sender Name (e.g. "Anthropic via Greenhouse", "Stripe Recruiting", "Google Careers")
  let senderCompany = '';
  if (senderName) {
    // Case A: "Company via ATS" (e.g., "Anthropic via Greenhouse", "Figma via Ashby")
    const viaMatch = senderName.match(/^([A-Za-z0-9&.\s]{2,25})\s+via\s+/i);
    if (viaMatch && viaMatch[1]) {
      senderCompany = viaMatch[1].trim();
    } else {
      // Case B: Corporate team: "Stripe Recruiting", "Google Careers", "Apple Talent Acquisition"
      const teamMatch = senderName.match(/^([A-Za-z0-9&.\s]{2,25})\s+(?:Recruiting|Careers|Talent|Hiring|HR|Team|Jobs)/i);
      if (teamMatch && teamMatch[1]) {
        const candidate = teamMatch[1].trim();
        if (!GENERIC_WORDS.has(candidate.toLowerCase())) {
          senderCompany = candidate;
        }
      }
    }
  }

  // 3. Analyze Subject Line for Company Name
  let subjectCompany = '';
  const subjPatterns = [
    // "[Company] Interview Invitation", "Anthropic: Technical Round"
    /^\[?([A-Za-z0-9&.\s]{2,25})\]?\s*[-–:]\s*(?:Interview|Application|Update|Offer|Next Steps|Invitation|Technical)/i,
    // "Interview with Anthropic", "Invitation to Interview at Stripe"
    /(?:interview with|interview at|speaking with|application to|role at|position at)\s+([A-Za-z0-9&.\s]{2,25})(?:\s+Recruiting|\s+Team|\s+-|\s+:|\s+\(|\.|$)/i,
    // "Thank you for applying to Google"
    /(?:applying to|interest in|applied to)\s+([A-Za-z0-9&.\s]{2,25})(?:\s+Recruiting|\s+Team|\s+-|\s+:|\s+\(|\.|$)/i,
    // "Anthropic Interview Invitation - Senior Software Engineer"
    /^([A-Z][a-zA-Z0-9&.\s]{1,20})\s+(?:Interview|Application|Hiring|Assessment)/i,
  ];

  for (const pat of subjPatterns) {
    const match = subject.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!GENERIC_WORDS.has(candidate.toLowerCase()) && candidate.length >= 2) {
        subjectCompany = candidate;
        break;
      }
    }
  }

  // Priority order for detected company:
  // 1. Corporate domain (most authoritative for direct corporate emails: e.g. @anthropic.com -> Anthropic)
  // 2. Sender ATS prefix (e.g. "Stripe via Greenhouse" -> Stripe)
  // 3. Subject company (e.g. "Anthropic Interview Invitation" -> Anthropic)
  // 4. Sender Company (e.g. "Google Careers" -> Google)
  if (domainCompany) {
    detectedCompany = domainCompany;
  } else if (senderCompany) {
    detectedCompany = senderCompany;
  } else if (subjectCompany) {
    detectedCompany = subjectCompany;
  } else {
    detectedCompany = 'Recruiting Company';
  }

  // 4. Extract Job Role from Subject Line or Body
  const rolePatterns = [
    // "for the role of Senior Frontend Engineer", "for position: Staff Engineer"
    /(?:for the role of|role of|position of|position:)\s+([A-Za-z0-9\s-]{3,40})(?:\s+at|\s+-|\s+\(|\.|$)/i,
    // "Interview Invitation - Senior Software Engineer"
    /(?:Interview|Application)(?:\s+Invitation)?\s*[-–:]\s*([A-Za-z0-9\s-]{3,40})(?:\s+at|\s+\(|\.|$)/i,
    // Common tech roles: "Senior Software Engineer", "Product Manager", "Full Stack Developer"
    /([A-Za-z\s-]{2,30}\s+(?:Software Engineer|Frontend Engineer|Backend Engineer|Full Stack Engineer|Data Engineer|DevOps Engineer|Mobile Engineer|iOS Engineer|Android Engineer|Machine Learning Engineer|AI Engineer|Systems Engineer|Cloud Engineer|Security Engineer|Product Manager|Engineering Manager|Product Designer|Data Scientist|QA Engineer|Solutions Architect))/i,
  ];

  for (const pat of rolePatterns) {
    const match = subject.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/^(at|for)\s+/i, '');
      if (candidate.length >= 3) {
        detectedJobTitle = candidate;
        break;
      }
    }
  }

  if (!detectedJobTitle) {
    // Check snippet for role
    const bodyMatch = snippet.match(/(?:role of|position of|position:)\s+([A-Za-z0-9\s-]{3,35})(?:\s+at|\s+-|\s+\(|\.|\n|$)/i);
    if (bodyMatch && bodyMatch[1]) {
      detectedJobTitle = bodyMatch[1].trim();
    }
  }

  if (!detectedJobTitle) {
    detectedJobTitle = 'Software Engineer';
  }

  return {
    detectedCompany,
    detectedJobTitle,
  };
}

/**
 * Matches an email against existing user applications
 */
export function matchApplication(emailData, applications = []) {
  if (!applications || applications.length === 0) {
    return { matchedApp: null, confidence: 0 };
  }

  const { detectedCompany, detectedJobTitle, subject = '', snippet = '', senderEmail = '' } = emailData;
  const searchCorpus = `${subject} ${snippet} ${senderEmail}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const app of applications) {
    let score = 0;
    const appCompany = (app.companyName || '').toLowerCase().trim();
    const appRole = (app.jobTitle || '').toLowerCase().trim();

    if (!appCompany) continue;

    // 1. Company Name Match
    if (detectedCompany) {
      const detectedCompLower = detectedCompany.toLowerCase().trim();
      if (detectedCompLower === appCompany) {
        score += 55;
      } else if (detectedCompLower.includes(appCompany) || appCompany.includes(detectedCompLower)) {
        score += 45;
      } else if (searchCorpus.includes(appCompany)) {
        score += 40;
      }
    } else if (searchCorpus.includes(appCompany)) {
      score += 40;
    }

    // 2. Job Role Match
    if (detectedJobTitle && appRole) {
      const detectedRoleLower = detectedJobTitle.toLowerCase().trim();
      if (detectedRoleLower === appRole) {
        score += 35;
      } else if (searchCorpus.includes(appRole)) {
        score += 25;
      } else {
        const roleTokens = appRole.split(/\s+/).filter(w => w.length > 3);
        const matches = roleTokens.filter(w => searchCorpus.includes(w));
        if (matches.length > 0) {
          score += Math.min(20, matches.length * 8);
        }
      }
    }

    // 3. Recruiter Email Domain or Specific Email Match
    if (app.recruiterEmail && senderEmail) {
      if (senderEmail.toLowerCase().includes(app.recruiterEmail.toLowerCase())) {
        score += 25;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = app;
    }
  }

  // Minimum threshold: 35% match
  if (bestScore >= 35) {
    return {
      matchedApp: bestMatch,
      confidence: Math.min(98, Math.max(75, bestScore)),
    };
  }

  return {
    matchedApp: null,
    confidence: bestScore,
  };
}

function capitalize(str = '') {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
