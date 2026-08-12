type CommerceItem = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

type MetaEvent = {
  event: string;
  params?: Record<string, unknown>;
};

const META_QUEUE_KEY = "__tecpointMetaQueue";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    __tecpointMetaQueue?: MetaEvent[];
  }
}

function sendMeta(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    window.fbq("track", event, params || {});
    return;
  }
  window[META_QUEUE_KEY] = window[META_QUEUE_KEY] || [];
  window[META_QUEUE_KEY]?.push({ event, params });
}

export function flushMetaQueue() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const queue = window[META_QUEUE_KEY] || [];
  window[META_QUEUE_KEY] = [];
  queue.forEach(({ event, params }) => window.fbq?.("track", event, params || {}));
}

export function trackPageView() {
  sendMeta("PageView");
}

export function trackViewCategory(category: string) {
  const name = category.trim() || "Todos los productos";
  sendMeta("ViewCategory", { content_name: name, content_category: name });
  window.gtag?.("event", "view_item_list", { item_list_name: name });
}

export function trackContact(channel = "WhatsApp") {
  sendMeta("Contact", { contact_method: channel });
  window.gtag?.("event", "generate_lead", { method: channel });
}

export function trackSearch(searchTerm: string) {
  const normalized = searchTerm.trim();
  if (!normalized) return;

  sendMeta("Search", {
    search_string: normalized,
  });
  window.gtag?.("event", "search", {
    search_term: normalized,
  });
}

export function trackViewContent(item: CommerceItem) {
  sendMeta("ViewContent", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    currency: "HNL",
    value: item.price,
  });
  window.gtag?.("event", "view_item", {
    currency: "HNL",
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, price: item.price }],
  });
}

export function trackAddToCart(item: CommerceItem) {
  sendMeta("AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    currency: "HNL",
    value: item.price,
  });
  window.gtag?.("event", "add_to_cart", {
    currency: "HNL",
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, price: item.price }],
  });
}

export function trackInitiateCheckout(items: CommerceItem[], total: number) {
  sendMeta("InitiateCheckout", {
    content_ids: items.map((item) => item.id),
    content_type: "product",
    currency: "HNL",
    num_items: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    value: total,
  });
  window.gtag?.("event", "begin_checkout", {
    currency: "HNL",
    value: total,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
}

export function trackPurchase(
  orderId: string,
  total: number,
  items: CommerceItem[],
) {
  sendMeta("Purchase", {
    content_ids: items.map((item) => item.id),
    content_type: "product",
    currency: "HNL",
    value: total,
  });
  window.gtag?.("event", "purchase", {
    transaction_id: orderId,
    currency: "HNL",
    value: total,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
}
