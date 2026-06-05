/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('index.html', () => {
  let html;

  beforeAll(() => {
    html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
  });

  beforeEach(() => {
    document.documentElement.innerHTML = html;
  });

  describe('meta tags', () => {
    it('should have charset utf-8', () => {
      const meta = document.querySelector('meta[charset]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('charset')).toBe('utf-8');
    });

    it('should have viewport meta with correct settings', () => {
      const meta = document.querySelector('meta[name="viewport"]');
      expect(meta).not.toBeNull();
      const content = meta.getAttribute('content');
      expect(content).toContain('width=device-width');
      expect(content).toContain('user-scalable=no');
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

    it('should render all 5 navigation buttons plus 1 postMessage button', () => {
      const buttons = document.querySelectorAll('.btn-list .btn');
      expect(buttons.length).toBe(6);
    });

    expectedActions.forEach((action) => {
      it(`should have a button with data-action="${action}"`, () => {
        const btn = document.querySelector(`button[data-action="${action}"]`);
        expect(btn).not.toBeNull();
        expect(btn.textContent).toBe(action);
        expect(btn.type).toBe('button');
      });
    });

    it('all buttons should have the .btn class', () => {
      const buttons = document.querySelectorAll('button[data-action]');
      buttons.forEach((btn) => {
        expect(btn.classList.contains('btn')).toBe(true);
      });
    });
  });

  describe('postMessage section', () => {
    it('should have a post-message-section that is initially hidden', () => {
      const section = document.querySelector('.post-message-section');
      expect(section).not.toBeNull();
    });

    it('should contain a postMessage button with btn-red class', () => {
      const btn = document.getElementById('postMessage');
      expect(btn).not.toBeNull();
      expect(btn.classList.contains('btn')).toBe(true);
      expect(btn.classList.contains('btn-red')).toBe(true);
    });
  });

  describe('description text', () => {
    it('should have a description paragraph with .desc class', () => {
      const desc = document.querySelector('p.desc');
      expect(desc).not.toBeNull();
      expect(desc.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('styles', () => {
    it('should include embedded CSS for .btn, .btn-red, .btn-yellow, .desc', () => {
      const style = document.querySelector('style');
      expect(style).not.toBeNull();
      const css = style.textContent;
      expect(css).toContain('.btn');
      expect(css).toContain('.btn-red');
      expect(css).toContain('.btn-yellow');
      expect(css).toContain('.desc');
    });

    it('should hide .post-message-section via visibility', () => {
      const style = document.querySelector('style');
      const css = style.textContent;
      expect(css).toContain('.post-message-section');
      expect(css).toContain('visibility: hidden');
    });
  });
});
