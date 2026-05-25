import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.component.ts')) {
      const specPath = full.replace(/\.ts$/, '.spec.ts');
      if (fs.existsSync(specPath)) continue;
      const cls = fs.readFileSync(full, 'utf8').match(/export class (\w+)/)?.[1];
      if (!cls) continue;
      const base = path.basename(full);
      const content = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${cls} } from './${base}';

describe('${cls}', () => {
  let component: ${cls};
  let fixture: ComponentFixture<${cls}>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [${cls}] }).compileComponents();
    fixture = TestBed.createComponent(${cls});
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`;
      fs.writeFileSync(specPath, content);
      console.log('Created', specPath);
    }
  }
}

walk(path.join('src', 'app', 'components'));
