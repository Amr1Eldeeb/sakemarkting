import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src', 'app');
const en = JSON.parse(fs.readFileSync(path.join(root, 'src/assets/i18n/en.json'), 'utf8'));

function t(key) {
  return key.split('.').reduce((o, p) => o?.[p], en) ?? key;
}

function translateHtml(html) {
  return html
    .replace(/\{\{\s*'([^']+)'\s*\|\s*translate\s*\}\}/g, (_, k) => t(k))
    .replace(/\[placeholder\]="'([^']+)'\s*\|\s*translate"/g, (_, k) => `[placeholder]="${t(k).replace(/"/g, '&quot;')}"`)
    .replace(/\s*\[class\.rtl\]="lang\.isRtl\(\)"/g, '')
    .replace(/<div class="home-page" >/g, '<motion-div class="home-page">')
    .replace(/v\.titleKey \| translate/g, 'v.title')
    .replace(/v\.descKey \| translate/g, 'v.desc')
    .replace(/item\.value \| translate/g, 'item.value')
    .replace(/counter\.label \| translate/g, 'counter.label')
    .replace(/step\.titleKey \| translate/g, 'step.title')
    .replace(/step\.descKey \| translate/g, 'step.desc')
    .replace(/item\.titleKey \| translate/g, 'item.title')
    .replace(/item\.descKey \| translate/g, 'item.desc')
    .replace(/t\.textKey \| translate/g, 't.text')
    .replace(/t\.nameKey \| translate/g, 't.name')
    .replace(/t\.companyKey \| translate/g, 't.company')
    .replace(/faq\.q \| translate/g, 'faq.q')
    .replace(/faq\.a \| translate/g, 'faq.a')
    .replace(
      /\*ngFor="let a of \['ABOUT\.ACHIEVEMENT_1','ABOUT\.ACHIEVEMENT_2','ABOUT\.ACHIEVEMENT_3'\]"/g,
      '*ngFor="let a of achievements"'
    );
}

function extractInline(filePath) {
  const c = fs.readFileSync(filePath, 'utf8');
  const tm = c.match(/template:\s*`([\s\S]*?)`\s*,/);
  const sm = c.match(/styles:\s*\[\s*`([\s\S]*?)`\s*\]/);
  return { ts: c, template: tm?.[1], styles: sm?.[1] };
}

function cleanTs(content, relToServices, relToDirectives, baseName) {
  return content
    .replace(/import\s*\{[^}]*TranslateModule[^}]*\}\s*from\s*'@ngx-translate\/core';\r?\n?/g, '')
    .replace(/import\s*\{[^}]*TranslateService[^}]*\}\s*from\s*'@ngx-translate\/core';\r?\n?/g, '')
    .replace(/import\s*\{[^}]*LanguageService[^}]*\}\s*from\s*'[^']*';\r?\n?/g, '')
    .replace(/,\s*TranslateModule/g, '')
    .replace(/TranslateModule,\s*/g, '')
    .replace(/\s*lang\s*=\s*inject\(LanguageService\);\r?\n?/g, '')
    .replace(/\s*private\s+translate\s*=\s*inject\(TranslateService\);\r?\n?/g, '')
    .replace(/this\.translate\.get\('([^']+)'\)\.subscribe\(\w+\s*=>\s*this\.toast\.(success|error)\(\w+\)\)/g, (_, k, m) =>
      `this.toast.${m}('${t(k).replace(/'/g, "\\'")}')`
    )
    .replace(/this\.translate\.get\('([^']+)'\)\.subscribe\(m\s*=>\s*this\.errorMsg\.set\(m\)\)/g, (_, k) =>
      `this.errorMsg.set('${t(k).replace(/'/g, "\\'")}')`
    )
    .replace(/from\s*'(\.\.\/)+core\/services\//g, `from '${relToServices}/`)
    .replace(/from\s*'(\.\.\/)+core\/models\/models'/g, `from '${relToServices}/models'`)
    .replace(/from\s*'(\.\.\/)+shared\/directives\/reveal\.directive'/g, `from '${relToDirectives}/reveal.directive'`)
    .replace(/template:\s*`[\s\S]*?`\s*,/, `templateUrl: './${baseName}.html',\n  `)
    .replace(/styles:\s*\[\s*`[\s\S]*?`\s*\]/, `styleUrl: './${baseName}.scss'`)
    .replace(/styleUrls:\s*\['\.\/home\.component\.scss'\]/, `styleUrl: './${baseName}.scss'`)
    .replace(/templateUrl:\s*'\.\/home\.component\.html'/, `templateUrl: './${baseName}.html'`)
    .replace(/titleKey:\s*'MISSION\.VALUE_1_TITLE',\s*descKey:\s*'MISSION\.VALUE_1_DESC'/g,
      "title: 'Innovation', desc: 'Constantly pushing boundaries with creative and technological innovations.'")
    .replace(/titleKey:\s*'MISSION\.VALUE_2_TITLE',\s*descKey:\s*'MISSION\.VALUE_2_DESC'/g,
      "title: 'Excellence', desc: 'Delivering exceptional quality in everything we do, every time.'")
    .replace(/titleKey:\s*'MISSION\.VALUE_3_TITLE',\s*descKey:\s*'MISSION\.VALUE_3_DESC'/g,
      "title: 'Integrity', desc: 'Building trust through transparency, honesty, and ethical practices.'")
    .replace(/titleKey:\s*'MISSION\.VALUE_4_TITLE',\s*descKey:\s*'MISSION\.VALUE_4_DESC'/g,
      "title: 'Results', desc: 'Focused on measurable outcomes that drive real business growth.'")
    .replace(/label:\s*'COUNTERS\.PROJECTS'/g, "label: 'Projects Completed'")
    .replace(/label:\s*'COUNTERS\.CLIENTS'/g, "label: 'Happy Clients'")
    .replace(/label:\s*'COUNTERS\.TEAM'/g, "label: 'Team Members'")
    .replace(/label:\s*'COUNTERS\.YEARS'/g, "label: 'Years Experience'")
    .replace(/\{ q: 'FAQ\.Q1', a: 'FAQ\.A1', open: false \}/g,
      `{ q: '${t('FAQ.Q1').replace(/'/g, "\\'")}', a: '${t('FAQ.A1').replace(/'/g, "\\'")}', open: false }`)
    .replace(/\{ q: 'FAQ\.Q2', a: 'FAQ\.A2', open: false \}/g,
      `{ q: '${t('FAQ.Q2').replace(/'/g, "\\'")}', a: '${t('FAQ.A2').replace(/'/g, "\\'")}', open: false }`)
    .replace(/\{ q: 'FAQ\.Q3', a: 'FAQ\.A3', open: false \}/g,
      `{ q: '${t('FAQ.Q3').replace(/'/g, "\\'")}', a: '${t('FAQ.A3').replace(/'/g, "\\'")}', open: false }`)
    .replace(/\{ q: 'FAQ\.Q4', a: 'FAQ\.A4', open: false \}/g,
      `{ q: '${t('FAQ.Q4').replace(/'/g, "\\'")}', a: '${t('FAQ.A4').replace(/'/g, "\\'")}', open: false }`)
    .replace(/\{ q: 'FAQ\.Q5', a: 'FAQ\.A5', open: false \}/g,
      `{ q: '${t('FAQ.Q5').replace(/'/g, "\\'")}', a: '${t('FAQ.A5').replace(/'/g, "\\'")}', open: false }`)
    .replace(/\{ q: 'FAQ\.Q6', a: 'FAQ\.A6', open: false \}/g,
      `{ q: '${t('FAQ.Q6').replace(/'/g, "\\'")}', a: '${t('FAQ.A6').replace(/'/g, "\\'")}', open: false }`)
    .replace(/nameKey: 'TESTIMONIALS\.T1_NAME', companyKey: 'TESTIMONIALS\.T1_COMPANY', textKey: 'TESTIMONIALS\.T1_TEXT'/g,
      `name: '${t('TESTIMONIALS.T1_NAME')}', company: '${t('TESTIMONIALS.T1_COMPANY')}', text: '${t('TESTIMONIALS.T1_TEXT').replace(/'/g, "\\'")}'`)
    .replace(/nameKey: 'TESTIMONIALS\.T2_NAME', companyKey: 'TESTIMONIALS\.T2_COMPANY', textKey: 'TESTIMONIALS\.T2_TEXT'/g,
      `name: '${t('TESTIMONIALS.T2_NAME')}', company: '${t('TESTIMONIALS.T2_COMPANY')}', text: '${t('TESTIMONIALS.T2_TEXT').replace(/'/g, "\\'")}'`)
    .replace(/nameKey: 'TESTIMONIALS\.T3_NAME', companyKey: 'TESTIMONIALS\.T3_COMPANY', textKey: 'TESTIMONIALS\.T3_TEXT'/g,
      `name: '${t('TESTIMONIALS.T3_NAME')}', company: '${t('TESTIMONIALS.T3_COMPANY')}', text: '${t('TESTIMONIALS.T3_TEXT').replace(/'/g, "\\'")}'`)
    .replace(/nameKey: 'TESTIMONIALS\.T4_NAME', companyKey: 'TESTIMONIALS\.T4_COMPANY', textKey: 'TESTIMONIALS\.T4_TEXT'/g,
      `name: '${t('TESTIMONIALS.T4_NAME')}', company: '${t('TESTIMONIALS.T4_COMPANY')}', text: '${t('TESTIMONIALS.T4_TEXT').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'PROCESS\.STEP_1_TITLE', descKey: 'PROCESS\.STEP_1_DESC'/g,
      `title: '${t('PROCESS.STEP_1_TITLE')}', desc: '${t('PROCESS.STEP_1_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'PROCESS\.STEP_2_TITLE', descKey: 'PROCESS\.STEP_2_DESC'/g,
      `title: '${t('PROCESS.STEP_2_TITLE')}', desc: '${t('PROCESS.STEP_2_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'PROCESS\.STEP_3_TITLE', descKey: 'PROCESS\.STEP_3_DESC'/g,
      `title: '${t('PROCESS.STEP_3_TITLE')}', desc: '${t('PROCESS.STEP_3_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'PROCESS\.STEP_4_TITLE', descKey: 'PROCESS\.STEP_4_DESC'/g,
      `title: '${t('PROCESS.STEP_4_TITLE')}', desc: '${t('PROCESS.STEP_4_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'PROCESS\.STEP_5_TITLE', descKey: 'PROCESS\.STEP_5_DESC'/g,
      `title: '${t('PROCESS.STEP_5_TITLE')}', desc: '${t('PROCESS.STEP_5_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'WHY_US\.REASON_1_TITLE', descKey: 'WHY_US\.REASON_1_DESC'/g,
      `title: '${t('WHY_US.REASON_1_TITLE')}', desc: '${t('WHY_US.REASON_1_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'WHY_US\.REASON_2_TITLE', descKey: 'WHY_US\.REASON_2_DESC'/g,
      `title: '${t('WHY_US.REASON_2_TITLE')}', desc: '${t('WHY_US.REASON_2_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'WHY_US\.REASON_3_TITLE', descKey: 'WHY_US\.REASON_3_DESC'/g,
      `title: '${t('WHY_US.REASON_3_TITLE')}', desc: '${t('WHY_US.REASON_3_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'WHY_US\.REASON_4_TITLE', descKey: 'WHY_US\.REASON_4_DESC'/g,
      `title: '${t('WHY_US.REASON_4_TITLE')}', desc: '${t('WHY_US.REASON_4_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'WHY_US\.REASON_5_TITLE', descKey: 'WHY_US\.REASON_5_DESC'/g,
      `title: '${t('WHY_US.REASON_5_TITLE')}', desc: '${t('WHY_US.REASON_5_DESC').replace(/'/g, "\\'")}'`)
    .replace(/titleKey: 'WHY_US\.REASON_6_TITLE', descKey: 'WHY_US\.REASON_6_DESC'/g,
      `title: '${t('WHY_US.REASON_6_TITLE')}', desc: '${t('WHY_US.REASON_6_DESC').replace(/'/g, "\\'")}'`)
    .replace(/value: 'CONTACT\.ADDRESS'/g, `value: '${t('CONTACT.ADDRESS')}'`)
    .replace(/value: 'CONTACT\.PHONE'/g, `value: '${t('CONTACT.PHONE')}'`)
    .replace(/value: 'CONTACT\.EMAIL'/g, `value: '${t('CONTACT.EMAIL')}'`)
    .replace(/value: 'CONTACT\.HOURS'/g, `value: '${t('CONTACT.HOURS')}'`);
}

const migrations = [
  ['shared/navbar/navbar.component.ts', 'components/navbar/navbar.component'],
  ['shared/footer/footer.component.ts', 'components/footer/footer.component'],
  ['shared/loader/loader.component.ts', 'components/loader/loader.component'],
  ['shared/toast-container/toast-container.component.ts', 'components/toast-container/toast-container.component'],
  ['features/home/home.component.ts', 'components/home/home.component'],
  ['features/about/about.component.ts', 'components/about/about.component'],
  ['features/services/services.component.ts', 'components/services/services.component'],
  ['features/contact/contact.component.ts', 'components/contact/contact.component'],
  ['features/team/team.component.ts', 'components/team/team.component'],
  ['features/mission/mission.component.ts', 'components/mission/mission.component'],
  ['features/vision/vision.component.ts', 'components/vision/vision.component'],
  ['features/not-found/not-found.component.ts', 'components/not-found/not-found.component'],
  ['features/admin/login/login.component.ts', 'components/admin/login/login.component'],
  ['features/admin/dashboard/dashboard.component.ts', 'components/admin/dashboard/dashboard.component'],
  ['features/admin/admin-services/admin-services.component.ts', 'components/admin/admin-services/admin-services.component'],
  ['features/admin/admin-employees/admin-employees.component.ts', 'components/admin/admin-employees/admin-employees.component'],
];

// services
const svcDir = path.join(src, 'services');
fs.mkdirSync(svcDir, { recursive: true });
fs.copyFileSync(path.join(src, 'core/models/models.ts'), path.join(svcDir, 'models.ts'));
for (const f of ['api.service.ts', 'auth.service.ts', 'toast.service.ts']) {
  let c = fs.readFileSync(path.join(src, 'core/services', f), 'utf8');
  c = c.replace(/from '\.\.\/models\/models'/g, "from './models'");
  c = c.replace(/from '\.\.\/\.\.\/\.\.\/environments\/environment'/g, "from '../../environments/environment'");
  fs.writeFileSync(path.join(svcDir, f), c);
}

// directive
const dirDir = path.join(src, 'directives');
fs.mkdirSync(dirDir, { recursive: true });
fs.copyFileSync(path.join(src, 'shared/directives/reveal.directive.ts'), path.join(dirDir, 'reveal.directive.ts'));

// guard / interceptor
let guard = fs.readFileSync(path.join(src, 'core/guards/auth.guard.ts'), 'utf8');
guard = guard.replace(/from '\.\.\/services\/auth\.service'/g, "from './services/auth.service'");
fs.writeFileSync(path.join(src, 'auth.guard.ts'), guard);

let interceptor = fs.readFileSync(path.join(src, 'core/interceptors/auth.interceptor.ts'), 'utf8');
interceptor = interceptor.replace(/from '\.\.\/services\/auth\.service'/g, "from './services/auth.service'");
fs.writeFileSync(path.join(src, 'auth.interceptor.ts'), interceptor);

for (const [from, to] of migrations) {
  const fromPath = path.join(src, from);
  const dir = path.join(src, path.dirname(to));
  const base = path.basename(to);
  fs.mkdirSync(dir, { recursive: true });

  const { ts, template, styles } = extractInline(fromPath);
  const relSvc = path.relative(dir, path.join(src, 'services')).replace(/\\/g, '/');
  const relDir = path.relative(dir, path.join(src, 'directives')).replace(/\\/g, '/');

  if (from.includes('home/home')) {
    let html = fs.readFileSync(path.join(path.dirname(fromPath), 'home.component.html'), 'utf8');
    html = translateHtml(html);
    fs.writeFileSync(path.join(dir, `${base}.html`), html);
    fs.copyFileSync(path.join(path.dirname(fromPath), 'home.component.scss'), path.join(dir, `${base}.scss`));
  } else if (template) {
    fs.writeFileSync(path.join(dir, `${base}.html`), translateHtml(template));
    if (styles) fs.writeFileSync(path.join(dir, `${base}.scss`), styles);
  }

  let out = cleanTs(ts, relSvc, relDir, base);
  fs.writeFileSync(path.join(dir, `${base}.ts`), out);
}

// App component from app.ts
let appTs = fs.readFileSync(path.join(src, 'app.ts'), 'utf8');
appTs = appTs
  .replace(/import\s*\{[^}]*TranslateModule[^}]*\}\s*from[^;]+;\r?\n?/g, '')
  .replace(/import\s*\{[^}]*LanguageService[^}]*\}\s*from[^;]+;\r?\n?/g, '')
  .replace(/from '\.\/core\/services\//g, "from './services/")
  .replace(/from '\.\/shared\//g, "from './components/")
  .replace(/,\s*TranslateModule/g, '')
  .replace(/TranslateModule,\s*/g, '')
  .replace(/this\.langService\.init\(\);\r?\n\s*/g, '')
  .replace(/template:\s*`[\s\S]*?`\s*,/, "templateUrl: './app.component.html',\n  ")
  .replace(/styles:\s*\[\s*`[\s\S]*?`\s*\]/, "styleUrl: './app.component.scss'");

const appTemplate = `    <app-loader *ngIf="showLoader()" (loadingDone)="onLoadingDone()"></app-loader>

    <motion-div class="app-wrapper" [class.loaded]="!showLoader()">
      <div class="cursor-dot" #cursorDot></div>
      <motion-div class="cursor-ring" #cursorRing></motion-div>

      <app-navbar></app-navbar>

      <main class="page-transition-enter">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <a href="https://wa.me/201000000000" target="_blank" class="whatsapp-float" title="Chat on WhatsApp">
        <i class="bi bi-whatsapp"></i>
      </a>

      <button class="scroll-top-btn" [class.visible]="showScrollTop()" (click)="scrollToTop()" title="Back to top">
        <i class="bi bi-arrow-up"></i>
      </button>

      <app-toast-container></app-toast-container>
    </motion-div>`;

// fix app template - use div not motion-div
const appHtml = appTemplate.replace(/motion-div/g, 'motion-div').replace(/motion-div/g, 'div');
fs.writeFileSync(path.join(src, 'app.component.html'), appHtml.replace(/motion-div/g, 'motion-div').replace(/<motion-div/g, '<motion-div').replace(/<\/motion-div>/g, '</motion-div>'));

// Actually use div
const appHtmlFixed = `    <app-loader *ngIf="showLoader()" (loadingDone)="onLoadingDone()"></app-loader>

    <div class="app-wrapper" [class.loaded]="!showLoader()">
      <motion-div class="cursor-dot" #cursorDot></motion-div>
      <motion-div class="cursor-ring" #cursorRing></motion-div>

      <app-navbar></app-navbar>

      <main class="page-transition-enter">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <a href="https://wa.me/201000000000" target="_blank" class="whatsapp-float" title="Chat on WhatsApp">
        <i class="bi bi-whatsapp"></i>
      </a>

      <button class="scroll-top-btn" [class.visible]="showScrollTop()" (click)="scrollToTop()" title="Back to top">
        <i class="bi bi-arrow-up"></i>
      </button>

      <app-toast-container></app-toast-container>
    </div>`.replace(/motion-div/g, 'div');

fs.writeFileSync(path.join(src, 'app.component.html'), appHtmlFixed);
fs.writeFileSync(path.join(src, 'app.component.scss'), `.app-wrapper {
  opacity: 0;
  transition: opacity 0.5s ease;
  &.loaded { opacity: 1; }
}
main { min-height: 60vh; }
`);

appTs = appTs.replace(/export class AppComponent/, 'export class AppComponent');
appTs = appTs.replace(/ToastService[^;]*;\r?\n/, '');
fs.writeFileSync(path.join(src, 'app.component.ts'), appTs);

// routes
const routes = `import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent), title: 'Sake Marketing Solutions - Premium Digital Agency' },
  { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent), title: 'About Us - Sake Marketing Solutions' },
  { path: 'mission', loadComponent: () => import('./components/mission/mission.component').then(m => m.MissionComponent), title: 'Our Mission - Sake Marketing Solutions' },
  { path: 'vision', loadComponent: () => import('./components/vision/vision.component').then(m => m.VisionComponent), title: 'Our Vision - Sake Marketing Solutions' },
  { path: 'services', loadComponent: () => import('./components/services/services.component').then(m => m.ServicesComponent), title: 'Services - Sake Marketing Solutions' },
  { path: 'team', loadComponent: () => import('./components/team/team.component').then(m => m.TeamComponent), title: 'Our Team - Sake Marketing Solutions' },
  { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent), title: 'Contact Us - Sake Marketing Solutions' },
  { path: 'admin/login', loadComponent: () => import('./components/admin/login/login.component').then(m => m.LoginComponent), title: 'Admin Login - Sake Marketing Solutions' },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Sake Marketing Solutions',
    children: [
      { path: '', redirectTo: 'services', pathMatch: 'full' },
      { path: 'services', loadComponent: () => import('./components/admin/admin-services/admin-services.component').then(m => m.AdminServicesComponent) },
      { path: 'employees', loadComponent: () => import('./components/admin/admin-employees/admin-employees.component').then(m => m.AdminEmployeesComponent) }
    ]
  },
  { path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent), title: '404 - Page Not Found' }
];
`;
fs.writeFileSync(path.join(src, 'app.routes.ts'), routes);

const appConfig = `import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAnimations()
  ]
};
`;
fs.writeFileSync(path.join(src, 'app.config.ts'), appConfig);

fs.writeFileSync(path.join(root, 'src/main.ts'), `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
`);

// home achievements + remove rtl from html
const homeTsPath = path.join(src, 'components/home/home.component.ts');
let homeTs = fs.readFileSync(homeTsPath, 'utf8');
if (!homeTs.includes('achievements =')) {
  homeTs = homeTs.replace(
    'particles: any[] = [];',
    `achievements = ['${t('ABOUT.ACHIEVEMENT_1')}', '${t('ABOUT.ACHIEVEMENT_2')}', '${t('ABOUT.ACHIEVEMENT_3')}'];
  particles: any[] = [];`
  );
}
fs.writeFileSync(homeTsPath, homeTs);

let homeHtml = fs.readFileSync(path.join(src, 'components/home/home.component.html'), 'utf8');
homeHtml = homeHtml.replace(/<div class="home-page" >/g, '<div class="home-page">');
fs.writeFileSync(path.join(src, 'components/home/home.component.html'), homeHtml);

// navbar: remove lang switcher from html
let navHtml = fs.readFileSync(path.join(src, 'components/navbar/navbar.component.html'), 'utf8');
navHtml = navHtml.replace(/<!-- Language Switcher -->[\s\S]*?<\/button>\s*/g, '');
navHtml = navHtml.replace(/About Us[\s\S]*?dropdown-menu-custom/, 'Company <i class="bi bi-chevron-down dropdown-arrow"></i>\n            </a>\n            <div class="dropdown-menu-custom');
// fix duplicate about in dropdown - read and fix manually later

// dashboard remove lang
let dashHtml = fs.readFileSync(path.join(src, 'components/admin/dashboard/dashboard.component.html'), 'utf8');
dashHtml = dashHtml.replace(/<button class="lang-switcher"[\s\S]*?<\/button>\s*/g, '');
fs.writeFileSync(path.join(src, 'components/admin/dashboard/dashboard.component.html'), dashHtml);

let dashTs = fs.readFileSync(path.join(src, 'components/admin/dashboard/dashboard.component.ts'), 'utf8');
dashTs = dashTs.replace(/\s*lang\s*=\s*inject\(LanguageService\);\r?\n?/g, '');
fs.writeFileSync(path.join(src, 'components/admin/dashboard/dashboard.component.ts'), dashTs);

console.log('Done');
