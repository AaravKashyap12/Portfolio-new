import { expect, test } from '@playwright/test';

test('hero navigation links and interactive controls work', async ({ page, context }) => {
  test.setTimeout(90000);
  const errors = [];
  const scrollTargetIsVisible = async (selector) => {
    await expect.poll(() =>
      page.locator(selector).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      })
    ).toBe(true);
  };

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !text.includes('Failed to load resource: the server responded with a status of 401')) {
      errors.push(text);
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Aarav Kashyap Singh/);
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /favicon\.ico/);
  await expect(page.locator('h1')).toHaveAttribute('aria-label', 'Aarav Kashyap Singh');
  await expect(page.locator('body')).toHaveCSS('font-family', /Geist/);
  await expect(page.locator('h1')).toHaveCSS('font-family', /Inter/);
  await expect(page.getByLabel('Send Oneko home')).toBeVisible();
  await page.getByLabel('Send Oneko home').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('I build AI systems that solve human problems.')).toBeVisible();
  await expect(page.getByText('I think harder about why than how.')).toBeVisible();
  if (page.viewportSize().width > 1100) {
    await expect(page.getByText('LATEST THINKING')).toBeVisible();
  } else {
    await expect(page.locator('.hero-tweet-wrap')).toBeHidden();
  }

  await expect(page.locator('#gl-canvas')).toBeVisible();
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('#projects')).toBeVisible();
  await expect(page.locator('#skills')).toBeVisible();
  await expect(page.locator('#services')).toBeVisible();
  await expect(page.locator('#contact')).toBeVisible();
  await expect(page.locator('.services-shell')).toBeVisible();
  await expect(page.locator('.service-card')).toHaveCount(4);
  await expect(page.getByText('AI-Powered Backends')).toBeVisible();
  await expect(page.getByText('Custom AI Integrations')).toBeVisible();

  await expect(page.locator('.proj-title', { hasText: 'ClearFlow' })).toBeVisible();
  await expect(page.locator('.proj-title', { hasText: 'CryptoQuant' })).toBeVisible();
  await expect(page.locator('.proj-title', { hasText: 'TalentMatch' })).toBeVisible();

  await page.locator('.proj-card').first().click({ force: true });
  await expect(page.locator('.pm-title')).toHaveText('ClearFlow');
  await expect(page.locator('.pm-diagram img')).toBeVisible();
  await expect(page.locator('.pm-diagram img')).toHaveAttribute('src', /clearflow-architecture\.png/);
  await expect(page.getByRole('button', { name: 'View full ClearFlow architecture' })).toBeVisible();
  await page.getByRole('button', { name: 'View full ClearFlow architecture' }).click();
  await expect(page.locator('.architecture-lightbox img')).toBeVisible();
  await expect(page.locator('.architecture-lightbox-head h4')).toHaveText('ClearFlow');
  const lightboxFrameBounds = await page.locator('.architecture-lightbox-frame').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: Math.round(rect.bottom),
      right: Math.round(rect.right),
    };
  });
  expect(lightboxFrameBounds.bottom).toBeLessThanOrEqual(page.viewportSize().height);
  expect(lightboxFrameBounds.right).toBeLessThanOrEqual(page.viewportSize().width);
  await page.getByRole('button', { name: 'Close architecture viewer' }).click();
  await page.locator('.proj-modal-close').click();

  await expect(page.locator('#about .fact').first().locator('.fact-n')).toHaveText('4+');
  await expect(page.locator('#about .fact').first().locator('.fact-n')).toHaveCSS('font-family', /Geist Mono/);
  await expect(page.locator('#about .about-facts')).toHaveClass(/facts-panel/);
  await expect(page.locator('#about .fact')).toHaveCount(4);
  await expect(page.locator('#about .fact-copy strong').first()).toHaveText('Projects shipped');

  const aboutCopy = await page.locator('#about .about-body').innerText();
  expect(aboutCopy).not.toContain('—');
  expect(aboutCopy).toContain("I'm Aarav, a 21 year old AI engineer from India.");

  const internalLinks = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href'))
  );
  expect(internalLinks).toEqual(expect.arrayContaining(['#hero', '#about', '#projects', '#skills', '#contact']));
  const brokenHashLinks = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href !== '#' && !document.querySelector(href))
  );
  expect(brokenHashLinks).toEqual([]);

  await page.locator('.nav-brand').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);

  const viewportWidth = page.viewportSize().width;
  const navTargets = [
    ['Experience', '#about'],
    ['Work', '#projects'],
    ['Skills', '#skills'],
    ['Contact', '#contact'],
  ];

  if (viewportWidth > 900) {
    for (const [name, target] of navTargets) {
      await page.locator('.nav-links').getByRole('link', { name }).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await scrollTargetIsVisible(target);
    }
  } else {
    await expect(page.locator('.nav-links')).toBeHidden();
  }

  await page.goto('/');
  await expect(page.locator('.nav-cta')).toHaveAttribute('href', 'https://cal.com/aaravkashyap/meetings');
  await expect(page.locator('.nav-cta')).toHaveAttribute('target', '_blank');
  await expect(page.locator('#contact .contact-display')).toContainText('Work');
  await expect(page.locator('#contact .contact-display')).toContainText('Play');
  await expect(page.locator('#contact .contact-action')).toHaveCount(4);
  await expect(page.locator('#contact .contact-graph-panel')).toBeVisible();
  const contactActionLinks = page.locator('#contact .contact-actions-grid a');
  await expect(contactActionLinks.nth(0)).toHaveAttribute('href', 'https://cal.com/aaravkashyap/meetings');
  await expect(contactActionLinks.nth(1)).toHaveAttribute('href', 'mailto:aaravkashyap1203@gmail.com');
  await expect(contactActionLinks.nth(2)).toHaveAttribute('href', 'https://docs.google.com/document/d/1R5pZ2Qn8mP4_xdHolHgX2RIQP4B6ovrvKUYdlvndoOU/edit?usp=sharing');
  await expect(contactActionLinks.nth(3)).toHaveAttribute('href', 'https://github.com/AaravKashyap12');
  await expect(contactActionLinks.nth(0)).toHaveAttribute('target', '_blank');
  await expect(contactActionLinks.nth(1)).toHaveAttribute('target', '_blank');
  await expect(contactActionLinks.nth(2)).toHaveAttribute('target', '_blank');
  await expect(contactActionLinks.nth(3)).toHaveAttribute('target', '_blank');

  await page.goto('/');
  const heroBook = page.locator('.hero-ctas').getByRole('link', { name: 'Book a Call', exact: true });
  await expect(heroBook).toHaveAttribute('href', 'https://cal.com/aaravkashyap/meetings');
  await expect(heroBook).toHaveAttribute('target', '_blank');

  await page.goto('/');
  await page.getByLabel('Toggle theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.projects-display')).not.toHaveCSS('color', 'rgb(244, 240, 232)');
  await expect(page.locator('.contact-chapter')).not.toHaveCSS('background-color', 'rgb(4, 4, 4)');
  if (page.viewportSize().width > 900) {
    const serviceTool = page.locator('.service-card').first().locator('.service-tool-row span').first();
    const serviceToolBefore = await serviceTool.evaluate((element) => getComputedStyle(element).backgroundColor);
    await serviceTool.hover();
    const serviceToolAfter = await serviceTool.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(serviceToolAfter).not.toBe(serviceToolBefore);
  }
  await page.getByLabel('Toggle theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.evaluate(() => window.scrollTo(0, 0));

  await expect(heroBook).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await heroBook.focus();
  await expect(heroBook).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  if (page.viewportSize().width > 900) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await heroBook.hover({ force: true });
    await expect(heroBook).toHaveCSS('background-color', 'rgb(238, 234, 227)');
    await expect(heroBook).toHaveCSS('color', 'rgb(8, 8, 8)');
  }

  const heroLinks = {
    Resume: 'https://docs.google.com/document/d/1R5pZ2Qn8mP4_xdHolHgX2RIQP4B6ovrvKUYdlvndoOU/edit?usp=sharing',
    GitHub: 'https://github.com/AaravKashyap12',
    LinkedIn: 'https://linkedin.com/in/aarav-singh-3a6351289',
    Twitter: 'https://x.com/byaarav',
  };

  for (const [label, href] of Object.entries(heroLinks)) {
    await expect(page.locator('.hero-ctas').getByRole('link', { name: label })).toHaveAttribute('href', href);
    await expect(page.locator('.hero-ctas').getByRole('link', { name: label })).toHaveAttribute('target', '_blank');
  }

  const githubIcon = page.locator('.hero-ctas').getByRole('link', { name: 'GitHub' });
  await githubIcon.focus();
  await expect(githubIcon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  if (page.viewportSize().width > 900) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await githubIcon.hover({ force: true });
    await expect(githubIcon).toHaveCSS('background-color', 'rgb(238, 234, 227)');
    await expect(githubIcon).toHaveCSS('color', 'rgb(8, 8, 8)');
  }

  const firstHeroSignal = page.locator('.hero-stats .hstat').first();
  await expect(firstHeroSignal.locator('.hstat-txt')).toContainText('views');
  await expect(page.locator('.hero-stats .hstat').nth(1).locator('.hstat-txt')).toContainText('live now');
  await firstHeroSignal.focus();
  await expect(firstHeroSignal.locator('.hstat-tooltip')).toBeVisible();
  await expect(firstHeroSignal.locator('.hstat-tooltip')).toContainText('Total hero visits tracked');

  await expect(page.locator('.custom-tweet')).toHaveAttribute(
    'href',
    'https://x.com/byaarav/status/2057191317420274070'
  );
  await expect(page.locator('.custom-tweet')).toHaveAttribute('target', '_blank');

  if (page.viewportSize().width > 1100) {
    const popupPromise = context.waitForEvent('page');
    await page.locator('.custom-tweet').click();
    const tweetPage = await popupPromise;
    await expect.poll(() => tweetPage.url()).toContain('x.com/byaarav/status/2057191317420274070');
    await tweetPage.close();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobileBrandLeft = await page.locator('.nav-brand').evaluate((element) =>
    Math.round(element.getBoundingClientRect().left)
  );
  expect(mobileBrandLeft).toBeLessThanOrEqual(16);
  const mobileNavRightGap = await page.locator('.nav-right').evaluate((element) =>
    Math.round(document.documentElement.clientWidth - element.getBoundingClientRect().right)
  );
  expect(mobileNavRightGap).toBeLessThanOrEqual(10);
  const mobileFactSpacing = await page.locator('#about .fact').nth(1).evaluate((element) => {
    const number = element.querySelector('.fact-n');
    const copy = element.querySelector('.fact-copy');
    if (!number || !copy) return null;
    const numberRect = number.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    return Math.round(copyRect.left - numberRect.right);
  });
  expect(mobileFactSpacing).toBeGreaterThanOrEqual(8);
  await expect(page.locator('.hero-ctas')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.locator('.hero-tweet-wrap')).toBeHidden();

  const contactFooterLinks = page.locator('.contact-links a');
  await expect(contactFooterLinks.nth(0)).toHaveAttribute('target', '_blank');
  await expect(contactFooterLinks.nth(1)).toHaveAttribute('target', '_blank');
  await expect(contactFooterLinks.nth(2)).toHaveAttribute('target', '_blank');
  await expect(contactFooterLinks.nth(3)).toHaveAttribute('target', '_blank');

  const mobileHeroControls = await page.locator('.hero-ctas').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { bottom: rect.bottom, top: rect.top };
  });
  expect(mobileHeroControls.bottom).toBeLessThanOrEqual(844);

  await page.goto('/#projects');
  await page.locator('.proj-card').first().click({ force: true });
  await expect(page.locator('.pm-title')).toHaveText('ClearFlow');
  await page.waitForTimeout(900);
  const mobileModalBounds = await page.locator('.proj-modal').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
    };
  });
  expect(mobileModalBounds.left).toBeGreaterThanOrEqual(0);
  expect(mobileModalBounds.right).toBeLessThanOrEqual(mobileModalBounds.viewportWidth);
  expect(mobileModalBounds.top).toBeGreaterThanOrEqual(0);
  expect(mobileModalBounds.bottom).toBeLessThanOrEqual(mobileModalBounds.viewportHeight);

  const mobileModalLayout = await page.locator('.pm-body').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      columns: getComputedStyle(element).gridTemplateColumns,
      right: Math.round(rect.right),
      width: Math.round(rect.width),
    };
  });
  expect(mobileModalLayout.columns).not.toContain('0px');
  expect(mobileModalLayout.right).toBeLessThanOrEqual(mobileModalLayout.viewportWidth);
  expect(mobileModalLayout.width).toBeGreaterThan(300);

  const mobileDiagramBounds = await page.locator('.pm-diagram').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
    };
  });
  expect(mobileDiagramBounds.left).toBeGreaterThanOrEqual(0);
  expect(mobileDiagramBounds.right).toBeLessThanOrEqual(mobileDiagramBounds.viewportWidth);
  expect(mobileDiagramBounds.width).toBeLessThanOrEqual(mobileDiagramBounds.viewportWidth);

  expect(errors).toEqual([]);
});
