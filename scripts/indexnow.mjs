// Notify IndexNow-participating engines (Bing, Yandex, Seznam, Naver) about changed URLs.
// Usage: node scripts/indexnow.mjs [url ...]   (no args = every URL in the live sitemap)
// Run after a production deploy that created, updated or deleted pages. Do not run on every build.
const HOST = "www.myloginn.com";
const KEY = "d1694b67995b4f958c5e35c01b651ca2";
let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: submitted ${urls.length} URL(s) -> HTTP ${res.status}`);
