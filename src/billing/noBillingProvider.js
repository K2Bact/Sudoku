/**
 * noBillingProvider.js
 * What runs while there is no way to take money.
 *
 * Every method refuses. That is the whole design: `isAvailable` is false, so
 * the Remove Ads screen is never reachable, and if some future code path reaches
 * a purchase anyway it fails loudly rather than granting the product.
 *
 * The version this replaced did the opposite. It showed a price placeholder,
 * spun "💳 결제 처리 중…" for a second and a half, announced success, and wrote
 * the entitlement to localStorage — a complete simulation of a payment, with the
 * product given away. A player had no way to tell that from a real purchase.
 *
 * So the refusals here are not placeholders waiting to be softened. Granting
 * without charging is the failure mode, and it should be impossible to reach by
 * accident.
 */

export class NoBillingProvider {
  get id() {
    return 'none';
  }

  /** No store, no library, no charge. The UI must not offer a purchase. */
  get isAvailable() {
    return false;
  }

  async init() {
    return false;
  }

  async getProduct() {
    return null;
  }

  async purchase() {
    return { success: false, reason: 'billing_unavailable', owned: false };
  }

  async restore() {
    return { success: false, owned: false };
  }
}
