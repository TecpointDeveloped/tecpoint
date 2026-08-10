type CommerceItem = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

export function trackSearch(searchTerm: string) {
  const normalized = searchTerm.trim();
  if (!normalized) return;

  window.fbq?.("track", "Search", {
    search_string: normalized,
  });
  window.gtag?.("event", "search", {
    search_term: normalized,
  });
}

export function trackViewContent(item: CommerceItem) {
  window.fbq?.("track", "ViewContent", {
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
  window.fbq?.("track", "AddToCart", {
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
  window.fbq?.("track", "InitiateCheckout", {
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
  window.fbq?.("track", "Purchase", {
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
