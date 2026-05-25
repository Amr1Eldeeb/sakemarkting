import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'src', 'app');

const en = JSON.parse(
  fs.readFileSync(path.join(root, 'src', 'assets', 'i18n', 'en.json'), 'utf8')
);

function getKey(key) {
  const parts = key.split('.');
  let v = en;
  for (const p of parts) {
    v = v?.[p];
  }
  return typeof v === 'string' ? v : key;
}

function replaceTranslateInHtml(html) {
  return html
    .replace(/\{\{\s*'([^']+)'\s*\|\s*translate\s*\}\}/g, (_, k) => getKey(k))
    .replace(/\[placeholder\]="'([^']+)'\s*\|\s*translate"/g, (_, k) => `[placeholder]="${getKey(k).replace(/"/g, '&quot;')}"`)
    .replace(/\[class\.rtl\]="[^"]*"/g, '')
    .replace(/\s*\[class\.rtl\]="lang\.isRtl\(\)"/g, '')
    .replace(/<div class="([^"]*)" \[class\.rtl\]="lang\.isRtl\(\)">/g, '<motion-div class="$1">')
    .replace(/\[class\.rtl\]="lang\.isRtl\(\)"/g, '');
}

function flattenRtl(html) {
  return html
    .replace(/\s*\[class\.rtl\]="lang\.isRtl\(\)"/g, '')
    .replace(/ class="([^"]*)"\s*>/g, (m) => m);
}

function extractInlineComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const templateMatch = content.match(/template:\s*`([\s\S]*?)`\s*,/);
  const stylesMatch = content.match(/styles:\s*\[\s*`([\s\S]*?)`\s*\]/);
  return {
    template: templateMatch ? templateMatch[1] : null,
    styles: stylesMatch ? stylesMatch[1] : null,
    usesTemplateUrl: content.includes('templateUrl:'),
  };
}

function cleanTs(content, componentDir) {
  const relServices = path.relative(componentDir, path.join(src, 'services')).replace(/\\/g, '/');
  const relDirectives = path.relative(componentDir, path.join(src, 'directives')).replace(/\\/g, '/');

  let c = content
    .replace(/import\s*\{[^}]*TranslateModule[^}]*\}\s*from\s*'@ngx-translate\/core';\n?/g, '')
    .replace(/import\s*\{[^}]*TranslateService[^}]*\}\s*from\s*'@ngx-translate\/core';\n?/g, '')
    .replace(/import\s*\{[^}]*LanguageService[^}]*\}\s*from\s*'[^']*language\.service';\n?/g, '')
    .replace(/,\s*TranslateModule/g, '')
    .replace(/TranslateModule,\s*/g, '')
    .replace(/\s*lang\s*=\s*inject\(LanguageService\);\n?/g, '')
    .replace(/\s*private\s+translate\s*=\s*inject\(TranslateService\);\n?/g, '')
    .replace(/\s*private\s+langService\s*=\s*inject\(LanguageService\);\n?/g, '')
    .replace(/this\.langService\.init\(\);\n?/g, '')
    .replace(/this\.translate\.get\('([^']+)'\)\.subscribe\((\w+)\s*=>\s*this\.toast\.(success|error)\(\2\)\)/g, (_, key, _v, method) => {
      const msg = getKey(key).replace(/'/g, "\\'");
      return `this.toast.${method}('${msg}')`;
    })
    .replace(/this\.translate\.get\('([^']+)'\)\.subscribe\(m\s*=>\s*this\.errorMsg\.set\(m\)\)/g, (_, key) => {
      return `this.errorMsg.set('${getKey(key).replace(/'/g, "\\'")}')`;
    })
    .replace(/this\.translate\.get\('([^']+)'\)\.subscribe\(m\s*=>\s*this\.toast\.success\(m\)\)/g, (_, key) => {
      return `this.toast.success('${getKey(key).replace(/'/g, "\\'")}')`;
    })
    .replace(/\[class\.rtl\]="lang\.isRtl\(\)"/g, '');

  // Fix import paths
  c = c.replace(/from\s*'\.\.\/\.\.\/core\/services\//g, `from '${relServices}/`);
  c = c.replace(/from\s*'\.\.\/\.\.\/\.\.\/core\/services\//g, `from '${relServices}/`);
  c = c.replace(/from\s*'\.\.\/\.\.\/core\/models\/models'/g, `from '${relServices}/models'`);
  c = c.replace(/from\s*'\.\.\/\.\.\/\.\.\/core\/models\/models'/g, `from '${relServices}/models'`);
  c = c.replace(/from\s*'\.\.\/\.\.\/shared\/directives\/reveal\.directive'/g, `from '${relDirectives}/reveal.directive'`);
  c = c.replace(/from\s*'\.\.\/\.\.\/\.\.\/shared\/directives\/reveal\.directive'/g, `from '${relDirectives}/reveal.directive'`);

  // Convert inline template/styles to external files
  if (c.includes('template: `')) {
    const templateMatch = c.match(/template:\s*`([\s\S]*?)`\s*,/);
    const stylesMatch = c.match(/styles:\s*\[\s*`([\s\S]*?)`\s*\]/);
    if (templateMatch) {
      c = c.replace(/template:\s*`[\s\S]*?`\s*,/, "templateUrl: './" + path.basename(componentDir) + ".component.html',\n  ");
    }
    if (stylesMatch) {
      c = c.replace(/styles:\s*\[\s*`[\s\S]*?`\s*\]/, "styleUrl: './" + path.basename(componentDir) + ".component.scss'");
    } else if (!c.includes('styleUrl:') && !c.includes('styleUrls:')) {
      // template only inline
    }
  }

  // Mission values keys -> title/desc
  c = c.replace(/titleKey:\s*'MISSION\.VALUE_(\d)_TITLE',\s*descKey:\s*'MISSION\.VALUE_\d_DESC'/g, (m, n) => {
    const titles = ['Innovation', 'Excellence', 'Integrity', 'Results'];
    const descs = [
      'Constantly pushing boundaries with creative and technological innovations.',
      'Delivering exceptional quality in everything we do, every time.',
      'Building trust through transparency, honesty, and ethical practices.',
      'Focused on measurable outcomes that drive real business growth.',
    ];
    const i = parseInt(n, 10) - 1;
    return `title: '${titles[i]}', desc: '${descs[i]}'`;
  });

  // Home counter labels
  c = c.replace(/label:\s*'COUNTERS\.(\w+)'/g, (_, k) => {
    const map = { PROJECTS: 'Projects Completed', CLIENTS: 'Happy Clients', TEAM: 'Team Members', YEARS: 'Years Experience' };
    return `label: '${map[k] || k}'`;
  });

  // FAQ items
  c = c.replace(/\{\s*q:\s*'FAQ\.Q(\d)',\s*a:\s*'FAQ\.A\1',\s*open:\s*false\s*\}/g, (_, n) => {
    const q = getKey(`FAQ.Q${n}`);
    const a = getKey(`FAQ.A${n}`);
    return `{ q: '${q.replace(/'/g, "\\'")}', a: '${a.replace(/'/g, "\\'")}', open: false }`;
  });

  // Testimonials
  c = c.replace(/nameKey:\s*'TESTIMONIALS\.T(\d)_NAME',\s*companyKey:\s*'TESTIMONIALS\.T\1_COMPANY',\s*textKey:\s*'TESTIMONIALS\.T\1_TEXT'/g, (_, n) => {
    return `name: '${getKey(`TESTIMONIALS.T${n}_NAME`).replace(/'/g, "\\'")}', company: '${getKey(`TESTIMONIALS.T${n}_COMPANY`).replace(/'/g, "\\'")}', text: '${getKey(`TESTIMONIALS.T${n}_TEXT`).replace(/'/g, "\\'")}'`;
  });

  // Process steps
  c = c.replace(/titleKey:\s*'PROCESS\.STEP_(\d)_TITLE',\s*descKey:\s*'PROCESS\.STEP_\d_DESC'/g, (_, n) => {
    return `title: '${getKey(`PROCESS.STEP_${n}_TITLE`).replace(/'/g, "\\'")}', desc: '${getKey(`PROCESS.STEP_${n}_DESC`).replace(/'/g, "\\'")}'`;
  });

  // Why us
  c = c.replace(/titleKey:\s*'WHY_US\.REASON_(\d)_TITLE',\s*descKey:\s*'WHY_US\.REASON_\d_DESC'/g, (_, n) => {
    return `title: '${getKey(`WHY_US.REASON_${n}_TITLE`).replace(/'/g, "\\'")}', desc: '${getKey(`WHY_US.REASON_${n}_DESC`).replace(/'/g, "\\'")}'`;
  });

  // Contact info values
  c = c.replace(/value:\s*'CONTACT\.(\w+)'/g, (_, k) => {
    const map = { ADDRESS: 'CONTACT.ADDRESS', PHONE: 'CONTACT.PHONE', EMAIL: 'CONTACT.EMAIL', HOURS: 'CONTACT.HOURS' };
    return `value: '${getKey(map[k] || `CONTACT.${k}`).replace(/'/g, "\\'")}'`;
  });

  return c;
}

const migrations = [
  { from: 'shared/navbar/navbar.component.ts', to: 'components/navbar/navbar.component' },
  { from: 'shared/footer/footer.component.ts', to: 'components/footer/footer.component' },
  { from: 'shared/loader/loader.component.ts', to: 'components/loader/loader.component' },
  { from: 'shared/toast-container/toast-container.component.ts', to: 'components/toast-container/toast-container.component' },
  { from: 'features/home/home.component.ts', to: 'components/home/home.component', copyHtmlScss: true },
  { from: 'features/about/about.component.ts', to: 'components/about/about.component' },
  { from: 'features/services/services.component.ts', to: 'components/services/services.component' },
  { from: 'features/contact/contact.component.ts', to: 'components/contact/contact.component' },
  { from: 'features/team/team.component.ts', to: 'components/team/team.component' },
  { from: 'features/mission/mission.component.ts', to: 'components/mission/mission.component' },
  { from: 'features/vision/vision.component.ts', to: 'components/vision/vision.component' },
  { from: 'features/not-found/not-found.component.ts', to: 'components/not-found/not-found.component' },
  { from: 'features/admin/login/login.component.ts', to: 'components/admin/login/login.component' },
  { from: 'features/admin/dashboard/dashboard.component.ts', to: 'components/admin/dashboard/dashboard.component' },
  { from: 'features/admin/admin-services/admin-services.component.ts', to: 'components/admin/admin-services/admin-services.component' },
  { from: 'features/admin/admin-employees/admin-employees.component.ts', to: 'components/admin/admin-employees/admin-employees.component' },
];

// Copy services
const servicesDir = path.join(src, 'services');
fs.mkdirSync(servicesDir, { recursive: true });
fs.copyFileSync(path.join(src, 'core/models/models.ts'), path.join(servicesDir, 'models.ts'));
for (const f of ['api.service.ts', 'auth.service.ts', 'toast.service.ts']) {
  let content = fs.readFileSync(path.join(src, 'core/services', f), 'utf8');
  content = content.replace(/from '\.\.\/models\/models'/g, "from './models'");
  content = content.replace(/from '\.\.\/\.\.\/\.\.\/environments\/environment'/g, "from '../../environments/environment'");
  fs.writeFileSync(path.join(servicesDir, f), content);
}

// Copy directive
const directivesDir = path.join(src, 'directives');
fs.mkdirSync(directivesDir, { recursive: true });
fs.copyFileSync(
  path.join(src, 'shared/directives/reveal.directive.ts'),
  path.join(directivesDir, 'reveal.directive.ts')
);

// Copy guard & interceptor to app root
let guard = fs.readFileSync(path.join(src, 'core/guards/auth.guard.ts'), 'utf8');
guard = guard.replace(/from '\.\.\/services\/auth\.service'/g, "from './services/auth.service'");
fs.writeFileSync(path.join(src, 'auth.guard.ts'), guard);

let interceptor = fs.readFileSync(path.join(src, 'core/interceptors/auth.interceptor.ts'), 'utf8');
interceptor = interceptor.replace(/from '\.\.\/services\/auth\.service'/g, "from './services/auth.service'");
fs.writeFileSync(path.join(src, 'auth.interceptor.ts'), interceptor);

for (const { from, to, copyHtmlScss } of migrations) {
  const fromPath = path.join(src, from);
  const baseName = path.basename(to);
  const dir = path.join(src, path.dirname(to));
  fs.mkdirSync(dir, { recursive: true });

  let ts = fs.readFileSync(fromPath, 'utf8');
  const { template, styles, usesTemplateUrl } = extractInlineComponent(fromPath);

  if (copyHtmlScss) {
    const fromDir = path.dirname(fromPath);
    if (fs.existsSync(path.join(fromDir, 'home.component.html'))) {
      let html = fs.readFileSync(path.join(fromDir, 'home.component.html'), 'utf8');
      html = flattenRtl(replaceTranslateInHtml(html));
      html = html.replace(/counter\.label \| translate/g, 'counter.label');
      html = html.replace(/step\.titleKey \| translate/g, 'step.title');
      html = html.replace(/step\.descKey \| translate/g, 'step.desc');
      html = html.replace(/item\.titleKey \| translate/g, 'item.title');
      html = html.replace(/item\.descKey \| translate/g, 'item.desc');
      html = html.replace(/t\.textKey \| translate/g, 't.text');
      html = html.replace(/t\.nameKey \| translate/g, 't.name');
      html = html.replace(/t\.companyKey \| translate/g, 't.company');
      html = html.replace(/faq\.q \| translate/g, 'faq.q');
      html = html.replace(/faq\.a \| translate/g, 'faq.a');
      html = html.replace(/\{\{ a \| translate \}\}/g, (m, i, s) => {
        // achievement chips - handled separately
        return m;
      });
      html = html.replace(/\*ngFor="let a of \['ABOUT\.ACHIEVEMENT_1','ABOUT\.ACHIEVEMENT_2','ABOUT\.ACHIEVEMENT_3'\]"/g,
        `*ngFor="let a of achievements"`);
      fs.writeFileSync(path.join(dir, `${baseName}.html`), html);
    }
    if (fs.existsSync(path.join(fromDir, 'home.component.scss'))) {
      fs.copyFileSync(path.join(fromDir, 'home.component.scss'), path.join(dir, `${baseName}.scss`));
    }
    ts = ts.replace(/templateUrl: '\.\/home\.component\.html'/g, `templateUrl: './${baseName}.html'`);
    ts = ts.replace(/styleUrls: \['\.\/home\.component\.scss'\]/g, `styleUrl: './${baseName}.scss'`);
  } else if (template) {
    let html = flattenRtl(replaceTranslateInHtml(template));
    html = html.replace(/v\.titleKey \| translate/g, 'v.title');
    html = html.replace(/v\.descKey \| translate/g, 'v.desc');
    html = html.replace(/item\.value \| translate/g, 'item.value');
    fs.writeFileSync(path.join(dir, `${baseName}.html`), html);
    if (styles) {
      fs.writeFileSync(path.join(dir, `${baseName}.scss`), styles);
    }
  }

  ts = cleanTs(ts, dir);
  if (!ts.includes('templateUrl:') && template) {
    ts = ts.replace(/template:\s*`[\s\S]*?`\s*,/, `templateUrl: './${baseName}.html',\n  `);
  }
  if (!ts.includes('styleUrl:') && styles) {
    ts = ts.replace(/styles:\s*\[\s*`[\s\S]*?`\s*\]/, `styleUrl: './${baseName}.scss'`);
  }

  fs.writeFileSync(path.join(dir, `${baseName}.ts`), ts);

  // spec stub
  const className = baseName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') ;
  const selector = baseName.replace('.component', '');
  fs.writeFileSync(
    path.join(dir, `${baseName}.spec.ts`),
    `import { ComponentFixture, TestBed } from '@angular/core/testing';\nimport { ${className.charAt(0).toUpperCase() + className.slice(1).replace('.component', 'Component')} } from './${baseName}';\n\ndescribe('${className}', () => {\n  let component: any;\n  let fixture: ComponentFixture<any>;\n\n  beforeEach(async () => {\n    await TestBed.configureTestingModule({\n      imports: [${className.charAt(0).toUpperCase() + className.slice(1).replace('.component', 'Component')}]\n    }).compileComponents();\n    fixture = TestBed.createComponent(${className.charAt(0).toUpperCase() + className.slice(1).replace('.component', 'Component')});\n    component = fixture.componentInstance;\n    fixture.detectChanges();\n  });\n\n  it('should create', () => {\n    expect(component).toBeTruthy();\n  });\n});\n`
  );
}

console.log('Migration script completed. Manual fixes may be needed.');
