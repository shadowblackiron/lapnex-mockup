/* Lapnex mockup: text and behaviour for the content pages (policies, about, FAQ, contact, wishlist).
   ALL POLICY TEXT IS SAMPLE WORDING for design review. The client must replace it with the shop's real policies.
   In the Laravel build this text lives in the "pages" table and is edited from the admin panel. */
window.LXC = {
  nav: [
    ['Warranty', 'warranty.html'], ['Returns & Refunds', 'returns.html'], ['Delivery', 'delivery.html'], ['Privacy Policy', 'privacy.html'],
    ['Terms & Conditions', 'terms.html'], ['Condition Guide', 'condition-guide.html'], ['FAQs', 'faq.html'], ['About Us', 'about.html'], ['Contact Us', 'contact.html'],
  ],
  pages: {
    warranty: {
      title: 'Warranty Policy', updated: '25 October 2026',
      intro: 'Every laptop we sell is tested before it ships and comes with a checking warranty. This page explains what that covers and how to use it.',
      sections: [
        { h: 'How long is the warranty?', p: ['The warranty period is shown on each product page, for example "15 days checking warranty". It starts on the day your laptop is delivered or collected.'] },
        { h: 'What is covered', p: ['Faults that were already in the laptop or that appear through normal use during the warranty period, such as:'],
          list: ['Display problems (dead pixels, flickering, lines)', 'Keyboard, touchpad and port faults', 'Motherboard, RAM and storage faults', 'Battery that no longer holds the backup time stated on the listing', 'Charger that stops working'] },
        { h: 'What is not covered', list: ['Physical damage: drops, cracks, bent hinges', 'Liquid damage', 'Software problems, viruses and data loss', 'Repairs or opening of the laptop by anyone other than us', 'Normal cosmetic wear that matches the grade on the listing'] },
        { h: 'How to make a claim', p: ['Message us on WhatsApp with your order number and a short video showing the problem. We will tell you what to do next. If the laptop needs to come back to us, we will arrange the courier.'] },
        { h: 'What we do', p: ['After we inspect the laptop we will repair it or replace it with a laptop of equal or better specification. If neither is possible we will refund you according to our Returns and Refunds policy.'] },
      ],
    },
    returns: {
      title: 'Returns & Refunds', updated: '25 October 2026',
      intro: 'We want you to be happy with your laptop. If it is not what we described, here is how returns work.',
      sections: [
        { h: 'When you can return a laptop', p: ['You can ask for a return within 7 days of delivery if:'],
          list: ['The laptop does not match its listing (condition, grade or specifications)', 'It has a fault that appeared on delivery', 'It was damaged in transit'] },
        { h: 'Conditions', list: ['The laptop is in the same condition you received it, with its original charger and box', 'You have your order number', 'There is no new damage and the seals we applied are intact'] },
        { h: 'How to start a return', p: ['Message us on WhatsApp or use the contact form with your order number and photos or a video of the problem. We will confirm whether the return is approved and arrange collection.'] },
        { h: 'Refunds', p: ['Once we have checked the returned laptop, we refund the amount you paid to the same method you used, or by bank transfer. Refunds usually take 3 to 7 working days. Delivery charges are refunded when the return is our error.'] },
        { h: 'Changing your mind', p: ['Because most of our laptops are one of a kind, we cannot accept returns just because you changed your mind. If you are not sure about a laptop, ask for a video call before you order.'] },
      ],
    },
    delivery: {
      title: 'Delivery', updated: '25 October 2026',
      intro: 'We deliver all over Pakistan, or you can collect from our store in Lahore.',
      sections: [
        { h: 'How long it takes', p: ['We process orders within 1 to 2 working days after we confirm them. Delivery then takes 2 to 4 working days, depending on your city.'] },
        { h: 'Delivery charges', list: ['Free delivery on orders above Rs 50,000', 'Below that, charges depend on your city, from Rs 300 to Rs 700', 'Store pickup in Lahore is always free'], p: ['You see the exact charge at checkout, before you pay.'] },
        { h: 'Before we ship', p: ['Every laptop is tested and packed carefully. If you asked for a video call before dispatch, we will show you the actual laptop on WhatsApp video first.'] },
        { h: 'Tracking', p: ['When your order ships we send you the courier name and tracking number. You can also check the status any time on the Track order page with your order number and phone number.'] },
        { h: 'On delivery', p: ['Please check the laptop before you pay or sign. If something is wrong, tell the courier and message us right away.'] },
      ],
    },
    privacy: {
      title: 'Privacy Policy', updated: '25 October 2026',
      intro: 'We only collect what we need to deliver your order and look after you afterwards.',
      sections: [
        { h: 'What we collect', list: ['Your name, phone number and email', 'Your delivery address', 'Your order history and any messages you send us', 'Payment receipts you upload'], p: ['We never see or store your full card number. Card payments are handled by our payment partner.'] },
        { h: 'Why we use it', list: ['To confirm, prepare and deliver your order', 'To contact you about your order and warranty', 'To improve our website and service'] },
        { h: 'Who we share it with', p: ['Only with the people who help us serve you: couriers (to deliver), payment providers (to take payment) and our email provider. We do not sell your information.'] },
        { h: 'How long we keep it', p: ['We keep order records for as long as needed for warranty, accounting and legal reasons.'] },
        { h: 'Your choices', p: ['You can ask us to see, correct or delete your information by messaging us on WhatsApp or through the contact form.'] },
      ],
    },
    terms: {
      title: 'Terms & Conditions', updated: '25 October 2026',
      intro: 'By placing an order on lapnex.pk you agree to these terms.',
      sections: [
        { h: 'Orders and prices', p: ['All prices are in Pakistani rupees and include all taxes. An order is only confirmed after we contact you and, where needed, receive your payment. We may cancel an order if we cannot confirm it.'] },
        { h: 'Availability', p: ['Many of our laptops are single items. If a laptop is sold before we confirm your order, we will tell you and offer an alternative or a full refund.'] },
        { h: 'Payment', p: ['You can pay by Cash on Delivery, bank transfer, JazzCash, Easypaisa or card. Some high-value Cash on Delivery orders need a small advance. Advance-payment discounts apply only when the full payment is received.'] },
        { h: 'Delivery, warranty and returns', p: ['These are covered in our Delivery, Warranty and Returns policies, which form part of these terms.'] },
        { h: 'Our responsibility', p: ['We describe each laptop as accurately as we can, including its condition and grade. Our responsibility for any laptop is limited to the price you paid for it.'] },
        { h: 'Changes and law', p: ['We may update these terms from time to time. These terms are governed by the laws of Pakistan.'] },
      ],
    },
    about: {
      title: 'About Lapnex', updated: '',
      intro: 'Lapnex is a laptop shop in Lahore for people who want a reliable laptop at a fair price: new, open box, refurbished or carefully tested used.',
      sections: [
        { h: 'What we do', p: ['We buy, test and sell laptops from trusted brands such as Dell, HP, Lenovo and Apple. Every listing shows its condition and cosmetic grade, the full specifications and the real price, so you know exactly what you are getting.'] },
        { h: 'How we work', list: ['We test every laptop before it is listed', 'We tell you honestly about its condition', 'We offer a checking warranty on every laptop', 'We answer our WhatsApp quickly and show you the actual laptop on video if you ask'] },
        { h: 'Why buy used or refurbished?', p: ['A good business laptop that is a few years old often costs a fraction of a new one and is just as fast for study, office work and coding. Buying used also keeps good machines in use for longer.'] },
        { h: 'Visit us', p: ['Shop No. 00, Main Market, Lahore. Open Monday to Saturday, 11:00 AM to 8:00 PM. Closed on Sunday.'] },
      ],
    },
  },
  faq: [
    { g: 'Buying', items: [
      { q: 'What do New, Open Box, Refurbished and Used mean?', a: 'New laptops are sealed and unused. Open Box laptops are unused or barely used, with the box opened. Refurbished laptops are professionally restored and tested. Used laptops are pre-owned, tested and working, with a cosmetic grade (A+, A or B). Our Condition Guide explains each in detail.' },
      { q: 'Can I see the actual laptop before I pay?', a: 'Yes. Tick "Video call me before dispatch" at checkout and we will show you the actual laptop on a WhatsApp video call before it ships. You can also visit our store in Lahore.' },
      { q: 'Can I upgrade the RAM or storage?', a: 'On many laptops you can choose a RAM or storage upgrade on the product page. The price updates as you choose, and our team fits the upgrade before dispatch.' },
    ] },
    { g: 'Payment', items: [
      { q: 'Which payment methods do you accept?', a: 'Cash on Delivery, bank transfer, JazzCash, Easypaisa, and debit or credit cards (Visa, Mastercard, PayPak).' },
      { q: 'Is there a discount for paying in advance?', a: 'Yes. Paying by bank transfer, JazzCash, Easypaisa or card gives you a discount on your order, shown at checkout before you pay.' },
      { q: 'Why do some Cash on Delivery orders need an advance?', a: 'For higher-value orders we ask for a small advance to confirm that the order is genuine. You pay the rest on delivery.' },
      { q: 'I paid by bank transfer. What now?', a: 'Upload a screenshot of your receipt on the order confirmation page or in your account. We verify it and confirm your order, usually within a few working hours.' },
    ] },
    { g: 'Delivery', items: [
      { q: 'How long does delivery take?', a: 'Usually 2 to 4 working days after we confirm your order, all over Pakistan.' },
      { q: 'How much does delivery cost?', a: 'Delivery is free above Rs 50,000. Below that the charge depends on your city, and you see it at checkout before you pay.' },
      { q: 'Can I collect my order from the shop?', a: 'Yes. Choose store pickup at checkout. It is free, and we message you when your order is ready.' },
      { q: 'How do I track my order?', a: 'Open the Track order page and enter your order number and phone number. You do not need an account.' },
    ] },
    { g: 'Warranty and returns', items: [
      { q: 'Do your laptops come with a warranty?', a: 'Yes. Every laptop has a checking warranty, and the period is shown on its product page.' },
      { q: 'What if the laptop is not as described?', a: 'Message us within the return window with your order number and photos or a video. If the laptop does not match its listing we will arrange a return and refund.' },
    ] },
  ],
};

/* ---------- Policy / about pages ---------- */
function policyPage(slug) {
  return {
    slug, nav: LXC.nav, p: LXC.pages[slug],
    isCurrent(url) { return url === slug + '.html'; },
    init() { document.title = this.p.title + ' | Lapnex'; },
  };
}

/* ---------- FAQ page ---------- */
function faqPage() {
  return {
    nav: LXC.nav, groups: LXC.faq, open: 'Buying-0',
    toggle(k) { this.open = this.open === k ? null : k; },
    isCurrent(url) { return url === 'faq.html'; },
  };
}

/* ---------- Contact page ---------- */
function contactPage() {
  return {
    f: { name: '', phone: '', email: '', topic: 'laptop', message: '', website: '' }, errors: {}, sent: false,
    topics: [['laptop', 'A question about a laptop'], ['order', 'My order'], ['sell', 'Sell or trade in my laptop'], ['other', 'Something else']],
    hours: [['Monday – Saturday', '11:00 AM – 8:00 PM'], ['Sunday', 'Closed']],
    get openNow() {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
      const day = parts.find(x => x.type === 'weekday').value, hour = parseInt(parts.find(x => x.type === 'hour').value, 10) % 24;
      return day !== 'Sun' && hour >= 11 && hour < 20;
    },
    submit() {
      const e = {}, f = this.f;
      if (f.name.trim().length < 2) e.name = 'Please enter your name.';
      if (!LX.validPhone(f.phone)) e.phone = 'Enter a valid mobile number, for example 03001234567.';
      if (!LX.validEmail(f.email)) e.email = 'That email address does not look right.';
      if (f.message.trim().length < 10) e.message = 'Please write a few words so we can help.';
      this.errors = e;
      const first = Object.keys(e)[0];
      if (first) { this.$nextTick(() => { const el = document.getElementById('c-' + first); if (el) el.focus(); }); return; }
      this.sent = true;   // honeypot field (website) is ignored for people; the real site drops submissions that fill it
      this.$nextTick(() => { const el = document.getElementById('c-done'); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus(); } });
    },
    again() { this.sent = false; this.f = { name: '', phone: '', email: '', topic: 'laptop', message: '', website: '' }; this.errors = {}; },
  };
}

/* ---------- Wishlist (view-only demo) ---------- */
function wishlistPage() {
  const P = (name, cond, grade, price, old, stock, cpu, ram, ssd, scr) =>
    ({ name, cond, grade, price, old, stock, specs: [['cpu', cpu], ['ram', ram], ['ssd', ssd], ['screen', scr]] });
  return {
    items: [
      P('LENOVO LEGION 5 RYZEN 7 RTX 3060', 'New', null, 215000, 245000, 5, 'Ryzen 7', '16GB', '512GB', '15.6"'),
      P('APPLE MACBOOK AIR M1 13" 2020', 'Open Box', null, 165000, null, 2, 'Apple M1', '8GB', '256GB', '13.3"'),
      P('DELL LATITUDE 7490 i7 8TH', 'Used', 'A', 55000, null, 1, 'i7 8th', '16GB', '512GB', '14"'),
    ],
    off(p) { return Math.round((p.old - p.price) / p.old * 100); },
    add(p) { if (p.stock > 0) Alpine.store('cart').add({ name: p.name, cond: p.cond, grade: p.grade, price: p.price, old: p.old, stock: p.stock, options: [] }); },
    remove(p) { this.items = this.items.filter(i => i.name !== p.name); },
    addAll() { this.items.forEach(p => this.add(p)); },
  };
}
