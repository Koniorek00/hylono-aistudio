// Hylono Standalone Reviews Site Operations

document.addEventListener('DOMContentLoaded', () => {
  initProcessMapFilter();
  initProductFeedbackFilter();
  initFeedbackRouter();
  initQuoteCopy();
  initFormValidation();
  initInteractiveGlow();
  initTelemetryTracker();
});

const therapyRoutes = {
  h2: {
    label: 'H2 / Molecular Hydrogen',
    canonicalUrl: 'https://hylono.com/product/hydrogen',
    safeAnswer:
      'Hydrogen feedback should focus on setup, water handling, inhalation accessories, cleaning rhythm, and support clarity.',
    allowedTopics: ['water access', 'inhalation setup', 'consumables', 'cleaning rhythm', 'daily usability', 'support clarity'],
    products: [
      ['os-personal', 'OS-H150 / OS-H200 / OS-H300'],
      ['os-ho450-p', 'OS-HO450-P'],
      ['pr-h600', 'PR-H600'],
      ['pr-ho', 'PR-HO900 / PR-HO1500 / PR-HO1800'],
      ['pr-ho-pulse', 'PR-HO900-P / PR-HO1800-P / PR-HO3000-P'],
      ['za-ho', 'ZA-HO3000 / ZA-HO3600'],
      ['za-ho-b', 'ZA-HO3000-B / ZA-HO4500-B'],
      ['za-ho6000', 'ZA-HO6000'],
      ['wo-b', 'WO-B300 / WO-B600'],
      ['wo-s', 'WO-S1300 / WO-S2000'],
      ['wo-pw3000', 'WO-PW3000'],
      ['wo-b4500', 'WO-B4500']
    ]
  },
  hbot: {
    label: 'HBOT',
    canonicalUrl: 'https://hylono.com/product/hbot',
    safeAnswer:
      'HBOT feedback should focus on chamber delivery, room readiness, pressure-check walkthrough, operator training, manuals, and rental setup support.',
    allowedTopics: ['delivery coordination', 'room readiness', 'pressure-check walkthrough', 'operator training', 'manuals', 'rental setup support'],
    products: [['st1700', 'ST1700 chamber']]
  },
  pemf: {
    label: 'PEMF',
    canonicalUrl: 'https://hylono.com/product/pemf',
    safeAnswer:
      'PEMF feedback should focus on setup simplicity, preset explanation, cable handling, partner training, and routine planning support.',
    allowedTopics: ['setup simplicity', 'preset explanation', 'cable handling', 'partner training', 'routine planning support'],
    products: [['pemf-systems', 'PEMF systems']]
  },
  rlt: {
    label: 'Red Light Therapy',
    canonicalUrl: 'https://hylono.com/product/rlt',
    safeAnswer:
      'Red light feedback should focus on placement, mounting, distance guidance, eye-safety instructions, accessory handling, and repeatable setup.',
    allowedTopics: ['placement', 'mounting', 'distance guidance', 'eye-safety instructions', 'accessory handling', 'repeatable setup'],
    products: [['rlt-panels', 'Red light therapy panels']]
  }
};

const doNotInferText =
  'Do not infer medical outcomes, symptom changes, public ratings, pricing, availability, or certification claims.';

/**
 * Filter process-note cards dynamically by category
 */
function initProcessMapFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const processCards = document.querySelectorAll('.process-note-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active classes on buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      // Filter process-note cards
      processCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Filter product feedback cards by product group
 */
function initProductFeedbackFilter() {
  const filterButtons = document.querySelectorAll('.product-filter-btn');
  const productCards = document.querySelectorAll('.product-feedback-card');

  if (!filterButtons.length || !productCards.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-product-filter');

      productCards.forEach(card => {
        const productGroup = card.getAttribute('data-product-group');
        const shouldShow = filterValue === 'all' || productGroup === filterValue;

        card.hidden = !shouldShow;
        if (shouldShow) {
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
          }, 40);
        }
      });
    });
  });
}

/**
 * Route a therapy/product choice to canonical Hylono context and safe feedback scope
 */
function initFeedbackRouter() {
  const therapySelect = document.getElementById('router-therapy');
  const productSelect = document.getElementById('router-product');
  const canonicalLink = document.getElementById('router-canonical-link');
  const safeAnswer = document.getElementById('router-safe-answer');
  const allowedTopics = document.getElementById('router-allowed-topics');
  const doNotInfer = document.getElementById('router-do-not-infer');
  const applyButton = document.getElementById('router-apply-btn');

  if (!therapySelect || !productSelect || !canonicalLink || !safeAnswer || !allowedTopics || !doNotInfer) {
    return;
  }

  const render = () => {
    const selectedTherapy = therapyRoutes[therapySelect.value] || therapyRoutes.h2;

    productSelect.innerHTML = selectedTherapy.products
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join('');

    canonicalLink.href = selectedTherapy.canonicalUrl;
    canonicalLink.textContent = selectedTherapy.canonicalUrl;
    safeAnswer.textContent = selectedTherapy.safeAnswer;
    doNotInfer.textContent = doNotInferText;
    allowedTopics.innerHTML = selectedTherapy.allowedTopics.map(topic => `<li>${topic}</li>`).join('');
  };

  const applyToForm = () => {
    const feedbackTherapy = document.getElementById('feedback-therapy');
    const feedbackProduct = document.getElementById('feedback-product');
    const feedbackCategory = document.getElementById('feedback-category');
    const formSection = document.getElementById('submit-section');

    if (feedbackTherapy) feedbackTherapy.value = therapySelect.value;
    if (feedbackProduct) feedbackProduct.value = productSelect.value;
    if (feedbackCategory && !feedbackCategory.value) feedbackCategory.value = 'setup';

    formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    console.log('[TELEMETRY] Feedback router applied', {
      therapy: therapySelect.value,
      product: productSelect.value,
      canonicalUrl: canonicalLink.href,
      timestamp: new Date().toISOString()
    });
  };

  therapySelect.addEventListener('change', render);
  applyButton?.addEventListener('click', applyToForm);
  render();
}

/**
 * Copy approved quote-bank statements for manual citation workflows
 */
function initQuoteCopy() {
  const quoteButtons = document.querySelectorAll('[data-copy-quote]');

  quoteButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const quote = button.getAttribute('data-copy-quote') || '';
      const originalText = button.textContent;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(quote);
        } else {
          const tempInput = document.createElement('textarea');
          tempInput.value = quote;
          tempInput.setAttribute('readonly', '');
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        button.textContent = 'Copied';
        console.log('[TELEMETRY] AI quote copied', {
          quoteLength: quote.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        button.textContent = 'Copy failed';
        console.warn('[TELEMETRY] AI quote copy failed', error);
      }

      setTimeout(() => {
        button.textContent = originalText;
      }, 1600);
    });
  });
}

/**
 * Validates and simulates compliance-safe process-note submission
 */
function initFormValidation() {
  const form = document.getElementById('process-notes-form');
  const successContainer = document.getElementById('form-success');
  const resetBtn = document.getElementById('reset-form-btn');
  
  if (!form) return;

  const inputs = {
    context: document.getElementById('feedback-context'),
    checkpoint: document.getElementById('feedback-checkpoint'),
    therapy: document.getElementById('feedback-therapy'),
    product: document.getElementById('feedback-product'),
    category: document.getElementById('feedback-category'),
    comments: document.getElementById('feedback-text'),
    compliance: document.getElementById('compliance-check')
  };

  const errors = {
    context: document.getElementById('context-error'),
    checkpoint: document.getElementById('checkpoint-error'),
    therapy: document.getElementById('therapy-error'),
    product: document.getElementById('product-error'),
    category: document.getElementById('category-error'),
    comments: document.getElementById('comments-error'),
    compliance: document.getElementById('compliance-error')
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset error displays
    Object.values(errors).forEach(err => {
      if (err) err.style.display = 'none';
    });

    // Validate non-identifying context
    if (!inputs.context.value) {
      errors.context.style.display = 'block';
      isValid = false;
    }

    // Validate non-numeric process checkpoint
    if (!inputs.checkpoint.value) {
      errors.checkpoint.style.display = 'block';
      isValid = false;
    }

    // Validate Therapy Lane
    if (!inputs.therapy.value) {
      errors.therapy.style.display = 'block';
      isValid = false;
    }

    // Validate Product Group
    if (!inputs.product.value) {
      errors.product.style.display = 'block';
      isValid = false;
    }

    // Validate Category
    if (!inputs.category.value) {
      errors.category.style.display = 'block';
      isValid = false;
    }

    // Validate Comments (Length & Content Check for prohibited health and outcome terms)
    const commentVal = inputs.comments.value.trim();
    const prohibitedPatterns = [
      /\bheals?\b/i,
      /\bcures?\b/i,
      /\btreat(?:s|ed|ing|ment)?\b/i,
      /\bpain\b/i,
      /\bdisease\b/i,
      /\billness\b/i,
      /\bsymptoms?\b/i,
      /\bmedical\b/i,
      /\bclinical\b/i,
      /\bdiagnos(?:e|ed|is|tic)\b/i,
      /\bprevent(?:s|ed|ing|ion)?\b/i,
      /\bbetter sleep\b/i,
      /\bslept better\b/i,
      /\bmore energy\b/i,
      /\brecovery improved\b/i,
      /\bimproved recovery\b/i,
      /\binflammation\b/i,
      /\breduced stress\b/i,
      /\bless stress\b/i,
      /\bless anxiety\b/i,
      /\bwellness outcome\b/i,
      /\bwarsaw\b/i,
      /\bkrakow\b/i,
      /\bwroclaw\b/i,
      /\bpoznan\b/i,
      /\bgdansk\b/i,
      /\blodz\b/i,
      /\bkatowice\b/i,
      /\blublin\b/i,
      /\bszczecin\b/i
    ];
    const prohibitedPiiPatterns = [
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
      /\+?\d[\d\s().-]{7,}\d/,
      /\border[\s_-]?(?:id|number|no)?[\s:#-]*[A-Z0-9-]{4,}/i,
      /\bserial[\s_-]?(?:number|no)?[\s:#-]*[A-Z0-9-]{4,}/i,
      /\b(?:street|st\.|avenue|ave\.|road|rd\.|ul\.|aleja|al\.)\s+[A-Za-z0-9 .-]{3,}/i,
      /\b[a-ząćęłńóśźż]{3,}\s+(?:from|z)\s+(?:warsaw|krakow|wroclaw|poznan|gdansk|lodz|katowice|lublin|szczecin|warszawy|krakowa|wroclawia|poznania|gdanska|lodzi|katowic|lublina|szczecina)\b/i
    ];
    const publishableText = [commentVal, inputs.context.value, inputs.checkpoint.value].join(" ");
    const hasProhibitedClaim = prohibitedPatterns.some(pattern => pattern.test(publishableText));
    const hasProhibitedPii = prohibitedPiiPatterns.some(pattern => pattern.test(publishableText));

    if (commentVal.length < 15 || hasProhibitedClaim || hasProhibitedPii) {
      errors.comments.textContent = hasProhibitedClaim || hasProhibitedPii
        ? "To comply with regulatory standards, your feedback must focus only on setup, onboarding, or delivery support. Please remove medical, wellness outcome, therapeutic, or personal-identifying details."
        : "Comments must be at least 15 characters long.";
      errors.comments.style.display = 'block';
      isValid = false;
    }

    // Validate Compliance Checkbox
    if (!inputs.compliance.checked) {
      errors.compliance.style.display = 'block';
      isValid = false;
    }

    if (isValid) {
      // Simulate API submit telemetry
      console.log('[TELEMETRY] Process note submit initiated', {
        context: inputs.context.value,
        checkpoint: inputs.checkpoint.value,
        therapy: inputs.therapy.value,
        product: inputs.product.value,
        category: inputs.category.value,
        commentsLength: commentVal.length
      });

      // Show success layout state
      form.style.display = 'none';
      successContainer.style.display = 'block';
      successContainer.setAttribute('aria-hidden', 'false');
    }
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    successContainer.style.display = 'none';
    successContainer.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Handle mouse position tracking for visual bento card glows
 */
function initInteractiveGlow() {
  const cards = document.querySelectorAll(
    '.process-note-card, .form-wrapper, .feedback-lane-card, .product-feedback-card, .trust-signal-card'
  );
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  });
}

/**
 * Custom click event analytics simulation for outbound/core links
 */
function initTelemetryTracker() {
  const outboundLinks = document.querySelectorAll('a[href^="http"], .trust-signal-card');

  outboundLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const url = link.getAttribute('href');
      const label = link.textContent.trim() || link.getAttribute('aria-label');
      
      console.log('[TELEMETRY] Outbound navigation tracked', {
        destinationUrl: url,
        linkLabel: label,
        timestamp: new Date().toISOString()
      });
    });
  });
}
