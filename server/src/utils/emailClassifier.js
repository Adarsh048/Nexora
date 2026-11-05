/**
 * Email Classification and Entity Extraction Engine for Recruitment Communications
 */

// Heuristic keyword definitions
const PATTERNS = {
  OFFER: [
    /offer of employment/i,
    /formal offer/i,
    /job offer/i,
    /pleased to offer you the position/i,
    /delighted to offer you/i,
    /congratulations on your offer/i,
    /we are excited to offer you/i,
    /offer letter/i,
  ],
  INTERVIEW: [
    /invite you to interview/i,
    /interview invitation/i,
    /schedule a (technical|screening|first round|final round|virtual|phone) interview/i,
    /schedule your interview/i,
    /speak with the hiring team/i,
    /conversation with the team/i,
    /interview scheduled/i,
    /reschedule your interview/i,
    /invitation to interview/i,
    /next round of interviews/i,
  ],
  ASSESSMENT: [
    /online assessment/i,
    /coding assessment/i,
    /technical challenge/i,
    /hackerrank/i,
    /codility/i,
    /codesignal/i,
    /take-home challenge/i,
    /complete our assessment/i,
    /timed test/i,
    /assessment invitation/i,
  ],
  REJECTION: [
    /not be progressing with your application/i,
    /we will not be moving forward/i,
    /decided to move forward with other candidates/i,
    /pursue other candidates/i,
    /unable to offer you an interview/i,
    /unfortunately, at this time/i,
    /decided not to proceed/i,
    /regret to inform you/i,
    /position has been filled/i,
  ],
  CONFIRMATION: [
    /thank you for applying/i,
    /we received your application/i,
    /application received/i,
    /acknowledging receipt of your application/i,
    /application has been submitted/i,
    /thanks for your interest in/i,
    /we have successfully received your application/i,
  ],
  RECRUITER_COMMUNICATION: [
    /reviewing your application/i,
    /update regarding your application/i,
    /recruiter at/i,
    /talent acquisition/i,
    /hiring team/i,
  ]
};

/**
 * Classifies an incoming email based on its subject, sender, and snippet
 */
export function classifyEmail({ subject = '', sender = '', snippet = '' }) {
  const combined = `${subject} ${snippet}`.toLowerCase();

  // Test Offer first (highest significance)
  for (const pattern of PATTERNS.OFFER) {
    if (pattern.test(combined)) {
      return {
        category: 'Offer',
        suggestedStatus: 'Offer',
        confidence: 95,
        reason: 'Detected formal offer language in communication',
      };
    }
  }

  // Test Interview Invitation / Scheduling
  for (const pattern of PATTERNS.INTERVIEW) {
    if (pattern.test(combined)) {
      return {
        category: 'Interview',
        suggestedStatus: 'Interview',
        confidence: 90,
        reason: 'Detected interview invitation or scheduling details',
      };
    }
  }

  // Test Assessment Invitation
  for (const pattern of PATTERNS.ASSESSMENT) {
    if (pattern.test(combined)) {
      return {
        category: 'Assessment',
        suggestedStatus: 'Assessment',
        confidence: 88,
        reason: 'Detected online assessment or coding challenge invite',
      };
    }
  }

  // Test Rejection
  for (const pattern of PATTERNS.REJECTION) {
    if (pattern.test(combined)) {
      return {
        category: 'Rejection',
        suggestedStatus: 'Rejected',
        confidence: 92,
        reason: 'Detected formal notification of application closure',
      };
    }
  }

  // Test Application Confirmation
  for (const pattern of PATTERNS.CONFIRMATION) {
    if (pattern.test(combined)) {
      return {
        category: 'Confirmation',
        suggestedStatus: 'Applied',
        confidence: 85,
        reason: 'Detected submission acknowledgment from applicant tracking system',
      };
    }
  }

  // Recruiter Communication
  for (const pattern of PATTERNS.RECRUITER_COMMUNICATION) {
    if (pattern.test(combined)) {
      return {
        category: 'Recruiter Communication',
        suggestedStatus: null, // Keep existing status, do not make premature assumptions
        confidence: 65,
        reason: 'General recruiter outreach or status update check-in',
      };
    }
  }

  return {
    category: 'Other',
    suggestedStatus: null,
    confidence: 30,
    reason: 'Unclassified recruitment correspondence',
  };
}

/**
 * Extracts company name candidates from sender email domain, subject, and snippet
 */
export function extractCompanyInfo(senderEmail = '', senderName = '', subject = '', snippet = '') {
  // Domain extraction (e.g. "jobs@visa.com" -> "Visa", "noreply@blackrock.wd3.myworkdayjobs.com" -> "BlackRock")
  let domainMatch = senderEmail.match(/@([a-zA-Z0-9.-]+)/);
  let domain = domainMatch ? domainMatch[1].toLowerCase() : '';

  // Clean subdomains / ATS hosts
  domain = domain.replace(/^(jobs\.|careers\.|mail\.|notifications\.|recruiting\.|noreply\.)/, '');
  if (domain.includes('myworkdayjobs.com')) {
    domain = domain.replace('.myworkdayjobs.com', '').split('.')[0];
  } else if (domain.includes('greenhouse-mail.io') || domain.includes('greenhouse.io')) {
    domain = '';
  } else if (domain.includes('lever.co')) {
    domain = '';
  } else {
    domain = domain.split('.')[0];
  }

  // Subject line company extraction: "Application to Google", "Visa: Interview Invitation"
  let subjectCompany = '';
  const subjPatterns = [
    /(?:at|with|for)\s+([A-Z][a-zA-Z0-9&.\s]{1,25})/i,
    /^([A-Z][a-zA-Z0-9&.\s]{1,20}):/i,
    /\[([A-Z][a-zA-Z0-9&.\s]{1,20})\]/i,
  ];

  for (const pat of subjPatterns) {
    const match = subject.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!['Career', 'Job', 'Application', 'Update', 'Interview', 'Invitation', 'Your'].includes(candidate)) {
        subjectCompany = candidate;
        break;
      }
    }
  }

  // Sender Name extraction (e.g. "Visa Recruiting Team" -> "Visa")
  let senderCompany = '';
  if (senderName) {
    const cleaned = senderName.replace(/(Recruiting|Careers|Team|Talent|Hiring|HR|Staffing|Jobs)/gi, '').trim();
    if (cleaned.length > 1) {
      senderCompany = cleaned;
    }
  }

  const detectedCompany = subjectCompany || senderCompany || (domain ? domain.charAt(0).toUpperCase() + domain.slice(1) : '');

  // Extract potential job title from subject
  let detectedJobTitle = '';
  const titleMatch = subject.match(/(?:for|role of|position of|position:)\s+([A-Za-z0-9\s-]{3,35})(?:\s+at|\s+-|\s+\(|\.|$)/i);
  if (titleMatch && titleMatch[1]) {
    detectedJobTitle = titleMatch[1].trim();
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

  const { detectedCompany, detectedJobTitle, subject, snippet, senderEmail } = emailData;
  const searchCorpus = `${subject} ${snippet} ${senderEmail}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const app of applications) {
    let score = 0;
    const appCompany = app.companyName.toLowerCase();
    const appRole = app.jobTitle.toLowerCase();

    // 1. Company name direct match
    if (detectedCompany && detectedCompany.toLowerCase() === appCompany) {
      score += 45;
    } else if (searchCorpus.includes(appCompany)) {
      score += 35;
    }

    // 2. Job role match
    if (detectedJobTitle && detectedJobTitle.toLowerCase() === appRole) {
      score += 35;
    } else if (searchCorpus.includes(appRole)) {
      score += 25;
    } else {
      // Partial role word match (e.g., "Software" or "Engineer")
      const roleWords = appRole.split(/\s+/).filter(w => w.length > 3);
      const matches = roleWords.filter(w => searchCorpus.includes(w));
      if (matches.length > 0) {
        score += Math.min(15, matches.length * 5);
      }
    }

    // 3. Recruiter email match
    if (app.recruiterEmail && senderEmail.toLowerCase().includes(app.recruiterEmail.toLowerCase())) {
      score += 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = app;
    }
  }

  // Threshold: at least 35% confidence to consider a match
  if (bestScore >= 35) {
    return {
      matchedApp: bestMatch,
      confidence: Math.min(100, bestScore),
    };
  }

  return {
    matchedApp: null,
    confidence: bestScore,
  };
}

