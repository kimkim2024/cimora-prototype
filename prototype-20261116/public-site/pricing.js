(() => {
  document.addEventListener('click', event => {
    const selected = event.target.closest('[data-price-cycle]');
    if (!selected) return;
    const yearly = selected.dataset.priceCycle === 'yearly';
    for (const button of document.querySelectorAll('[data-price-cycle]')) {
      const active = button === selected;
      button.setAttribute('aria-pressed', String(active));
      button.className = 'button '+(active ? 'primary' : 'secondary');
    }
    for (const amount of document.querySelectorAll('[data-price-monthly]')) {
      const price = Number(yearly ? amount.dataset.priceYearly : amount.dataset.priceMonthly);
      amount.textContent = '$'+price+'/月';
      amount.closest('article').querySelector('[data-price-total]').textContent = price ? yearly ? '$'+price*12+'/年，按年计费' : '按月计费' : '免费体验';
    }
    for (const link of document.querySelectorAll('[data-plan-link]')) {
      const url = new URL(link.href);
      url.hash = url.hash.replace(/cycle=(monthly|yearly)/, 'cycle='+selected.dataset.priceCycle);
      link.href = url.href;
    }
  });
})();
