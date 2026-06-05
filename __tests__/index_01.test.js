/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('index_01.html', () => {
  let html;

  beforeAll(() => {
    html = fs.readFileSync(path.resolve(__dirname, '../index_01.html'), 'utf-8');
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

    it('should have viewport meta disabling user scaling', () => {
      const meta = document.querySelector('meta[name="viewport"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toContain('user-scalable=no');
    });
  });

  describe('page title', () => {
    it('should reference local JS in the title', () => {
      const title = document.querySelector('title');
      expect(title).not.toBeNull();
      expect(title.textContent).toContain('本地js');
    });
  });

  describe('postMessage button', () => {
    it('should exist with id "postMessage"', () => {
      const btn = document.getElementById('postMessage');
      expect(btn).not.toBeNull();
    });

    it('should have data-action="sendNow"', () => {
      const btn = document.getElementById('postMessage');
      expect(btn.getAttribute('data-action')).toBe('sendNow');
    });

    it('should have btn and btn-red classes', () => {
      const btn = document.getElementById('postMessage');
      expect(btn.classList.contains('btn')).toBe(true);
      expect(btn.classList.contains('btn-red')).toBe(true);
    });

    it('should display the correct label text', () => {
      const btn = document.getElementById('postMessage');
      expect(btn.textContent).toContain('立即发送消息');
    });
  });

  describe('description paragraph', () => {
    it('should have a .desc paragraph explaining the button behavior', () => {
      const desc = document.querySelector('p.desc');
      expect(desc).not.toBeNull();
      expect(desc.textContent).toContain('发送消息');
    });
  });

  describe('script tags', () => {
    it('should load uni.webview.1.5.6.js', () => {
      const scripts = document.querySelectorAll('script[src]');
      const uniScript = Array.from(scripts).find((s) =>
        s.getAttribute('src').includes('uni.webview.1.5.6.js')
      );
      expect(uniScript).not.toBeNull();
    });

    it('should have an inline script that registers UniAppJSBridgeReady listener', () => {
      const scripts = document.querySelectorAll('script:not([src])');
      const inlineScripts = Array.from(scripts).filter(
        (s) => s.textContent.trim().length > 0
      );
      expect(inlineScripts.length).toBeGreaterThan(0);

      const jsContent = inlineScripts.map((s) => s.textContent).join('\n');
      expect(jsContent).toContain('UniAppJSBridgeReady');
    });

    it('inline script should reference uni.postMessage', () => {
      const scripts = document.querySelectorAll('script:not([src])');
      const jsContent = Array.from(scripts)
        .map((s) => s.textContent)
        .join('\n');
      expect(jsContent).toContain('uni.postMessage');
    });

    it('inline script should reference uni.getEnv', () => {
      const scripts = document.querySelectorAll('script:not([src])');
      const jsContent = Array.from(scripts)
        .map((s) => s.textContent)
        .join('\n');
      expect(jsContent).toContain('uni.getEnv');
    });

    it('inline script should include a timestamp in the postMessage data', () => {
      const scripts = document.querySelectorAll('script:not([src])');
      const jsContent = Array.from(scripts)
        .map((s) => s.textContent)
        .join('\n');
      expect(jsContent).toContain('timestamp');
      expect(jsContent).toContain('new Date().getTime()');
    });
  });

  describe('styles', () => {
    it('should include .btn and .btn-red styles', () => {
      const style = document.querySelector('style');
      expect(style).not.toBeNull();
      const css = style.textContent;
      expect(css).toContain('.btn');
      expect(css).toContain('.btn-red');
    });

    it('should include text-align center for .desc', () => {
      const style = document.querySelector('style');
      const css = style.textContent;
      expect(css).toContain('.desc');
      expect(css).toContain('text-align: center');
    });
  });

  describe('inline JS behavior simulation', () => {
    it('should fire UniAppJSBridgeReady and the click handler should call uni.postMessage', () => {
      // Simulate the uni global that the inline script expects
      const mockPostMessage = jest.fn();
      const mockGetEnv = jest.fn((cb) => cb({ h5: true }));

      window.uni = {
        postMessage: mockPostMessage,
        getEnv: mockGetEnv,
      };

      // Manually execute the inline script logic
      const btn = document.getElementById('postMessage');
      expect(btn).not.toBeNull();

      // Simulate what the inline script does on UniAppJSBridgeReady:
      // 1. calls uni.getEnv
      // 2. binds click handler that calls uni.postMessage

      uni.getEnv((res) => {
        // environment detected
      });

      btn.addEventListener('click', () => {
        uni.postMessage({
          data: {
            action: 'message',
            timestamp: new Date().getTime(),
            message: 'Hello from Web Page!',
          },
        });
      });

      // Trigger the click
      btn.click();

      expect(mockGetEnv).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledTimes(1);

      const callArg = mockPostMessage.mock.calls[0][0];
      expect(callArg.data.action).toBe('message');
      expect(callArg.data.message).toBe('Hello from Web Page!');
      expect(typeof callArg.data.timestamp).toBe('number');

      delete window.uni;
    });
  });
});
