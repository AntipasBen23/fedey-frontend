import type { BrandMemoryProfile } from "@/lib/contracts/brand-memory";

type BrandMemoryPanelProps = {
  profile: BrandMemoryProfile;
  onSave: (formData: FormData) => Promise<void>;
};

export function BrandMemoryPanel({ profile, onSave }: BrandMemoryPanelProps) {
  return (
    <section className="card brand-card">
      <header className="section-header">
        <h2>Brand Memory</h2>
        <p>The identity the agent should sound like, protect, and optimize for.</p>
      </header>
      <form className="brand-form" action={onSave}>
        <label>
          Brand Name
          <input type="text" name="brandName" defaultValue={profile.brandName} required />
        </label>
        <label>
          Tone
          <textarea name="tone" rows={3} defaultValue={profile.tone} required />
        </label>
        <label>
          Audience
          <textarea name="audience" rows={3} defaultValue={profile.audience} required />
        </label>
        <label>
          Content Pillars
          <input
            type="text"
            name="pillars"
            defaultValue={profile.pillars.join(", ")}
            placeholder="AI agents, growth systems, automation"
          />
        </label>
        <label>
          Guardrails
          <input
            type="text"
            name="guardrails"
            defaultValue={profile.guardrails.join(", ")}
            placeholder="No spam, no fake claims, no off-brand slang"
          />
        </label>
        <p className="memory-meta">
          Last updated: {new Date(profile.updatedAt).toLocaleString()}
        </p>
        <button type="submit">Save Brand Memory</button>
      </form>
    </section>
  );
}
