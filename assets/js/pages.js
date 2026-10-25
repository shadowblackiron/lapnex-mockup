/* Lapnex mockup: Alpine behaviour for checkout, result, tracking, login and account pages.
   Needs assets/js/orders.js (LX). In the Laravel build these become Blade pages + small Alpine components. */

const lxStore = () => LX.store(LX.safeStorage());
const lxWa = text => 'https://wa.me/923000000000?text=' + encodeURIComponent(text);

/* Copy-to-clipboard and receipt upload, shared by the payment-details pages */
function lxReceiptMixin() {
  return {
    copied: '', file: null, error: '', preview: '', dragging: false, sending: false,
    copy(text, key) {
      const done = () => { this.copied = key; setTimeout(() => { if (this.copied === key) this.copied = ''; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    },
    pick(files) {
      const f = files && files[0];
      if (!f) return;
      this.error = LX.validateReceipt(f) || '';
      if (this.error) { this.file = null; this.preview = ''; return; }
      this.file = f; this.preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : '';
    },
    drop(e) { this.dragging = false; this.pick(e.dataTransfer.files); },
    clearFile() { this.file = null; this.preview = ''; this.error = ''; },
    sendReceipt() {
      const err = LX.validateReceipt(this.file);
      if (err) { this.error = err || 'Please choose a file first.'; return; }
      this.o = { ...this.o, receipt: { name: this.file.name, size: this.file.size, at: new Date().toISOString() }, paymentStatus: 'pending_verification' };
      lxStore().patch(this.o.number, { receipt: this.o.receipt, paymentStatus: this.o.paymentStatus });
    },
    kb(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; },
  };
}

/* ---------- Checkout ---------- */
function checkoutPage() {
  return {
    f: { name: '', phone: '', email: '', delivery: 'ship', city: '', address: '', landmark: '', notes: '', video: false, account: false, terms: false },
    method: 'cod', simFail: false, errors: {}, tried: false, cityOpen: false, cityActive: -1, cart: null, summaryOpen: false,
    rules: LX.RULES, fmt: LX.fmt,

    init() {
      this.cart = Alpine.store('cart');
      this.fixMethod();
      this.$watch(() => this.t.subtotal, () => this.fixMethod());
    },
    fixMethod() { if (this.method === 'cod' && !LX.codAllowed(this.t.subtotal)) this.method = 'bank'; },

    get items() { return this.cart ? this.cart.items : []; },
    get t() { return LX.totals({ items: this.items, method: this.method, pickup: this.f.delivery === 'pickup', city: this.f.city }); },
    get count() { return this.items.reduce((n, i) => n + i.qty, 0); },
    get methods() {
      const sub = this.t.subtotal;
      return ['cod', 'bank', 'jazzcash', 'easypaisa', 'card'].map(id => ({
        id, label: LX.METHODS[id].label, short: LX.METHODS[id].short,
        disabled: id === 'cod' && !LX.codAllowed(sub),
        save: id === 'cod' ? 0 : LX.prepaidDiscount(id, sub),
        note: { cod: 'Pay cash when your laptop arrives', bank: 'Send money, then upload the receipt', jazzcash: 'Send to our JazzCash, then upload a screenshot',
                easypaisa: 'Send to our Easypaisa, then upload a screenshot', card: 'Visa, Mastercard or PayPak, paid securely online' }[id],
      }));
    },
    get cityList() { const q = this.f.city.trim().toLowerCase(); return LX.CITIES.filter(c => !q || c.name.toLowerCase().includes(q)); },
    get buttonLabel() {
      if (this.method === 'card') return 'Pay ' + LX.fmt(this.t.total) + ' securely';
      if (this.method === 'cod') return 'Place Order';
      return 'Place Order and get payment details';
    },

    pickCity(c) { this.f.city = c.name; this.cityOpen = false; this.cityActive = -1; if (this.tried) this.validate(); },
    cityKey(e) {
      const n = this.cityList.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); this.cityOpen = true; this.cityActive = (this.cityActive + 1) % n; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.cityActive = (this.cityActive - 1 + n) % n; }
      else if (e.key === 'Enter' && this.cityOpen && this.cityActive >= 0) { e.preventDefault(); this.pickCity(this.cityList[this.cityActive]); }
      else if (e.key === 'Escape') { this.cityOpen = false; }
    },

    validate() {
      const e = {}, f = this.f;
      if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
      if (!LX.validPhone(f.phone)) e.phone = 'Enter a valid mobile number, for example 03001234567.';
      if (!LX.validEmail(f.email)) e.email = 'That email address does not look right.';
      if (f.delivery === 'ship') {
        if (LX.cityFee(f.city) === null) e.city = 'Please choose your city from the list.';
        if (f.address.trim().length < 8) e.address = 'Please enter your full address: house, street and area.';
      }
      if (!f.terms) e.terms = 'Please accept the terms to place your order.';
      this.errors = e;
      return e;
    },
    submit() {
      if (this.items.length === 0) return;
      this.tried = true;
      const e = this.validate(), first = Object.keys(e)[0];
      if (first) {
        const id = { name: 'f-name', phone: 'f-phone', email: 'f-email', city: 'f-city', address: 'f-address', terms: 'f-terms' }[first];
        this.$nextTick(() => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus({ preventScroll: true }); } });
        return;
      }
      const storage = LX.safeStorage();
      const order = LX.buildOrder({ form: this.f, items: this.items, method: this.method, number: LX.nextNumber(storage), cardFailed: this.method === 'card' && this.simFail });
      LX.store(storage).saveLast(order);
      Alpine.store('cart').clear();
      location.href = LX.nextPage(order);
    },
  };
}

/* ---------- Result pages: COD / bank + wallets / card paid ---------- */
function thankPage(kind, methods) {
  return {
    ...lxReceiptMixin(), o: null, demo: false, fmt: LX.fmt, dateFmt: LX.dateFmt, METHODS: LX.METHODS, rules: LX.RULES,
    init() {
      let o = lxStore().last();
      if (!o || !methods.includes(o.method)) { o = LX.sample(methods[0]); this.demo = true; }
      this.o = o;
    },
    get pay() { return LX.RULES[this.o.method] ? Object.entries(LX.RULES[this.o.method]) : []; },
    get wa() { return lxWa(LX.waText(this.o)); },
    get tl() { return LX.timeline(this.o); },
    get cust() { return this.o.customer; },
    get firstName() { return this.o.customer.name.split(' ')[0]; },
    get paidAt() { return LX.dateFmt(this.o.events[0].at); },
    get txn() { return 'TXN' + this.o.number.replace(/\D/g, '').slice(-9); },
    get advanceBox() { return this.o.method === 'cod' && this.o.advance > 0; },
  };
}

/* ---------- Failed card payment ---------- */
function failedPage() {
  return {
    o: null, demo: false, fmt: LX.fmt, dateFmt: LX.dateFmt, METHODS: LX.METHODS,
    init() {
      let o = lxStore().last();
      if (!o || o.method !== 'card') { o = LX.sample('card'); o.paymentStatus = 'failed'; this.demo = true; }
      this.o = o;
    },
    get options() {
      return ['cod', 'bank', 'jazzcash', 'easypaisa'].map(m => {
        const t = LX.totals({ items: this.o.items, method: m, pickup: this.o.ship.pickup, city: this.o.ship.city });
        return { id: m, label: LX.METHODS[m].label, total: t.total, save: t.discount, advance: t.advance, disabled: m === 'cod' && !LX.codAllowed(t.subtotal) };
      });
    },
    retry() {
      const o = { ...this.o, paymentStatus: 'paid' };
      lxStore().saveLast(o); location.href = 'thankyou-paid.html';
    },
    choose(m) {
      const o = LX.switchMethod(this.o, m);
      lxStore().saveLast(o); location.href = LX.nextPage(o);
    },
    get wa() { return lxWa('Hi, my card payment for order ' + this.o.number + ' did not go through. Can you help?'); },
  };
}

/* ---------- Track order ---------- */
function trackPage() {
  return {
    number: '', phone: '', result: null, error: '', fmt: LX.fmt, dateFmt: LX.dateFmt, METHODS: LX.METHODS, STATUS: LX.STATUS, PAYMENT: LX.PAYMENT,
    init() {
      const q = new URLSearchParams(location.search);
      if (q.get('n')) this.number = q.get('n');
    },
    demoFill(n) { this.number = n; this.phone = '0300 1234567'; this.search(); },
    search() {
      this.result = null; this.error = '';
      if (!this.number.trim()) { this.error = 'Please enter your order number.'; return; }
      if (!LX.validPhone(this.phone)) { this.error = 'Please enter the mobile number you used at checkout.'; return; }
      const o = LX.lookup(lxStore().all(), this.number, this.phone);
      if (!o) { this.error = 'We could not find an order with those details. Please check the order number and the phone number you used at checkout.'; return; }
      this.result = o;
    },
    get tl() { return this.result ? LX.timeline(this.result) : []; },
    get wa() { return this.result ? lxWa('Hi, I have a question about order ' + this.result.number + '.') : '#'; },
  };
}

/* ---------- Login / register ---------- */
function authPage(kind) {
  return {
    kind, f: { name: '', phone: '', email: '', id: '', password: '', confirm: '' }, errors: {}, show: false,
    submit() {
      const e = {}, f = this.f;
      if (kind === 'register') {
        if (f.name.trim().length < 2) e.name = 'Please enter your name.';
        if (!LX.validPhone(f.phone)) e.phone = 'Enter a valid mobile number, for example 03001234567.';
        if (!LX.validEmail(f.email)) e.email = 'That email address does not look right.';
        if (f.password.length < 8) e.password = 'Use at least 8 characters.';
        if (f.confirm !== f.password) e.confirm = 'The two passwords do not match.';
      } else {
        const id = f.id.trim();
        if (!id || !(LX.validPhone(id) || LX.validEmail(id) && id.includes('@'))) e.id = 'Enter your mobile number or email address.';
        if (f.password.length < 6) e.password = 'Enter your password.';
      }
      this.errors = e;
      const first = Object.keys(e)[0];
      if (first) { this.$nextTick(() => { const el = document.getElementById('a-' + first); if (el) el.focus(); }); return; }
      try { LX.safeStorage().setItem('lapnex-user', JSON.stringify({ name: kind === 'register' ? f.name.trim() : 'Ahmed Khan' })); } catch (err) {}
      location.href = 'account-orders.html';
    },
  };
}

/* ---------- Account ---------- */
function accountUser() {
  try { return JSON.parse(LX.safeStorage().getItem('lapnex-user')) || { name: 'Ahmed Khan' }; } catch (e) { return { name: 'Ahmed Khan' }; }
}
function accountOrdersPage() {
  return {
    user: accountUser(), orders: [], fmt: LX.fmt, dateFmt: LX.dateFmt, METHODS: LX.METHODS, STATUS: LX.STATUS, PAYMENT: LX.PAYMENT,
    init() { this.orders = lxStore().all(); },
    count(o) { return o.items.reduce((n, i) => n + i.qty, 0); },
    placed(o) { return LX.dateFmt(o.events[0].at, false); },
    signOut() { try { LX.safeStorage().removeItem('lapnex-user'); } catch (e) {} location.href = 'home.html'; },
  };
}
function accountOrderPage() {
  return {
    ...lxReceiptMixin(), user: accountUser(), o: null, missing: false, fmt: LX.fmt, dateFmt: LX.dateFmt, METHODS: LX.METHODS, STATUS: LX.STATUS, PAYMENT: LX.PAYMENT, rules: LX.RULES,
    init() {
      const n = new URLSearchParams(location.search).get('n');
      const S = lxStore();
      this.o = (n && S.find(n)) || S.all()[0];
      this.missing = !!n && !S.find(n);
    },
    get tl() { return LX.timeline(this.o); },
    get pay() { return LX.RULES[this.o.method] ? Object.entries(LX.RULES[this.o.method]) : []; },
    get needsReceipt() { return ['bank', 'jazzcash', 'easypaisa'].includes(this.o.method) && this.o.paymentStatus === 'unpaid'; },
    get wa() { return lxWa('Hi, I have a question about order ' + this.o.number + '.'); },
    signOut() { try { LX.safeStorage().removeItem('lapnex-user'); } catch (e) {} location.href = 'home.html'; },
  };
}
