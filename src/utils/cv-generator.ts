import { CandidateProfile } from '@/types/api-responses';
import { format } from 'date-fns';
import {
  SKILL_PROFICIENCY_LABELS,
  LANGUAGE_PROFICIENCY_LABELS,
} from '@/constants/candidate';

/**
 * Generate ATS-friendly PDF CV from candidate profile
 * This creates the content structure for PDF generation
 * In production, this would integrate with a PDF library like jsPDF or pdfmake
 */

export interface CVSection {
  title: string;
  content: string[];
}

export interface CVContent {
  header: {
    name: string;
    headline?: string;
    contact: string[];
  };
  sections: CVSection[];
}

/**
 * Generate CV content structure from profile data
 */
export function generateCVContent(profile: CandidateProfile): CVContent {
  const header = generateHeader(profile);
  const sections: CVSection[] = [];

  // Summary section
  if (profile.summary) {
    sections.push({
      title: 'Professional Summary',
      content: [profile.summary],
    });
  }

  // Work Experience section
  if (profile.work_experience.length > 0) {
    sections.push(generateExperienceSection(profile));
  }

  // Education section
  if (profile.education.length > 0) {
    sections.push(generateEducationSection(profile));
  }

  // Skills section
  if (profile.skills.length > 0) {
    sections.push(generateSkillsSection(profile));
  }

  // Certifications section
  if (profile.certifications.length > 0) {
    sections.push(generateCertificationsSection(profile));
  }

  // Projects section
  if (profile.projects.length > 0) {
    sections.push(generateProjectsSection(profile));
  }

  // Languages section
  if (profile.languages.length > 0) {
    sections.push(generateLanguagesSection(profile));
  }

  return { header, sections };
}

function generateHeader(
  profile: CandidateProfile
): CVContent['header'] {
  const contact: string[] = [];

  contact.push(profile.email);

  if (profile.phone) {
    contact.push(profile.phone);
  }

  if (profile.location) {
    contact.push(profile.location);
  }

  if (profile.social_links?.linkedin) {
    contact.push(profile.social_links.linkedin);
  }

  if (profile.social_links?.github) {
    contact.push(profile.social_links.github);
  }

  if (profile.social_links?.portfolio) {
    contact.push(profile.social_links.portfolio);
  }

  return {
    name: `${profile.first_name} ${profile.last_name}`,
    headline: profile.headline,
    contact,
  };
}

function generateExperienceSection(profile: CandidateProfile): CVSection {
  const content: string[] = [];

  profile.work_experience.forEach((exp) => {
    const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
    content.push(`${exp.title} | ${exp.company}`);
    content.push(`${dateRange}${exp.location ? ' | ' + exp.location : ''}`);

    if (exp.description) {
      content.push(exp.description);
    }

    if (exp.achievements && exp.achievements.length > 0) {
      exp.achievements.forEach((achievement) => {
        content.push(`  - ${achievement}`);
      });
    }

    if (exp.technologies && exp.technologies.length > 0) {
      content.push(`Technologies: ${exp.technologies.join(', ')}`);
    }

    content.push(''); // Empty line between experiences
  });

  return {
    title: 'Professional Experience',
    content,
  };
}

function generateEducationSection(profile: CandidateProfile): CVSection {
  const content: string[] = [];

  profile.education.forEach((edu) => {
    const dateRange = formatDateRange(edu.start_date, edu.end_date, edu.is_current);
    content.push(`${edu.degree} in ${edu.field_of_study}`);
    content.push(`${edu.institution} | ${dateRange}`);

    if (edu.gpa) {
      content.push(`GPA: ${edu.gpa}`);
    }

    if (edu.honors && edu.honors.length > 0) {
      content.push(`Honors: ${edu.honors.join(', ')}`);
    }

    if (edu.description) {
      content.push(edu.description);
    }

    content.push(''); // Empty line between education entries
  });

  return {
    title: 'Education',
    content,
  };
}

function generateSkillsSection(profile: CandidateProfile): CVSection {
  const content: string[] = [];

  // Group skills by category
  const skillsByCategory = profile.skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, typeof profile.skills>
  );

  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    const skillList = skills
      .map((skill) => {
        const proficiency = SKILL_PROFICIENCY_LABELS[skill.proficiency];
        return `${skill.name} (${proficiency})`;
      })
      .join(', ');

    content.push(`${category}: ${skillList}`);
  });

  return {
    title: 'Technical Skills',
    content,
  };
}

function generateCertificationsSection(profile: CandidateProfile): CVSection {
  const content: string[] = [];

  profile.certifications.forEach((cert) => {
    const issueDate = formatDate(cert.issue_date);
    let certLine = `${cert.name} | ${cert.issuing_organization} | ${issueDate}`;

    if (cert.expiry_date) {
      const expiryDate = formatDate(cert.expiry_date);
      certLine += ` | Expires: ${expiryDate}`;
    }

    content.push(certLine);

    if (cert.credential_id) {
      content.push(`Credential ID: ${cert.credential_id}`);
    }
  });

  return {
    title: 'Certifications',
    content,
  };
}

function generateProjectsSection(profile: CandidateProfile): CVSection {
  const content: string[] = [];

  profile.projects.forEach((project) => {
    content.push(project.name);
    content.push(project.description);

    if (project.technologies && project.technologies.length > 0) {
      content.push(`Technologies: ${project.technologies.join(', ')}`);
    }

    if (project.url) {
      content.push(`URL: ${project.url}`);
    }

    content.push('');
  });

  return {
    title: 'Projects',
    content,
  };
}

function generateLanguagesSection(profile: CandidateProfile): CVSection {
  const content: string[] = [];

  const languageList = profile.languages
    .map((lang) => {
      const proficiency = LANGUAGE_PROFICIENCY_LABELS[lang.proficiency];
      return `${lang.name} (${proficiency})`;
    })
    .join(', ');

  content.push(languageList);

  return {
    title: 'Languages',
    content,
  };
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM yyyy');
  } catch {
    return dateString;
  }
}

function formatDateRange(
  startDate: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  const start = formatDate(startDate);

  if (isCurrent) {
    return `${start} - Present`;
  }

  if (endDate) {
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  }

  return start;
}

/**
 * Convert CV content to plain text (for ATS compatibility)
 */
export function cvContentToPlainText(cvContent: CVContent): string {
  const lines: string[] = [];

  // Header
  lines.push(cvContent.header.name);
  if (cvContent.header.headline) {
    lines.push(cvContent.header.headline);
  }
  lines.push(cvContent.header.contact.join(' | '));
  lines.push('');

  // Sections
  cvContent.sections.forEach((section) => {
    lines.push('='.repeat(50));
    lines.push(section.title.toUpperCase());
    lines.push('='.repeat(50));
    lines.push('');
    section.content.forEach((line) => {
      lines.push(line);
    });
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Convert CV content to HTML (for PDF generation)
 */
export function cvContentToHTML(cvContent: CVContent): string {
  const styles = `
    <style>
      body {
        font-family: 'Georgia', serif;
        margin: 40px;
        color: #333;
        line-height: 1.6;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      .name {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .headline {
        font-size: 18px;
        color: #666;
        margin-bottom: 10px;
      }
      .contact {
        font-size: 12px;
        color: #666;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        font-size: 16px;
        font-weight: bold;
        text-transform: uppercase;
        border-bottom: 1px solid #999;
        padding-bottom: 5px;
        margin-bottom: 15px;
        color: #333;
      }
      .section-content {
        font-size: 12px;
      }
      .section-content p {
        margin: 5px 0;
      }
      ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      li {
        margin: 2px 0;
      }
    </style>
  `;

  const headerHTML = `
    <div class="header">
      <div class="name">${escapeHTML(cvContent.header.name)}</div>
      ${cvContent.header.headline ? `<div class="headline">${escapeHTML(cvContent.header.headline)}</div>` : ''}
      <div class="contact">${cvContent.header.contact.map(escapeHTML).join(' | ')}</div>
    </div>
  `;

  const sectionsHTML = cvContent.sections
    .map((section) => {
      const contentHTML = section.content
        .map((line) => {
          if (line.trim() === '') {
            return '<br/>';
          }
          if (line.trim().startsWith('- ')) {
            return `<li>${escapeHTML(line.trim().substring(2))}</li>`;
          }
          return `<p>${escapeHTML(line)}</p>`;
        })
        .join('\n');

      return `
        <div class="section">
          <div class="section-title">${escapeHTML(section.title)}</div>
          <div class="section-content">
            ${contentHTML}
          </div>
        </div>
      `;
    })
    .join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHTML(cvContent.header.name)} - CV</title>
      ${styles}
    </head>
    <body>
      ${headerHTML}
      ${sectionsHTML}
    </body>
    </html>
  `;
}

function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

/**
 * Generate PDF from profile (using browser's print functionality)
 * This is a simple approach; for production, use a proper PDF library
 */
export function generatePDFFromProfile(profile: CandidateProfile): void {
  const cvContent = generateCVContent(profile);
  const htmlContent = cvContentToHTML(cvContent);

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Calculate profile strength/completeness score
 */
export function calculateProfileCompleteness(profile: CandidateProfile): {
  score: number;
  missing: string[];
} {
  const missing: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Basic info (15 points)
  if (profile.first_name && profile.last_name) score += 10;
  else missing.push('Full name');

  if (profile.headline) score += 5;
  else missing.push('Professional headline');

  // Contact (10 points)
  if (profile.email) score += 5;
  if (profile.phone) score += 5;
  else missing.push('Phone number');

  // Summary (10 points)
  if (profile.summary && profile.summary.length > 50) score += 10;
  else missing.push('Professional summary');

  // Skills (15 points)
  if (profile.skills.length >= 5) score += 15;
  else if (profile.skills.length > 0) score += 8;
  else missing.push('Technical skills');

  // Experience (20 points)
  if (profile.work_experience.length >= 2) score += 20;
  else if (profile.work_experience.length === 1) score += 12;
  else missing.push('Work experience');

  // Education (15 points)
  if (profile.education.length > 0) score += 15;
  else missing.push('Education');

  // Languages (5 points)
  if (profile.languages.length > 0) score += 5;
  else missing.push('Languages');

  // Certifications (5 points)
  if (profile.certifications.length > 0) score += 5;

  // Projects (5 points)
  if (profile.projects.length > 0) score += 5;

  return {
    score: Math.min(score, maxScore),
    missing,
  };
}

/**
 * Get suggestions to improve profile
 */
export function getProfileImprovementSuggestions(
  profile: CandidateProfile
): string[] {
  const suggestions: string[] = [];

  if (!profile.headline) {
    suggestions.push('Add a professional headline to make your profile stand out');
  }

  if (!profile.summary || profile.summary.length < 100) {
    suggestions.push('Write a compelling professional summary (at least 100 characters)');
  }

  if (profile.skills.length < 5) {
    suggestions.push('Add more technical skills to showcase your expertise');
  }

  if (profile.work_experience.length === 0) {
    suggestions.push('Add your work experience to demonstrate your background');
  } else {
    const expWithoutAchievements = profile.work_experience.filter(
      (exp) => !exp.achievements || exp.achievements.length === 0
    );
    if (expWithoutAchievements.length > 0) {
      suggestions.push('Add achievements to your work experiences to highlight your impact');
    }
  }

  if (profile.education.length === 0) {
    suggestions.push('Include your educational background');
  }

  if (!profile.social_links?.linkedin) {
    suggestions.push('Add your LinkedIn profile URL');
  }

  if (!profile.avatar_url) {
    suggestions.push('Upload a professional profile photo');
  }

  if (profile.languages.length === 0) {
    suggestions.push('Add languages you speak to broaden your opportunities');
  }

  return suggestions;
}
