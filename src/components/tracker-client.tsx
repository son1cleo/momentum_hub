"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { Skill, SkillStatus } from "@prisma/client";
import { fmtDate } from "@/lib/date";

type Props = {
  initialSkills: Skill[];
  mode: "OWNER" | "VISITOR";
};

type SerializableSkill = Omit<Skill, "createdAt" | "completedAt" | "targetDate"> & {
  createdAt: string;
  completedAt: string | null;
  targetDate: string | null;
};

function parseSkill(input: SerializableSkill): Skill {
  return {
    ...input,
    createdAt: new Date(input.createdAt),
    completedAt: input.completedAt ? new Date(input.completedAt) : null,
    targetDate: input.targetDate ? new Date(input.targetDate) : null,
  };
}

function upsertSkillById(list: Skill[], skill: Skill, tempId?: string) {
  return list.map((item) => {
    if (tempId && item.id === tempId) return skill;
    if (item.id === skill.id) return skill;
    return item;
  });
}

export function TrackerClient({ initialSkills, mode }: Props) {
  const [pending, startTransition] = useTransition();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [syncStatus, setSyncStatus] = useState("Live sync active");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncSkills = async () => {
    try {
      const res = await fetch("/api/skills", { method: "GET", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { skills: SerializableSkill[] };
      setSkills(data.skills.map(parseSkill));
      setSyncStatus("Live sync active");
    } catch {
      setSyncStatus("Sync delayed - retrying");
    }
  };

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (!alive) return;
      await syncSkills();
    };
    void tick();
    const timer = setInterval(() => {
      void tick();
    }, 12000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const groups = useMemo(() => {
    return {
      inProgress: skills.filter((s) => s.status === "IN_PROGRESS"),
      completed: skills.filter((s) => s.status === "COMPLETED"),
    };
  }, [skills]);

  const onCreate = () => {
    setError(null);
    if (mode !== "OWNER") {
      setError("Visitor mode is read-only.");
      return;
    }

    const optimistic = {
      id: `optimistic-${Date.now()}`,
      userId: "",
      title,
      category,
      status: "IN_PROGRESS" as SkillStatus,
      pinned,
      createdAt: new Date(),
      completedAt: null,
      targetDate: targetDate ? new Date(targetDate) : null,
      notes: null,
    } as Skill;

    startTransition(async () => {
      setSkills((prev) => [optimistic, ...prev]);
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, targetDate, pinned }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not add skill");
        setSkills((prev) => prev.filter((item) => item.id !== optimistic.id));
      } else {
        const saved = parseSkill((await res.json()) as SerializableSkill);
        setSkills((prev) => upsertSkillById(prev, saved, optimistic.id));
        setTitle("");
        setCategory("");
        setTargetDate("");
        setPinned(false);
        void syncSkills();
      }
    });
  };

  const onComplete = (id: string) => {
    if (mode !== "OWNER") return;
    const snapshot = skills;
    startTransition(async () => {
      setSkills((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "COMPLETED" as SkillStatus, completedAt: new Date() } : item,
        ),
      );
      const res = await fetch(`/api/skills/${id}/complete`, { method: "PATCH" });
      if (!res.ok) {
        setSkills(snapshot);
        setError("Could not complete skill");
        return;
      }
      const saved = parseSkill((await res.json()) as SerializableSkill);
      setSkills((prev) => upsertSkillById(prev, saved));
      void syncSkills();
    });
  };

  const onPin = (id: string, nextPinned: boolean) => {
    if (mode !== "OWNER") return;
    const snapshot = skills;
    startTransition(async () => {
      setSkills((prev) =>
        prev.map((item) => (item.id === id ? { ...item, pinned: nextPinned } : item)),
      );
      const res = await fetch(`/api/skills/${id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: nextPinned }),
      });
      if (!res.ok) {
        setSkills(snapshot);
        setError("Could not update pin state");
        return;
      }
      const saved = parseSkill((await res.json()) as SerializableSkill);
      setSkills((prev) => upsertSkillById(prev, saved));
      void syncSkills();
    });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Add Commitment</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Skill title"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          <button
            onClick={onCreate}
            disabled={pending}
            className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Pin immediately
        </label>
        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-1 text-xs text-zinc-400">{syncStatus}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkillGroup title="In Progress" items={groups.inProgress} onComplete={onComplete} onPin={onPin} />
        <SkillGroup title="Completed" items={groups.completed} onComplete={onComplete} onPin={onPin} />
      </div>
    </section>
  );
}

function SkillGroup({
  title,
  items,
  onComplete,
  onPin,
}: {
  title: string;
  items: Skill[];
  onComplete: (id: string) => void;
  onPin: (id: string, nextPinned: boolean) => void;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-zinc-800 bg-zinc-950/90 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                <p className="text-xs text-zinc-400">{item.category} • target {fmtDate(item.targetDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.status === "IN_PROGRESS" ? (
                  <button
                    onClick={() => onComplete(item.id)}
                    className="rounded-md border border-emerald-500/50 px-2 py-1 text-xs text-emerald-200"
                  >
                    Complete
                  </button>
                ) : null}
                <button
                  onClick={() => onPin(item.id, !item.pinned)}
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200"
                >
                  {item.pinned ? "Unpin" : "Pin"}
                </button>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </article>
  );
}
