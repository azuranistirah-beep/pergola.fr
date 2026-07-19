import React from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../lib/api.js";

export default function StaticPage() {
  const { slug } = useParams();
  const { data: page, loading } = useApi(`/api/pages/${slug}`, null);
  if (loading && !page) return <div className="shell" style={{ padding: 60 }}>…</div>;
  if (!page) return <div className="shell" style={{ padding: 60 }}><h2>404</h2></div>;
  return (
    <section className="section">
      <div className="shell page-head">
        <h1>{page.title}</h1>
      </div>
      <div className="shell prose">
        {(page.body || "").split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </section>
  );
}
