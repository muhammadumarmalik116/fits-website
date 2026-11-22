/* =====================================================
   booking.js - consultation booking form (owner: Umar)
   Flow: user submits -> we validate every field -> if all valid,
   save the booking in the browser (localStorage) -> show a summary.
   Note: this is a front-end project, so there is no server database.
   ===================================================== */

const form = document.getElementById('bookingForm');

if (form) {
  const successBox = document.getElementById('successBox');
  const summary = document.getElementById('summary');
  const newBookingBtn = document.getElementById('newBooking');
  const dateInput = document.getElementById('date');

  // Local date as YYYY-MM-DD (so past dates can be blocked)
  function todayString() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }
  dateInput.min = todayString();

  // Show or clear an error under a field
  function setError(input, message) {
    const field = input.closest('.field');
    field.querySelector('.error').textContent = message;
    field.classList.toggle('invalid', message !== '');
  }

  // One rule per field. Returns an error message, or '' if the value is fine.
  const rules = {
    name:    v => v.trim().length < 3 ? 'Please enter your full name (at least 3 letters).' : '',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    phone:   v => /^\+?[0-9\s-]{7,15}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.',
    service: v => v === '' ? 'Please choose a service.' : '',
    date:    v => v === '' ? 'Please pick a date.' : (v < todayString() ? 'The date cannot be in the past.' : ''),
    time:    v => v === '' ? 'Please choose a time.' : ''
  };

  // Check one field
  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const message = rule(input.value);
    setError(input, message);
    return message === '';
  }

  // Check all fields; returns true only if every one passes
  function validateAll() {
    let ok = true;
    Object.keys(rules).forEach(name => {
      if (!validateField(form.elements[name])) ok = false;
    });
    return ok;
  }

  // Clear the error as soon as the user fixes a field
  form.addEventListener('input', e => {
    if (rules[e.target.name] && e.target.closest('.field').classList.contains('invalid')) {
      validateField(e.target);
    }
  });

  // Submit handler
  form.addEventListener('submit', e => {
    e.preventDefault();          // stop the page from reloading
    if (!validateAll()) return;  // stop here if anything is invalid

    const booking = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      service: form.service.value,
      date: form.date.value,
      time: form.time.value,
      message: form.message.value.trim(),
      createdAt: new Date().toISOString()
    };

    // Save to the browser's localStorage (works like a tiny database)
    try {
      const saved = JSON.parse(localStorage.getItem('fitsBookings') || '[]');
      saved.push(booking);
      localStorage.setItem('fitsBookings', JSON.stringify(saved));
    } catch (err) {
      console.warn('Could not save booking', err);
    }

    // Build the summary with textContent (safe: user text is never run as HTML)
    summary.innerHTML = '';
    [['Name', booking.name], ['Service', booking.service],
     ['Date', booking.date], ['Time', booking.time], ['Email', booking.email]]
      .forEach(([label, value]) => {
        const p = document.createElement('p');
        const b = document.createElement('strong');
        b.textContent = label + ': ';
        p.appendChild(b);
        p.appendChild(document.createTextNode(value));
        summary.appendChild(p);
      });

    form.style.display = 'none';
    successBox.classList.add('show');
  });

  // "Make another booking" resets everything
  newBookingBtn.addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
    form.querySelectorAll('.error').forEach(el => el.textContent = '');
    successBox.classList.remove('show');
    form.style.display = '';
  });
}
