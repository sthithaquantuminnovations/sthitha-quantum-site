
import emailjs from '@emailjs/browser';

const CONFIG = {
  serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY,
};

const SELECTORS = {
  form: '[data-emailjs-form]',
  status: '.form-status',
  submit: 'button[type="submit"]',
  honeypot: '[name="website"]',
};

const MESSAGES = {
  success: 'Thank you! Your enquiry has been sent successfully.',
  failure:
    'We could not send your enquiry. Please try again or email us directly.',
  spam: 'Your enquiry could not be submitted.',
  sending: 'Sending your enquiry...',
};

function isConfigured() {
  return Object.values(CONFIG).every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}

function setStatus(element, message, type = '') {
  if (!element) return;

  element.textContent = message;
  element.className = 'form-status';

  if (type) {
    element.classList.add(type);
  }
}

function initialiseContactForm() {
  const form = document.querySelector(SELECTORS.form);

  // This module should do nothing on pages without the contact form.
  if (!form) return;

  const status = form
    .closest('#contact-form')
    ?.querySelector(SELECTORS.status);

  const submitButton = form.querySelector(SELECTORS.submit);
  const honeypot = form.querySelector(SELECTORS.honeypot);

  if (!submitButton || !status) {
    console.error('Contact form is missing its status or submit element.');
    return;
  }

  if (!isConfigured()) {
    setStatus(
      status,
      'The contact form is not configured yet. Please email us directly.',
      'err',
    );

    submitButton.disabled = true;
    return;
  }

  let isSubmitting = false;
  const originalButtonText = submitButton.textContent.trim();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Prevent accidental duplicate submissions.
    if (isSubmitting) return;

    // Keep the existing hidden honeypot field for basic bot filtering.
    if (honeypot?.value.trim()) {
      setStatus(status, MESSAGES.spam, 'err');
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    form.setAttribute('aria-busy', 'true');

    setStatus(status, MESSAGES.sending);

    try {
      await emailjs.sendForm(
        CONFIG.serviceId,
        CONFIG.templateId,
        form,
        {
          publicKey: CONFIG.publicKey,
          limitRate: {
            throttle: 10000,
          },
        },
      );

      setStatus(status, MESSAGES.success, 'ok');
      form.reset();
    } catch (error) {
      // Keep detailed diagnostics in the browser console, not in the UI.
      console.error('EmailJS contact submission failed:', error);

      setStatus(status, MESSAGES.failure, 'err');
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      form.removeAttribute('aria-busy');
    }
  });
}

initialiseContactForm();
