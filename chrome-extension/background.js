/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ({

/***/ 22:
/***/ (function(module, exports) {

const handlers = new Set();
chrome.browserAction.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

$$$SubScribeToPosta = handler => {
  console.log("new subscription from options page");
  handlers.add(handler);
};

var timer;

function refreshOptionsPage() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      Array.from(handlers).forEach(h => h());
    } catch (error) {
      console.log(error);
    }
  }, 100);
}

class Bucket {
  constructor(ItemConstructor) {
    this.ItemConstructor = ItemConstructor;
    this._bucket = {};
  }

  add(id) {
    const {
      ItemConstructor
    } = this;
    if (!this._bucket[id]) this._bucket[id] = new ItemConstructor(id);
    return this._bucket[id];
  }

  set(id, item) {
    this._bucket[id] = item;
    return this._bucket[id];
  }

  get(id) {
    return this._bucket[id] || {
      get: () => ({}),
      set: () => ({
        get: () => {}
      })
    };
  }

  list(decay = 10 * 1000) {
    return Object.keys(this._bucket).map(k => this._bucket[k]); // .filter(i => !decay || !i.isDecayed(decay))
  }

}

class Item {
  constructor(id) {
    this.attributes = {};
    this.id = id;
    this.touch(true);
  }

  touch(modify) {
    this._json = modify ? undefined : this._json;
    this.lastSeen = Date.now();
    if (modify) refreshOptionsPage();
  }

  set(key, value) {
    this.touch(this.attributes[key] !== value);
    this.attributes[key] = value;
    return this;
  }

  isDecayed(decay) {
    return false;
    if (decay && this.lastSeen + decay < Date.now()) return true;
  }

  json() {
    this._json = this._json || this.get();
    return this._json;
  }

  get() {
    return {
      id: this.id,
      ...this.attributes
    };
  }

}

class TabFrame extends Item {
  constructor(tabFrameId) {
    super(tabFrameId);
    this.children = new Bucket(TabFrame);
    this.set("listeners", []);
  }

  addChild(child) {
    return this.children.set(child.id, child);
  }

  get windowId() {
    return windowsByTabAndFrameId.get(this.id).id;
  }

  get messages() {
    return messageByTabFrameId.get(this.id).messages || {
      messages: [],
      sent: 0,
      count: 0,
      received: 0
    };
  }

  get() {
    const {
      children,
      id
    } = this;
    return { ...super.get(),
      ...windowsByTabAndFrameId.get(id).get(),
      children: children.list()
    };
  }

}

class MessagesBucket extends Item {
  constructor(windowId) {
    super(windowId);
    this.messages = {
      messages: [],
      sent: 0,
      count: 0,
      received: 0
    };
  }

  addMessage(messageId, counter) {
    if (this.messages.messages.indexOf(messageId) !== -1) return;
    this.messages[counter]++;
    this.messages.count++;
    this.messages.messages.unshift(messageId);
    this.messages.messages = this.messages.messages.slice(0, 100); //to avoid denial of service

    this.messages.messages = Array.from(this.messages.messages);
    this.touch(true);
    refreshOptionsPage();
  }

  get() {
    return { ...this.messages,
      messages: this.messages.map(m => messagesByMessageId.get(m).get())
    };
  }

}

windowsByTabAndFrameId = new Bucket(TabFrame);
messagesByMessageId = new Bucket(Item);
messageByTabFrameId = new Bucket(MessagesBucket);
tabsFrames = new Bucket(TabFrame);

const receivedMessage = ({
  messageId,
  data,
  origin
}, tabId, frameId) => {
  let tabWindowId = `${tabId}::${frameId}`;
  messageByTabFrameId.add(tabWindowId).addMessage(messageId, "received");
  messagesByMessageId.add(messageId).set("receiver", tabWindowId).set("origin", origin).set("data", data);
};

const accountForMessage = ({
  messageId
}, tabId, frameId) => {
  let tabWindowId = `${tabId}::${frameId}`;
  messageByTabFrameId.add(tabWindowId).addMessage(messageId, "sent");
  messagesByMessageId.add(messageId).set("sender", tabWindowId);
};

const listeners = (message, tabId, frameId) => {
  const {
    listeners,
    windowId
  } = message;
  windowsByTabAndFrameId.add(`${tabId}::${frameId}`).set("listeners", listeners).set("windowId", windowId);
};

const topicHandlers = {
  "received-message": receivedMessage,
  "account-for-message": accountForMessage,
  listeners,
  "account-for-path": (message, tabId, frameId) => {
    let tabWindowId = `${tabId}::${frameId}`;
    let {
      path
    } = message;
    windowsByTabAndFrameId.add(tabWindowId).set("path", path);
  }
};

const processIncomingMessage = (message, tabId, frameId) => {
  let {
    topic
  } = message;
  if (!topicHandlers[topic]) return console.log(`TODO: handel ${topic} from ${tabId}:${frameId}`);
  topicHandlers[topic](message, tabId, frameId);
};

chrome.runtime.onMessage.addListener((message, sender, response) => {
  const {
    frameId,
    tab: {
      id
    }
  } = sender;
  if (!message) console.trace("empty message");

  try {
    processIncomingMessage(message, id, frameId);
  } catch (error) {
    console.log(error);
  }
});

const updateTabs = () => {
  chrome.tabs.query({}, allTabs => {
    let targetTabs = allTabs.filter(({
      url
    }) => !url.startsWith("chrome"));
    Promise.all(targetTabs.map(({
      id: tabId
    }) => new Promise((resolve, reject) => {
      chrome.webNavigation.getAllFrames({
        tabId
      }, frames => resolve({
        tabId,
        frames
      }));
    }))).then(updatedTabs => {
      tabsFrames = new Bucket(TabFrame);
      updatedTabs.forEach(({
        tabId,
        frames
      }) => {
        let topFrameIndex = frames.findIndex(({
          parentFrameId
        }) => parentFrameId === -1);
        var [{
          frameId,
          url
        }] = frames.splice(topFrameIndex, 1);
        let tabFrameId = `${tabId}::${frameId}`;
        var top = new TabFrame(tabFrameId);
        top.set("locationHref", url);
        windowsByTabAndFrameId.set(tabFrameId, top);
        tabsFrames.set(tabFrameId, top);
        frames.forEach(frame => {
          const {
            frameId,
            parentFrameId,
            url
          } = frame;
          let tabFrameId = `${tabId}::${frameId}`;
          let parentTabFrameId = `${tabId}::${parentFrameId}`;
          let windowFrame = windowsByTabAndFrameId.add(tabFrameId).set("locationHref", url);
          let parentWindowFrame = windowsByTabAndFrameId.add(parentTabFrameId);
          parentWindowFrame.addChild(windowFrame);
        });
      });
    });
  });
};

chrome.webNavigation.onDOMContentLoaded.addListener(updateTabs);
chrome.webNavigation.onCommitted.addListener(updateTabs);

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JhY2tncm91bmQuanMiXSwibmFtZXMiOlsiaGFuZGxlcnMiLCJTZXQiLCJjaHJvbWUiLCJicm93c2VyQWN0aW9uIiwib25DbGlja2VkIiwiYWRkTGlzdGVuZXIiLCJydW50aW1lIiwib3Blbk9wdGlvbnNQYWdlIiwiJCQkU3ViU2NyaWJlVG9Qb3N0YSIsImhhbmRsZXIiLCJjb25zb2xlIiwibG9nIiwiYWRkIiwidGltZXIiLCJyZWZyZXNoT3B0aW9uc1BhZ2UiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiQXJyYXkiLCJmcm9tIiwiZm9yRWFjaCIsImgiLCJlcnJvciIsIkJ1Y2tldCIsImNvbnN0cnVjdG9yIiwiSXRlbUNvbnN0cnVjdG9yIiwiX2J1Y2tldCIsImlkIiwic2V0IiwiaXRlbSIsImdldCIsImxpc3QiLCJkZWNheSIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJrIiwiSXRlbSIsImF0dHJpYnV0ZXMiLCJ0b3VjaCIsIm1vZGlmeSIsIl9qc29uIiwidW5kZWZpbmVkIiwibGFzdFNlZW4iLCJEYXRlIiwibm93Iiwia2V5IiwidmFsdWUiLCJpc0RlY2F5ZWQiLCJqc29uIiwiVGFiRnJhbWUiLCJ0YWJGcmFtZUlkIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImNoaWxkIiwid2luZG93SWQiLCJ3aW5kb3dzQnlUYWJBbmRGcmFtZUlkIiwibWVzc2FnZXMiLCJtZXNzYWdlQnlUYWJGcmFtZUlkIiwic2VudCIsImNvdW50IiwicmVjZWl2ZWQiLCJNZXNzYWdlc0J1Y2tldCIsImFkZE1lc3NhZ2UiLCJtZXNzYWdlSWQiLCJjb3VudGVyIiwiaW5kZXhPZiIsInVuc2hpZnQiLCJzbGljZSIsIm0iLCJtZXNzYWdlc0J5TWVzc2FnZUlkIiwidGFic0ZyYW1lcyIsInJlY2VpdmVkTWVzc2FnZSIsImRhdGEiLCJvcmlnaW4iLCJ0YWJJZCIsImZyYW1lSWQiLCJ0YWJXaW5kb3dJZCIsImFjY291bnRGb3JNZXNzYWdlIiwibGlzdGVuZXJzIiwibWVzc2FnZSIsInRvcGljSGFuZGxlcnMiLCJwYXRoIiwicHJvY2Vzc0luY29taW5nTWVzc2FnZSIsInRvcGljIiwib25NZXNzYWdlIiwic2VuZGVyIiwicmVzcG9uc2UiLCJ0YWIiLCJ0cmFjZSIsInVwZGF0ZVRhYnMiLCJ0YWJzIiwicXVlcnkiLCJhbGxUYWJzIiwidGFyZ2V0VGFicyIsImZpbHRlciIsInVybCIsInN0YXJ0c1dpdGgiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIndlYk5hdmlnYXRpb24iLCJnZXRBbGxGcmFtZXMiLCJmcmFtZXMiLCJ0aGVuIiwidXBkYXRlZFRhYnMiLCJ0b3BGcmFtZUluZGV4IiwiZmluZEluZGV4IiwicGFyZW50RnJhbWVJZCIsInNwbGljZSIsInRvcCIsImZyYW1lIiwicGFyZW50VGFiRnJhbWVJZCIsIndpbmRvd0ZyYW1lIiwicGFyZW50V2luZG93RnJhbWUiLCJvbkRPTUNvbnRlbnRMb2FkZWQiLCJvbkNvbW1pdHRlZCJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlD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QztBQUNBLGNBQUlxQyxnQkFBZ0IsR0FBSSxHQUFFdEMsS0FBTSxLQUFJa0MsYUFBYyxFQUFsRDtBQUNBLGNBQUlLLFdBQVcsR0FBRzFELHNCQUFzQixDQUFDM0MsR0FBdkIsQ0FBMkJzQyxVQUEzQixFQUF1Q3ZCLEdBQXZDLENBQTJDLGNBQTNDLEVBQTJEb0UsR0FBM0QsQ0FBbEI7QUFDQSxjQUFJbUIsaUJBQWlCLEdBQUczRCxzQkFBc0IsQ0FBQzNDLEdBQXZCLENBQTJCb0csZ0JBQTNCLENBQXhCO0FBQ0FFLDJCQUFpQixDQUFDOUQsUUFBbEIsQ0FBMkI2RCxXQUEzQjtBQUNILFNBWEQ7QUFZSCxPQXJCRDtBQXNCSCxLQWhDRDtBQWlDSCxHQW5DRDtBQW9DSCxDQXJDRDs7QUF1Q0EvRyxNQUFNLENBQUNtRyxhQUFQLENBQXFCYyxrQkFBckIsQ0FBd0M5RyxXQUF4QyxDQUFvRG9GLFVBQXBEO0FBQ0F2RixNQUFNLENBQUNtRyxhQUFQLENBQXFCZSxXQUFyQixDQUFpQy9HLFdBQWpDLENBQTZDb0YsVUFBN0MsRSIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDIyKTtcbiIsImNvbnN0IGhhbmRsZXJzID0gbmV3IFNldCgpO1xyXG5cclxuY2hyb21lLmJyb3dzZXJBY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyKCgpPT57XHJcbiAgICBjaHJvbWUucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcclxufSlcclxuXHJcbiQkJFN1YlNjcmliZVRvUG9zdGEgPSAoaGFuZGxlcikgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJuZXcgc3Vic2NyaXB0aW9uIGZyb20gb3B0aW9ucyBwYWdlXCIpXHJcbiAgICBoYW5kbGVycy5hZGQoaGFuZGxlcik7XHJcbn1cclxuXHJcbnZhciB0aW1lcjtcclxuXHJcbmZ1bmN0aW9uIHJlZnJlc2hPcHRpb25zUGFnZSgpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lcilcclxuICAgIHRpbWVyID0gc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIEFycmF5LmZyb20oaGFuZGxlcnMpLmZvckVhY2goaCA9PiBoKCkpXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXHJcbiAgICAgICAgfVxyXG4gICAgfSwxMDApXHJcbiAgICBcclxufVxyXG5cclxuXHJcbmNsYXNzIEJ1Y2tldCB7XHJcbiAgICBjb25zdHJ1Y3RvcihJdGVtQ29uc3RydWN0b3IpIHtcclxuICAgICAgICB0aGlzLkl0ZW1Db25zdHJ1Y3RvciA9IEl0ZW1Db25zdHJ1Y3RvcjtcclxuICAgICAgICB0aGlzLl9idWNrZXQgPSB7fVxyXG4gICAgfVxyXG4gICAgYWRkKGlkKSB7XHJcbiAgICAgICAgY29uc3QgeyBJdGVtQ29uc3RydWN0b3IgfSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9idWNrZXRbaWRdKSB0aGlzLl9idWNrZXRbaWRdID0gbmV3IEl0ZW1Db25zdHJ1Y3RvcihpZCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1Y2tldFtpZF1cclxuICAgIH1cclxuICAgIHNldChpZCwgaXRlbSl7XHJcbiAgICAgICAgdGhpcy5fYnVja2V0W2lkXSA9IGl0ZW07XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1Y2tldFtpZF07XHJcbiAgICB9XHJcbiAgICBnZXQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYnVja2V0W2lkXSB8fCB7XHJcbiAgICAgICAgICAgIGdldDogKCkgPT4gKHt9KSxcclxuICAgICAgICAgICAgc2V0OiAoKSA9PiAoeyBnZXQ6ICgpID0+IHsgfSB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBsaXN0KGRlY2F5ID0gMTAgKiAxMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2J1Y2tldCkubWFwKGsgPT4gdGhpcy5fYnVja2V0W2tdKVxyXG4gICAgICAgIC8vIC5maWx0ZXIoaSA9PiAhZGVjYXkgfHwgIWkuaXNEZWNheWVkKGRlY2F5KSlcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLnRvdWNoKHRydWUpO1xyXG4gICAgfVxyXG4gICAgdG91Y2gobW9kaWZ5KSB7XHJcbiAgICAgICAgdGhpcy5fanNvbiA9IG1vZGlmeSA/IHVuZGVmaW5lZCA6IHRoaXMuX2pzb247XHJcbiAgICAgICAgdGhpcy5sYXN0U2VlbiA9IERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKG1vZGlmeSkgcmVmcmVzaE9wdGlvbnNQYWdlKCk7XHJcbiAgICB9XHJcbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudG91Y2godGhpcy5hdHRyaWJ1dGVzW2tleV0gIT09IHZhbHVlKTtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGVjYXllZChkZWNheSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIGlmIChkZWNheSAmJiAoKHRoaXMubGFzdFNlZW4gKyBkZWNheSkgPCBEYXRlLm5vdygpKSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuXHJcbiAgICBqc29uKCkge1xyXG4gICAgICAgIHRoaXMuX2pzb24gPSB0aGlzLl9qc29uIHx8IHRoaXMuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2pzb247XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkOnRoaXMuaWQsXHJcbiAgICAgICAgICAgIC4uLnRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRhYkZyYW1lIGV4dGVuZHMgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0YWJGcmFtZUlkKSB7XHJcbiAgICAgICAgc3VwZXIodGFiRnJhbWVJZCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBCdWNrZXQoVGFiRnJhbWUpXHJcbiAgICAgICAgdGhpcy5zZXQoXCJsaXN0ZW5lcnNcIiwgW10pO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENoaWxkKGNoaWxkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uc2V0KGNoaWxkLmlkLGNoaWxkKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgd2luZG93SWQoKXtcclxuICAgICAgICByZXR1cm4gd2luZG93c0J5VGFiQW5kRnJhbWVJZC5nZXQodGhpcy5pZCkuaWRcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVzc2FnZXMgKCl7XHJcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VCeVRhYkZyYW1lSWQuZ2V0KHRoaXMuaWQpLm1lc3NhZ2VzIHx8IHtcclxuICAgICAgICAgICAgbWVzc2FnZXM6IFtdLFxyXG4gICAgICAgICAgICBzZW50OjAsXHJcbiAgICAgICAgICAgIGNvdW50OiAwLFxyXG4gICAgICAgICAgICByZWNlaXZlZDowXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgKCkge1xyXG4gICAgICAgIGNvbnN0IHtjaGlsZHJlbixpZH0gPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIC4uLnN1cGVyLmdldCgpLFxyXG4gICAgICAgICAgICAuLi53aW5kb3dzQnlUYWJBbmRGcmFtZUlkLmdldChpZCkuZ2V0KCksXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbi5saXN0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lc3NhZ2VzQnVja2V0IGV4dGVuZHMgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih3aW5kb3dJZCkge1xyXG4gICAgICAgIHN1cGVyKHdpbmRvd0lkKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0ge1xyXG4gICAgICAgICAgICBtZXNzYWdlczogW10sXHJcbiAgICAgICAgICAgIHNlbnQ6MCxcclxuICAgICAgICAgICAgY291bnQ6IDAsXHJcbiAgICAgICAgICAgIHJlY2VpdmVkOjBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFkZE1lc3NhZ2UobWVzc2FnZUlkLGNvdW50ZXIpIHtcclxuICAgICAgICBpZih0aGlzLm1lc3NhZ2VzLm1lc3NhZ2VzLmluZGV4T2YobWVzc2FnZUlkKSAhPT0gLTEpIHJldHVyblxyXG4gICAgICAgIHRoaXMubWVzc2FnZXNbY291bnRlcl0rKztcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzLmNvdW50Kys7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5tZXNzYWdlcy51bnNoaWZ0KG1lc3NhZ2VJZCk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5tZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMubWVzc2FnZXMuc2xpY2UoMCwgMTAwKTsvL3RvIGF2b2lkIGRlbmlhbCBvZiBzZXJ2aWNlXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5tZXNzYWdlcyA9IEFycmF5LmZyb20odGhpcy5tZXNzYWdlcy5tZXNzYWdlcylcclxuICAgICAgICB0aGlzLnRvdWNoKHRydWUpXHJcbiAgICAgICAgcmVmcmVzaE9wdGlvbnNQYWdlKClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAuLi50aGlzLm1lc3NhZ2VzLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IHRoaXMubWVzc2FnZXMubWFwKG09Pm1lc3NhZ2VzQnlNZXNzYWdlSWQuZ2V0KG0pLmdldCgpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG53aW5kb3dzQnlUYWJBbmRGcmFtZUlkID0gbmV3IEJ1Y2tldChUYWJGcmFtZSk7XHJcbm1lc3NhZ2VzQnlNZXNzYWdlSWQgID0gbmV3IEJ1Y2tldChJdGVtKTtcclxubWVzc2FnZUJ5VGFiRnJhbWVJZCAgPSBuZXcgQnVja2V0KE1lc3NhZ2VzQnVja2V0KTtcclxuXHJcbnRhYnNGcmFtZXMgPSBuZXcgQnVja2V0KFRhYkZyYW1lKTtcclxuXHJcbmNvbnN0IHJlY2VpdmVkTWVzc2FnZSA9ICh7IG1lc3NhZ2VJZCwgZGF0YSwgb3JpZ2luIH0sdGFiSWQsIGZyYW1lSWQpID0+IHtcclxuICAgIGxldCB0YWJXaW5kb3dJZCA9IGAke3RhYklkfTo6JHtmcmFtZUlkfWA7XHJcbiAgICBtZXNzYWdlQnlUYWJGcmFtZUlkLmFkZCh0YWJXaW5kb3dJZClcclxuICAgICAgICAuYWRkTWVzc2FnZShtZXNzYWdlSWQsXCJyZWNlaXZlZFwiKVxyXG4gICAgXHJcbiAgICBtZXNzYWdlc0J5TWVzc2FnZUlkLmFkZChtZXNzYWdlSWQpXHJcbiAgICAgICAgLnNldChcInJlY2VpdmVyXCIsIHRhYldpbmRvd0lkKVxyXG4gICAgICAgIC5zZXQoXCJvcmlnaW5cIixvcmlnaW4pXHJcbiAgICAgICAgLnNldChcImRhdGFcIiwgZGF0YSk7XHJcbn1cclxuXHJcbmNvbnN0IGFjY291bnRGb3JNZXNzYWdlID0gKHsgbWVzc2FnZUlkIH0sdGFiSWQsIGZyYW1lSWQpID0+IHtcclxuICAgIGxldCB0YWJXaW5kb3dJZCA9IGAke3RhYklkfTo6JHtmcmFtZUlkfWA7XHJcbiAgICBtZXNzYWdlQnlUYWJGcmFtZUlkLmFkZCh0YWJXaW5kb3dJZClcclxuICAgICAgICAuYWRkTWVzc2FnZShtZXNzYWdlSWQsXCJzZW50XCIpXHJcbiAgICBcclxuICAgIG1lc3NhZ2VzQnlNZXNzYWdlSWQuYWRkKG1lc3NhZ2VJZClcclxuICAgICAgICAuc2V0KFwic2VuZGVyXCIsIHRhYldpbmRvd0lkKTtcclxufVxyXG5cclxuY29uc3QgbGlzdGVuZXJzID0gKG1lc3NhZ2UsIHRhYklkLCBmcmFtZUlkKSA9PiB7XHJcbiAgICBjb25zdCB7IGxpc3RlbmVycywgd2luZG93SWQgIH0gPSBtZXNzYWdlO1xyXG4gICAgd2luZG93c0J5VGFiQW5kRnJhbWVJZC5hZGQoYCR7dGFiSWR9Ojoke2ZyYW1lSWR9YCkuc2V0KFwibGlzdGVuZXJzXCIsbGlzdGVuZXJzKS5zZXQoXCJ3aW5kb3dJZFwiLCB3aW5kb3dJZClcclxufVxyXG5cclxuY29uc3QgdG9waWNIYW5kbGVycyA9IHtcclxuICAgIFwicmVjZWl2ZWQtbWVzc2FnZVwiOnJlY2VpdmVkTWVzc2FnZSxcclxuICAgIFwiYWNjb3VudC1mb3ItbWVzc2FnZVwiOmFjY291bnRGb3JNZXNzYWdlLFxyXG4gICAgbGlzdGVuZXJzLFxyXG4gICAgXCJhY2NvdW50LWZvci1wYXRoXCI6IChtZXNzYWdlLCB0YWJJZCwgZnJhbWVJZCk9PntcclxuICAgICAgICBsZXQgdGFiV2luZG93SWQgPSBgJHt0YWJJZH06OiR7ZnJhbWVJZH1gO1xyXG4gICAgICAgIGxldCB7cGF0aH0gPW1lc3NhZ2U7XHJcbiAgICAgICAgd2luZG93c0J5VGFiQW5kRnJhbWVJZC5hZGQodGFiV2luZG93SWQpLnNldChcInBhdGhcIixwYXRoKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmNvbnN0IHByb2Nlc3NJbmNvbWluZ01lc3NhZ2UgPSAobWVzc2FnZSwgdGFiSWQsZnJhbWVJZCkgPT4ge1xyXG4gICAgbGV0IHsgdG9waWMgfSA9IG1lc3NhZ2U7XHJcbiAgICBpZiAoIXRvcGljSGFuZGxlcnNbdG9waWNdKSByZXR1cm4gY29uc29sZS5sb2coYFRPRE86IGhhbmRlbCAke3RvcGljfSBmcm9tICR7dGFiSWR9OiR7ZnJhbWVJZH1gKVxyXG4gICAgdG9waWNIYW5kbGVyc1t0b3BpY10obWVzc2FnZSwgdGFiSWQsZnJhbWVJZClcclxufVxyXG5cclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHJlc3BvbnNlKSA9PiB7XHJcbiAgICBjb25zdCB7IFxyXG4gICAgICAgIGZyYW1lSWQsXHJcbiAgICAgICAgdGFiOiB7XHJcbiAgICAgICAgICAgIGlkXHJcbiAgICAgICAgfSB9ID0gc2VuZGVyXHJcblxyXG4gICAgaWYgKCFtZXNzYWdlKSBjb25zb2xlLnRyYWNlKFwiZW1wdHkgbWVzc2FnZVwiKTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcHJvY2Vzc0luY29taW5nTWVzc2FnZShtZXNzYWdlLCBpZCwgZnJhbWVJZClcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5cclxuXHJcbmNvbnN0IHVwZGF0ZVRhYnMgPSAoKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgKGFsbFRhYnMpID0+IHtcclxuICAgICAgICBsZXQgdGFyZ2V0VGFicyA9IGFsbFRhYnMuZmlsdGVyKCh7IHVybCB9KSA9PiAhdXJsLnN0YXJ0c1dpdGgoXCJjaHJvbWVcIikpO1xyXG4gICAgICAgIFByb21pc2UuYWxsKFxyXG4gICAgICAgICAgICB0YXJnZXRUYWJzLm1hcCgoeyBpZDogdGFiSWQgfSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLndlYk5hdmlnYXRpb24uZ2V0QWxsRnJhbWVzKHsgdGFiSWQgfSwgKGZyYW1lcykgPT4gcmVzb2x2ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFiSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhbWVzXHJcbiAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgfSkpXHJcblxyXG4gICAgICAgICkudGhlbigodXBkYXRlZFRhYnMpID0+IHtcclxuICAgICAgICAgICAgdGFic0ZyYW1lcyA9IG5ldyBCdWNrZXQoVGFiRnJhbWUpO1xyXG4gICAgICAgICAgICB1cGRhdGVkVGFicy5mb3JFYWNoKCh7IHRhYklkLCBmcmFtZXMgfSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvcEZyYW1lSW5kZXggPSBmcmFtZXMuZmluZEluZGV4KCh7cGFyZW50RnJhbWVJZH0pPT5wYXJlbnRGcmFtZUlkPT09LTEpO1xyXG4gICAgICAgICAgICAgICAgdmFyIFt7ZnJhbWVJZCx1cmx9XSA9IGZyYW1lcy5zcGxpY2UodG9wRnJhbWVJbmRleCwxKTtcclxuICAgICAgICAgICAgICAgIGxldCB0YWJGcmFtZUlkID0gYCR7dGFiSWR9Ojoke2ZyYW1lSWR9YDtcclxuICAgICAgICAgICAgICAgIHZhciB0b3AgPSAgbmV3IFRhYkZyYW1lKHRhYkZyYW1lSWQpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0b3Auc2V0KFwibG9jYXRpb25IcmVmXCIsIHVybCk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3dzQnlUYWJBbmRGcmFtZUlkLnNldCh0YWJGcmFtZUlkLHRvcCk7XHJcbiAgICAgICAgICAgICAgICB0YWJzRnJhbWVzLnNldCh0YWJGcmFtZUlkLCB0b3ApXHJcbiAgICAgICAgICAgICAgICBmcmFtZXMuZm9yRWFjaChmcmFtZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRGcmFtZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmxcclxuICAgICAgICAgICAgICAgICAgICB9ID0gZnJhbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhYkZyYW1lSWQgPSBgJHt0YWJJZH06OiR7ZnJhbWVJZH1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRUYWJGcmFtZUlkID0gYCR7dGFiSWR9Ojoke3BhcmVudEZyYW1lSWR9YDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgd2luZG93RnJhbWUgPSB3aW5kb3dzQnlUYWJBbmRGcmFtZUlkLmFkZCh0YWJGcmFtZUlkKS5zZXQoXCJsb2NhdGlvbkhyZWZcIiwgdXJsKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50V2luZG93RnJhbWUgPSB3aW5kb3dzQnlUYWJBbmRGcmFtZUlkLmFkZChwYXJlbnRUYWJGcmFtZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRXaW5kb3dGcmFtZS5hZGRDaGlsZCh3aW5kb3dGcmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5jaHJvbWUud2ViTmF2aWdhdGlvbi5vbkRPTUNvbnRlbnRMb2FkZWQuYWRkTGlzdGVuZXIodXBkYXRlVGFicylcclxuY2hyb21lLndlYk5hdmlnYXRpb24ub25Db21taXR0ZWQuYWRkTGlzdGVuZXIodXBkYXRlVGFicykiXSwic291cmNlUm9vdCI6IiJ9
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlUm9vdCI6IiJ9