/**
 * playBillingProvider.js
 * Google Play Billing. Written and shipped, dormant until switched on.
 *
 * Complete on purpose: the whole point of finishing it now is that release day
 * is a config change, not a coding session against a deadline with money on the
 * line. It is not exercised — a real purchase needs a live product in Play
 * Console and a licence tester account, and neither exists during closed
 * testing.
 *
 * There is no import of the billing package. Capacitor registers native plugins
 * on `window.Capacitor.Plugins` at runtime, so this file compiles and ships
 * without `@capacitor-community/in-app-purchases` installed and starts working
 * the moment it is. A static import would break the build for everyone until
 * then.
 *
 * GOTCHA this project has already paid for twice (Play Games, then AdMob): a
 * Capacitor plugin object is a Proxy, so `await plugin` invokes `plugin.then()`
 * and the native layer answers "Plugin.then() is not implemented". Only ever
 * await the RESULT OF A METHOD CALL, never the plugin itself.
 *
 * The price string comes from the store and is never formatted here. "₩3,300",
 * "$2.49", "2,49 €" — symbol, separators and placement all differ by country,
 * and Google already knows the right answer for the account being charged.
 */

import { REMOVE_ADS_PRODUCT_ID } from './index.js';

function plugin() {
  if (typeof window === 'undefined') return null;
  const plugins = window.Capacitor && window.Capacitor.Plugins;
  return (plugins && plugins.InAppPurchases) || null;
}

export class PlayBillingProvider {
  constructor() {
    this.initPromise = null;
    this.product = null;
  }

  get id() {
    return 'play';
  }

  /**
   * Selecting this provider is not the same as being able to charge. Without
   * the plugin installed the screen must stay hidden, exactly as it does under
   * the 'none' provider — claiming otherwise would put back the dead end this
   * seam exists to remove.
   */
  get isAvailable() {
    return Boolean(plugin());
  }

  init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const store = plugin();
      if (!store) return false;
      try {
        await store.initialize();
        return true;
      } catch (e) {
        console.warn('[billing] initialize failed:', e?.message || e);
        return false;
      }
    })();
    return this.initPromise;
  }

  async getProduct() {
    const store = plugin();
    if (!store) return null;
    try {
      await this.init();
      const res = await store.getProducts({ productIds: [REMOVE_ADS_PRODUCT_ID] });
      const found = (res?.products || []).find((p) => p.id === REMOVE_ADS_PRODUCT_ID);
      if (!found) return null;
      this.product = found;
      return {
        // The store's own localised string. Never reformat it.
        price: found.price || found.priceString || '',
        currency: found.currencyCode || '',
        owned: await this.#ownsIt(store)
      };
    } catch (e) {
      console.warn('[billing] getProduct failed:', e?.message || e);
      return null;
    }
  }

  async purchase() {
    const store = plugin();
    if (!store) return { success: false, reason: 'billing_unavailable', owned: false };
    try {
      await this.init();
      const res = await store.purchase({ productId: REMOVE_ADS_PRODUCT_ID });

      // A cancelled purchase is not a failure to report as an error — the
      // player chose it. Anything else is worth a message.
      if (res?.cancelled) return { success: false, reason: 'cancelled', owned: false };

      const owned = await this.#ownsIt(store);
      if (!owned) return { success: false, reason: 'not_confirmed', owned: false };

      // A managed product must be acknowledged within three days or Google
      // refunds it automatically. Doing it here, after ownership is confirmed,
      // is what makes the sale stick.
      try {
        if (res?.transactionId) await store.acknowledge({ transactionId: res.transactionId });
      } catch (e) {
        console.warn('[billing] acknowledge failed:', e?.message || e);
      }
      return { success: true, reason: null, owned: true };
    } catch (e) {
      console.warn('[billing] purchase failed:', e?.message || e);
      return { success: false, reason: 'error', owned: false };
    }
  }

  /**
   * A permanent product must survive reinstalls and new devices, so the store
   * is the record — not our localStorage flag, which a fresh install has never
   * seen.
   */
  async restore() {
    const store = plugin();
    if (!store) return { success: false, owned: false };
    try {
      await this.init();
      if (store.restorePurchases) await store.restorePurchases();
      return { success: true, owned: await this.#ownsIt(store) };
    } catch (e) {
      console.warn('[billing] restore failed:', e?.message || e);
      return { success: false, owned: false };
    }
  }

  async #ownsIt(store) {
    try {
      const res = await store.getPurchases();
      return (res?.purchases || []).some((p) => p.productId === REMOVE_ADS_PRODUCT_ID);
    } catch (e) {
      return false;
    }
  }
}
