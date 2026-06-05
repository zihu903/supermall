/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('docs/index.html', () => {
  let html;

  beforeAll(() => {
    html = fs.readFileSync(path.resolve(__dirname, '../docs/index.html'), 'utf-8');
  });

  beforeEach(() => {
    document.documentElement.innerHTML = html;
  });

  describe('page structure', () => {
    it('should have a title indicating no JS', () => {
      const title = document.querySelector('title');
      expect(title).not.toBeNull();
      expect(title.textContent).toContain('无js');
    });

    it('should have charset utf-8', () => {
      const meta = document.querySelector('meta[charset]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('charset')).toBe('utf-8');
    });
  });

  describe('navigation buttons', () => {
    const expectedActions = [
      'navigateTo',
      'redirectTo',
      'navigateBack',
      'reLaunch',
      'switchTab',
    ];

    it('should render all 5 navigation buttons', () => {
      const buttons = document.querySelectorAll('.btn-list .btn');
      expect(buttons.length).toBe(5);
    });

    expectedActions.forEach((action) => {
      it(`should have a button with data-action="${action}"`, () => {
        const btn = document.querySelector(`button[data-action="${action}"]`);
        expect(btn).not.toBeNull();
        expect(btn.textContent).toBe(action);
      });
    });
  });

  describe('no postMessage section', () => {
    it('should NOT have a postMessage button (no-JS variant)', () => {
      const btn = document.getElementById('postMessage');
      expect(btn).toBeNull();
    });

    it('should NOT have a .post-message-section', () => {
      const section = document.querySelector('.post-message-section');
      expect(section).toBeNull();
    });
  });

  describe('styles', () => {
    it('should include CSS for .btn, .btn-red, .btn-yellow, .desc', () => {
      const style = document.querySelector('style');
      expect(style).not.toBeNull();
      const css = style.textContent;
      expect(css).toContain('.btn');
      expect(css).toContain('.btn-red');
      expect(css).toContain('.btn-yellow');
      expect(css).toContain('.desc');
    });
  });
});
