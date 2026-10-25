/* Lapnex mockup: shared order logic for checkout, thank-you, tracking and account pages.
   Mirrors the rules in docs/03-architecture.md and docs/04-payments.md. In the Laravel build this logic lives on the
   server (CheckoutService, PaymentManager). Prices and totals here are for the demo only. */
(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;

  const CITIES = [
    ['Lahore', 300], ['Karachi', 600], ['Islamabad', 450], ['Rawalpindi', 450], ['Faisalabad', 400], ['Multan', 450],
    ['Peshawar', 550], ['Quetta', 700], ['Sialkot', 400], ['Gujranwala', 400], ['Hyderabad', 600], ['Bahawalpur', 500],
    ['Sargodha', 450], ['Sukkur', 600], ['Abbottabad', 550], ['Gujrat', 400], ['Sahiwal', 450], ['Rahim Yar Khan', 550],
    ['Mardan', 550], ['Mingora', 600],
  ].map(([name, fee]) => ({ name, fee }));

  const METHODS = {
    cod: { label: 'Cash on Delivery', short: 'COD', online: false },
    bank: { label: 'Bank Transfer', short: 'IBFT', online: false },
    jazzcash: { label: 'JazzCash', short: 'JazzCash', online: false },
    easypaisa: { label: 'Easypaisa', short: 'Easypaisa', online: false },
    card: { label: 'Debit / Credit Card', short: 'VISA', online: true },
  };

  /* Settings the admin controls (docs/05-admin.md). Sample values. */
  const RULES = {
    freeOver: 50000, defaultFee: 500,
    codMax: 250000, codAdvanceFrom: 100000, codAdvance: 2000,
    prepaidPct: 2, prepaidMax: 3000,
    receiptMaxMB: 5, receiptTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    store: { name: 'Lapnex Store', address: 'Shop No. 00, Main Market, Lahore', hours: 'Mon – Sat, 11:00 AM – 8:00 PM' },
    bank: { Bank: 'Meezan Bank (sample)', 'Account title': 'Lapnex', 'Account number': '0101-0123456789', IBAN: 'PK36MEZN0000010123456789', 'Raast ID': '0300-0000000' },
    jazzcash: { Wallet: 'JazzCash', 'Account title': 'Lapnex', Number: '0300-0000000' },
    easypaisa: { Wallet: 'Easypaisa', 'Account title': 'Lapnex', Number: '0300-0000001' },
  };

  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const fmt = n => 'Rs ' + Math.round(n).toLocaleString('en-US');

  /* Phone: accept 03XXXXXXXXX, +923XXXXXXXXX and 923XXXXXXXXX, always store as 03XXXXXXXXX */
  function normPhone(v) {
    let d = String(v || '').replace(/[^\d+]/g, '');
    if (d.startsWith('+')) d = d.slice(1);
    if (d.startsWith('92') && d.length === 12) d = '0' + d.slice(2);
    return d;
  }
  const validPhone = v => /^03\d{9}$/.test(normPhone(v));
  const validEmail = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function cityFee(name) {
    const c = CITIES.find(x => x.name.toLowerCase() === String(name || '').trim().toLowerCase());
    return c ? c.fee : null;
  }
  const codAllowed = subtotal => subtotal <= RULES.codMax;
  const codAdvance = (method, subtotal) => (method === 'cod' && subtotal >= RULES.codAdvanceFrom ? RULES.codAdvance : 0);
  const prepaidDiscount = (method, subtotal) => (method === 'cod' ? 0 : Math.min(Math.round(subtotal * RULES.prepaidPct / 100), RULES.prepaidMax));

  /* Totals are always computed from line items, never taken from the form */
  function totals({ items, method, pickup, city }) {
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    let delivery = 0, deliveryKnown = true;
    if (!pickup && subtotal < RULES.freeOver) {
      const fee = cityFee(city);
      if (fee === null) deliveryKnown = false; else delivery = fee;
    }
    const discount = prepaidDiscount(method, subtotal);
    const total = subtotal + delivery - discount;
    const advance = codAdvance(method, subtotal);
    return {
      subtotal, delivery, deliveryKnown, discount, total, advance,
      free: pickup || subtotal >= RULES.freeOver,
      payNow: method === 'cod' ? advance : total,
      dueOnDelivery: method === 'cod' ? total - advance : 0,
    };
  }

  function nextNumber(storage, now = new Date()) {
    const day = String(now.getFullYear()).slice(2) + pad(now.getMonth() + 1) + pad(now.getDate());
    const key = 'lapnex-order-seq-' + day;
    let n = 0;
    try { n = parseInt(storage.getItem(key) || '0', 10) || 0; } catch (e) {}
    n += 1;
    try { storage.setItem(key, String(n)); } catch (e) {}
    return 'LPX-' + day + '-' + pad(n, 4);
  }

  /* Order snapshot: copies the items so later price changes never touch it */
  function buildOrder({ form, items, method, number, now = new Date(), cardFailed = false }) {
    const pickup = form.delivery === 'pickup';
    const t = totals({ items, method, pickup, city: form.city });
    return {
      number, method, status: 'pending',
      paymentStatus: method === 'card' ? (cardFailed ? 'failed' : 'paid') : 'unpaid',
      items: items.map(i => ({ name: i.name, cond: i.cond, grade: i.grade || null, options: [...(i.options || [])], qty: i.qty, price: i.price, old: i.old || null })),
      ...t,
      customer: { name: form.name.trim(), phone: normPhone(form.phone), email: (form.email || '').trim() },
      ship: { pickup, city: pickup ? '' : form.city.trim(), address: pickup ? RULES.store.address : form.address.trim(), landmark: (form.landmark || '').trim(), notes: (form.notes || '').trim() },
      video: !!form.video, createAccount: !!form.account,
      events: [{ key: 'placed', at: now.toISOString() }],
      courier: null, receipt: null,
    };
  }

  /* Where the customer goes after placing the order */
  function nextPage(order) {
    if (order.method === 'cod') return 'thankyou-cod.html';
    if (order.method === 'card') return order.paymentStatus === 'failed' ? 'payment-failed.html' : 'thankyou-paid.html';
    return 'thankyou-bank.html';
  }

  /* Switching payment method after a failed card payment: totals are recomputed under the new method's rules */
  function switchMethod(order, method) {
    const t = totals({ items: order.items, method, pickup: order.ship.pickup, city: order.ship.city });
    return { ...order, method, ...t, paymentStatus: 'unpaid' };
  }

  const STEPS = [
    ['placed', 'Order placed', 'We have received your order.'],
    ['confirmed', 'Confirmed', 'We confirmed your order and are preparing it.'],
    ['shipped', 'Shipped', 'Your laptop is on its way.'],
    ['delivered', 'Delivered', 'Delivered. Enjoy your laptop!'],
  ];
  function timeline(order) {
    const at = key => (order.events.find(e => e.key === key) || {}).at || null;
    const reached = STEPS.findIndex(s => !at(s[0]));
    const current = reached === -1 ? STEPS.length - 1 : reached - 1;
    return STEPS.map((s, i) => ({ key: s[0], label: s[1], text: s[2], at: at(s[0]), done: i <= current, current: i === current }));
  }

  const STATUS = {
    pending: ['Pending', 'bg-cond-used/10 text-cond-used'], pending_payment: ['Awaiting payment', 'bg-cond-used/10 text-cond-used'],
    confirmed: ['Confirmed', 'bg-cond-refurb/10 text-cond-refurb'], shipped: ['Shipped', 'bg-brand-100 text-brand-700'],
    delivered: ['Delivered', 'bg-cond-new/10 text-cond-new'], cancelled: ['Cancelled', 'bg-surface-alt text-ink-muted'],
  };
  const PAYMENT = {
    unpaid: ['Unpaid', 'bg-cond-used/10 text-cond-used'], pending_verification: ['Verifying payment', 'bg-cond-refurb/10 text-cond-refurb'],
    paid: ['Paid', 'bg-cond-new/10 text-cond-new'], failed: ['Payment failed', 'bg-accent-100 text-accent-700'], refunded: ['Refunded', 'bg-surface-alt text-ink-muted'],
  };

  /* Receipt upload checks (type and size), same limits as the server */
  function validateReceipt(file) {
    if (!file) return 'Please choose a screenshot or PDF of your payment.';
    if (!RULES.receiptTypes.includes(file.type)) return 'Only JPG, PNG, WebP or PDF files are allowed.';
    if (file.size > RULES.receiptMaxMB * 1024 * 1024) return 'That file is too big. The limit is ' + RULES.receiptMaxMB + ' MB.';
    return null;
  }

  /* A few demo orders for tracking and the account pages */
  function demoOrders() {
    const mk = (number, method, status, paymentStatus, items, events, extra = {}) => {
      const t = totals({ items, method, pickup: false, city: 'Lahore' });
      return { number, method, status, paymentStatus, items, ...t,
        customer: { name: 'Ahmed Khan', phone: '03001234567', email: 'ahmed@example.com' },
        ship: { pickup: false, city: 'Lahore', address: 'House 12, Street 4, Gulberg III', landmark: 'Near Liberty Market', notes: '' },
        video: false, createAccount: false, events, courier: null, receipt: null, ...extra };
    };
    const it = (name, cond, grade, price, qty = 1, options = []) => ({ name, cond, grade, options, qty, price, old: null });
    return [
      mk('LPX-261024-0071', 'bank', 'pending', 'unpaid', [it('APPLE MACBOOK AIR M1 13" 2020', 'Open Box', null, 165000)],
        [{ key: 'placed', at: '2026-10-24T11:20:00+05:00' }]),
      mk('LPX-261022-0058', 'cod', 'shipped', 'unpaid', [it('HP ELITEBOOK 840 G6 i5 8TH', 'Refurbished', 'A+', 48500, 1, ['16GB DDR4', '256GB SSD']), it('LENOVO THINKPAD T480 i5 8TH', 'Used', 'A', 42000)],
        [{ key: 'placed', at: '2026-10-22T16:05:00+05:00' }, { key: 'confirmed', at: '2026-10-22T18:40:00+05:00' }, { key: 'shipped', at: '2026-10-23T12:10:00+05:00' }],
        { courier: { name: 'Leopards Courier', tracking: 'LEO-30918822', url: '#' } }),
      mk('LPX-261018-0031', 'jazzcash', 'delivered', 'paid', [it('DELL LATITUDE 7490 i7 8TH', 'Used', 'A', 55000)],
        [{ key: 'placed', at: '2026-10-18T10:15:00+05:00' }, { key: 'confirmed', at: '2026-10-18T11:02:00+05:00' }, { key: 'shipped', at: '2026-10-19T13:30:00+05:00' }, { key: 'delivered', at: '2026-10-21T15:45:00+05:00' }],
        { courier: { name: 'TCS', tracking: 'TCS-77120934', url: '#' }, receipt: { name: 'jazzcash-receipt.jpg', size: 184000, at: '2026-10-18T10:40:00+05:00' } }),
    ];
  }

  /* A sample order so a result page still looks right when opened on its own */
  function sample(method = 'cod') {
    const items = [{ name: 'HP ELITEBOOK 840 G6 i5 8TH', cond: 'Refurbished', grade: 'A+', options: ['32GB DDR4', '256GB SSD'], qty: 1, price: 57500, old: 63000 }];
    const o = buildOrder({ form: { name: 'Ahmed Khan', phone: '0300 1234567', email: 'ahmed@example.com', delivery: 'ship', city: 'Lahore', address: 'House 12, Street 4, Gulberg III', landmark: 'Near Liberty Market', video: true }, items, method, number: 'LPX-261025-0042', now: new Date('2026-10-25T15:42:00+05:00') });
    if (method === 'card') o.paymentStatus = 'paid';
    return o;
  }

  function lookup(orders, number, phone) {
    const n = String(number || '').trim().toUpperCase().replace(/\s+/g, '');
    const p = normPhone(phone);
    return orders.find(o => o.number === n && o.customer.phone === p) || null;
  }

  function safeStorage() {
    try { const s = root.localStorage; s.getItem('x'); return s; }
    catch (e) { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = v; }, removeItem: k => { delete m[k]; } }; }
  }
  const LAST = 'lapnex-last-order-v1', LIST = 'lapnex-orders-v1', PATCH = 'lapnex-order-patches-v1';
  function store(storage) {
    const read = (key, fallback) => { try { const r = storage.getItem(key); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; } };
    const write = (key, value) => { try { storage.setItem(key, JSON.stringify(value)); } catch (e) {} };
    const patches = () => read(PATCH, {});
    const apply = o => (o ? { ...o, ...(patches()[o.number] || {}) } : o);
    return {
      /* The order just placed (drives the thank-you pages) */
      last() { return apply(read(LAST, null)); },
      /* Every order placed in this browser, newest first (drives My orders and tracking) */
      placed() { return read(LIST, []).map(apply); },
      saveLast(o) {
        write(LAST, o);
        write(LIST, [o, ...read(LIST, []).filter(x => x.number !== o.number)].slice(0, 20));
        const m = patches(); delete m[o.number]; write(PATCH, m);
      },
      clearLast() { try { storage.removeItem(LAST); } catch (e) {} },
      /* Change a few fields of any order (placed or demo) without replacing the "last order" */
      patch(number, fields) { const m = patches(); m[number] = { ...(m[number] || {}), ...fields }; write(PATCH, m); },
      all() { const p = this.placed(); return [...p, ...demoOrders().map(apply).filter(d => !p.some(x => x.number === d.number))]; },
      find(number) { return this.all().find(o => o.number === number) || null; },
    };
  }

  function waText(o) {
    const lines = o.items.map(i => `${i.qty} x ${i.name}${i.options.length ? ' (' + i.options.join(', ') + ')' : ''}`).join('; ');
    return `Hi, I placed order ${o.number}: ${lines}. Total ${fmt(o.total)} (${METHODS[o.method].label}). Name: ${o.customer.name}.`;
  }

  const dateFmt = (iso, withTime = true) => {
    if (!iso) return '';
    const d = new Date(iso);
    const base = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' });
    return withTime ? base + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Karachi' }) : base;
  };

  root.LX = { CITIES, METHODS, RULES, STEPS, STATUS, PAYMENT, fmt, normPhone, validPhone, validEmail, cityFee, codAllowed, codAdvance, prepaidDiscount,
    totals, nextNumber, buildOrder, nextPage, switchMethod, timeline, validateReceipt, demoOrders, sample, lookup, safeStorage, store, waText, dateFmt };
})();
