/**
 * @jest-environment jsdom
 */

describe('uni.webview.1.5.6', () => {
  let uni;

  beforeEach(() => {
    jest.resetModules();
    // Clear all platform globals
    delete window.__dcloud_weex_postMessage;
    delete window.__dcloud_weex_;
    delete window.__uniapp_x_postMessage;
    delete window.__uniapp_x_;
    delete window.plus;
    delete window.wx;
    delete window.qq;
    delete window.my;
    delete window.swan;
    delete window.tt;
    delete window.qa;
    delete window.ks;
    delete window.jd;
    delete window.xhs;
    delete window.UniAppJSBridge;

    // Set a default user agent (plain browser / h5)
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
      configurable: true,
    });
  });

  function loadModule() {
    return require('../uni.webview.1.5.6.js');
  }

  // ---- Exported API shape ----

  describe('module export', () => {
    it('should export an object with navigation methods', () => {
      uni = loadModule();
      expect(uni).toBeDefined();
      expect(typeof uni.navigateTo).toBe('function');
      expect(typeof uni.navigateBack).toBe('function');
      expect(typeof uni.switchTab).toBe('function');
      expect(typeof uni.reLaunch).toBe('function');
      expect(typeof uni.redirectTo).toBe('function');
    });

    it('should export getEnv and postMessage', () => {
      uni = loadModule();
      expect(typeof uni.getEnv).toBe('function');
      expect(typeof uni.postMessage).toBe('function');
    });

    it('should expose a webView property', () => {
      uni = loadModule();
      expect(uni.webView).toBeDefined();
    });
  });

  // ---- getEnv detection ----

  describe('getEnv', () => {
    it('should return { h5: true } in a plain browser', () => {
      uni = loadModule();
      const cb = jest.fn();
      uni.getEnv(cb);
      expect(cb).toHaveBeenCalledWith({ h5: true });
    });

    it('should return { plus: true } when window.plus exists', () => {
      window.plus = {};
      uni = loadModule();
      const cb = jest.fn();
      uni.getEnv(cb);
      expect(cb).toHaveBeenCalledWith({ plus: true });
    });

    it('should return { nvue: true } when dcloud_weex bridge exists', () => {
      window.__dcloud_weex_postMessage = jest.fn();
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 uni-app Html5Plus',
        configurable: true,
      });
      uni = loadModule();
      const cb = jest.fn();
      uni.getEnv(cb);
      expect(cb).toHaveBeenCalledWith({ nvue: true });
    });

    it('should return { uvue: true } when uniapp_x bridge exists', () => {
      window.__uniapp_x_postMessage = jest.fn();
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 uni-app Html5Plus',
        configurable: true,
      });
      uni = loadModule();
      const cb = jest.fn();
      uni.getEnv(cb);
      expect(cb).toHaveBeenCalledWith({ uvue: true });
    });
  });

  // ---- Navigation functions (h5 / iframe fallback path) ----

  describe('navigation (h5 fallback via parent.postMessage)', () => {
    let postMessageSpy;

    beforeEach(() => {
      postMessageSpy = jest.fn();
      // In jsdom window === window.parent, so spy on it directly
      window.postMessage = postMessageSpy;
    });

    it('navigateTo should post a message with encoded url', () => {
      uni = loadModule();
      uni.navigateTo({ url: '/pages/index/index' });

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.type).toBe('WEB_INVOKE_APPSERVICE');
      expect(arg.data.name).toBe('navigateTo');
      expect(arg.data.arg.url).toBe(encodeURI('/pages/index/index'));
    });

    it('redirectTo should post a message with encoded url', () => {
      uni = loadModule();
      uni.redirectTo({ url: '/pages/detail/detail' });

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.name).toBe('redirectTo');
      expect(arg.data.arg.url).toBe(encodeURI('/pages/detail/detail'));
    });

    it('switchTab should post a message with encoded url', () => {
      uni = loadModule();
      uni.switchTab({ url: '/pages/tab/tab' });

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.name).toBe('switchTab');
      expect(arg.data.arg.url).toBe(encodeURI('/pages/tab/tab'));
    });

    it('reLaunch should post a message with encoded url', () => {
      uni = loadModule();
      uni.reLaunch({ url: '/pages/home/home' });

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.name).toBe('reLaunch');
      expect(arg.data.arg.url).toBe(encodeURI('/pages/home/home'));
    });

    it('navigateBack defaults delta to 1', () => {
      uni = loadModule();
      uni.navigateBack({});

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.name).toBe('navigateBack');
      expect(arg.data.arg.delta).toBe(1);
    });

    it('navigateBack accepts a custom delta', () => {
      uni = loadModule();
      uni.navigateBack({ delta: 3 });

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.arg.delta).toBe(3);
    });

    it('postMessage should forward data payload', () => {
      uni = loadModule();
      uni.postMessage({ data: { key: 'value' } });

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.name).toBe('postMessage');
      expect(arg.data.arg).toEqual({ key: 'value' });
    });

    it('postMessage defaults to empty object when no data provided', () => {
      uni = loadModule();
      uni.postMessage({});

      const arg = postMessageSpy.mock.calls[0][0];
      expect(arg.data.arg).toEqual({});
    });
  });

  // ---- UniApp X bridge path ----

  describe('uniapp_x bridge', () => {
    it('should call __uniapp_x_postMessage for postMessage', () => {
      const mockPost = jest.fn();
      window.__uniapp_x_postMessage = mockPost;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 uni-app Html5Plus',
        configurable: true,
      });

      uni = loadModule();
      uni.postMessage({ data: { hello: 'world' } });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost.mock.calls[0][0].data).toEqual({ hello: 'world' });
    });

    it('should call __uniapp_x_postMessageToService for navigation', () => {
      const mockService = jest.fn();
      window.__uniapp_x_postMessage = jest.fn();
      window.__uniapp_x_postMessageToService = mockService;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 uni-app Html5Plus',
        configurable: true,
      });

      uni = loadModule();
      uni.navigateTo({ url: '/test' });

      expect(mockService).toHaveBeenCalledTimes(1);
      const msg = mockService.mock.calls[0][0];
      expect(msg.type).toBe('WEB_INVOKE_APPSERVICE');
      expect(msg.args.data.name).toBe('navigateTo');
    });
  });

  // ---- Dcloud Weex bridge path ----

  describe('dcloud_weex bridge', () => {
    it('should call __dcloud_weex_postMessage for postMessage', () => {
      const mockPost = jest.fn();
      window.__dcloud_weex_postMessage = mockPost;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 uni-app Html5Plus',
        configurable: true,
      });

      uni = loadModule();
      uni.postMessage({ data: { msg: 'test' } });

      expect(mockPost).toHaveBeenCalledTimes(1);
      const payload = mockPost.mock.calls[0][0];
      expect(payload.data).toEqual([{ msg: 'test' }]);
    });

    it('should call __dcloud_weex_postMessageToService for navigation', () => {
      const mockService = jest.fn();
      window.__dcloud_weex_postMessage = jest.fn();
      window.__dcloud_weex_postMessageToService = mockService;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 uni-app Html5Plus',
        configurable: true,
      });

      uni = loadModule();
      uni.switchTab({ url: '/pages/home' });

      expect(mockService).toHaveBeenCalledTimes(1);
      const msg = mockService.mock.calls[0][0];
      expect(msg.type).toBe('WEB_INVOKE_APPSERVICE');
      expect(msg.args.data.name).toBe('switchTab');
    });
  });

  // ---- UniAppJSBridgeReady event ----

  describe('UniAppJSBridgeReady event', () => {
    it('should set window.UniAppJSBridge and dispatch event', (done) => {
      document.addEventListener('UniAppJSBridgeReady', function handler(e) {
        document.removeEventListener('UniAppJSBridgeReady', handler);
        expect(window.UniAppJSBridge).toBe(true);
        expect(e.bubbles).toBe(true);
        expect(e.cancelable).toBe(true);
        done();
      });

      // Loading the module in h5 mode triggers DOMContentLoaded listener,
      // which in turn fires UniAppJSBridgeReady.
      loadModule();

      // Simulate DOMContentLoaded since jsdom may have already fired it
      document.dispatchEvent(new Event('DOMContentLoaded'));
    });
  });
});
