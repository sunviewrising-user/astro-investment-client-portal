const form = document.querySelector('#consultationForm');
const tabs = document.querySelectorAll('.tab');
const message = document.querySelector('#formMessage');
const payButton = document.querySelector('#payButton');
const config = window.ASTRO_CONFIG || {};

document.querySelector('#year').textContent = new Date().getFullYear();

function randomCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0].toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

function newClientId() {
  const d = new Date();
  const date = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('');
  return `ASTRO-INVESTOR-${date}-${randomCode()}`;
}

function switchMode(mode) {
  const repeat = mode === 'repeat';
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.type === mode));
  document.querySelectorAll('.new-only').forEach(el => el.classList.toggle('is-hidden', repeat));
  document.querySelectorAll('.repeat-only').forEach(el => { el.hidden = !repeat; el.classList.toggle('is-hidden', !repeat); });
  document.querySelector('#consultationType').value = repeat ? 'Next Consultation' : 'New Client';
  document.querySelectorAll('.new-only input[required],.new-only select[required]').forEach(el => el.required = !repeat);
  document.querySelector('#existingClientId').required = repeat;
  document.querySelector('#existingEmail').required = repeat;
}

tabs.forEach(tab => tab.addEventListener('click', () => switchMode(tab.dataset.type)));

if (config.paymentUrl) {
  payButton.disabled = false;
  payButton.textContent = `Pay ₹${config.fee || 500}`;
  payButton.addEventListener('click', () => window.open(config.paymentUrl, '_blank', 'noopener'));
}

function formObject(formData) {
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (Object.hasOwn(data, key)) data[key] = [].concat(data[key], value);
    else data[key] = value;
  }
  return data;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  message.className = 'message';
  const isRepeat = document.querySelector('#consultationType').value === 'Next Consultation';
  const clientId = isRepeat ? document.querySelector('#existingClientId').value.trim() : newClientId();
  document.querySelector('#clientId').value = clientId;
  const payload = formObject(new FormData(form));
  payload.submittedAt = new Date().toISOString();
  payload.fee = config.fee || 500;
  payload.source = location.href;

  if (!config.scriptUrl) {
    message.textContent = `Website form is ready. Your reference is ${clientId}. The email connection must be activated before public use.`;
    message.className = 'message show error';
    return;
  }

  const submitButton = form.querySelector('.submit');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting securely…';
  try {
    await fetch(config.scriptUrl, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload)});
    message.textContent = `Request submitted successfully. Your Client ID is ${clientId}. Please save it for future consultations.`;
    message.className = 'message show success';
    form.reset();
    document.querySelector('#clientId').value = '';
    window.scrollTo({top:message.offsetTop - 40,behavior:'smooth'});
  } catch (error) {
    message.textContent = 'The request could not be submitted. Please check your connection and try again.';
    message.className = 'message show error';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit consultation request';
  }
});
