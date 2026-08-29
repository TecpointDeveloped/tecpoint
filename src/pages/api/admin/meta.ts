import type { NextApiRequest, NextApiResponse } from "next";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

type MetaPage<T> = { data?: T[]; error?: { message?: string; code?: number } };
type Insight = { ad_id?: string; impressions?: string; reach?: string; clicks?: string; spend?: string; actions?: Array<{ action_type: string; value: string }> };
type Ad = { id: string; name?: string; effective_status?: string; campaign?: { name?: string }; creative?: { title?: string; body?: string; thumbnail_url?: string; effective_object_story_id?: string } };
type Post = { id: string; message?: string; created_time?: string; permalink_url?: string; full_picture?: string; shares?: { count?: number }; comments?: { summary?: { total_count?: number } }; likes?: { summary?: { total_count?: number } } };

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return decoded.role === "admin" ? admin : null;
}

async function graph<T>(path: string, params: Record<string, string>, token: string, version: string) {
  const url = new URL(`https://graph.facebook.com/${version}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await response.json() as T & { error?: { message?: string; code?: number } };
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta respondió ${response.status}.`);
  return payload;
}

function actionValue(insight: Insight, names: string[]) {
  return Number(insight.actions?.find((action) => names.includes(action.action_type))?.value || 0);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido." });
  try {
    if (!(await requireAdmin(req))) return res.status(403).json({ error: "Acceso administrativo requerido." });
    const accessToken = process.env.META_SYSTEM_USER_ACCESS_TOKEN;
    const adAccount = process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, "");
    const pageId = process.env.META_PAGE_ID;
    const version = process.env.META_GRAPH_VERSION || "v25.0";
    const missing = [
      !accessToken && "META_SYSTEM_USER_ACCESS_TOKEN",
      !adAccount && "META_AD_ACCOUNT_ID",
      !pageId && "META_PAGE_ID",
    ].filter(Boolean);
    if (!accessToken || !adAccount || !pageId) return res.status(200).json({ connected: false, missing, version });

    const [adsPayload, insightsPayload, postsPayload] = await Promise.all([
      graph<MetaPage<Ad>>(`act_${adAccount}/ads`, {
        fields: "id,name,effective_status,campaign{name},creative{title,body,thumbnail_url,effective_object_story_id}",
        filtering: JSON.stringify([{ field: "effective_status", operator: "IN", value: ["ACTIVE"] }]),
        limit: "100",
      }, accessToken, version),
      graph<MetaPage<Insight>>(`act_${adAccount}/insights`, {
        level: "ad", date_preset: "last_30d",
        fields: "ad_id,impressions,reach,clicks,spend,actions",
        limit: "500",
      }, accessToken, version),
      graph<MetaPage<Post>>(`${pageId}/published_posts`, {
        fields: "id,message,created_time,permalink_url,full_picture,shares,comments.limit(0).summary(true),likes.limit(0).summary(true)",
        limit: "30",
      }, accessToken, version),
    ]);

    const insights = new Map((insightsPayload.data || []).map((item) => [item.ad_id, item]));
    const ads = (adsPayload.data || []).map((ad) => {
      const metric = insights.get(ad.id) || {};
      const results = actionValue(metric, ["purchase", "omni_purchase", "lead", "onsite_conversion.messaging_conversation_started_7d"]);
      const spend = Number(metric.spend || 0);
      const clicks = Number(metric.clicks || 0);
      return {
        ...ad,
        metrics: {
          impressions: Number(metric.impressions || 0), reach: Number(metric.reach || 0), clicks, spend, results,
          ctr: Number(metric.impressions || 0) ? clicks / Number(metric.impressions) * 100 : 0,
          costPerResult: results ? spend / results : null,
        },
      };
    }).sort((left, right) => (right.metrics.results - left.metrics.results) || (right.metrics.ctr - left.metrics.ctr));

    const now = Date.now();
    const posts = (postsPayload.data || []).map((post) => {
      const likes = Number(post.likes?.summary?.total_count || 0);
      const comments = Number(post.comments?.summary?.total_count || 0);
      const shares = Number(post.shares?.count || 0);
      const ageDays = Math.max(1, (now - new Date(post.created_time || now).getTime()) / 86400000);
      const score = (likes + comments * 2 + shares * 3) / Math.sqrt(ageDays);
      return { ...post, metrics: { likes, comments, shares, score } };
    }).sort((left, right) => right.metrics.score - left.metrics.score);

    return res.status(200).json({ connected: true, version, ads, posts, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Meta admin dashboard error", error);
    return res.status(502).json({ connected: false, error: error instanceof Error ? error.message : "No fue posible consultar Meta." });
  }
}
