"use client";

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import Card from "@/components/Card/Card";
import AdminBackend from "@/utils/Backend/AdminBackend";
import ServerBackend, {type Data} from "@/utils/Backend/ServerBackend";

type ProgressStat = {
    label: string;
    description: string;
    href: string;
    data: {
        reviewed: number;
        predicted: number;
    };
    total: number;
};

function ProgressCard({label, description, href, data, total}: ProgressStat) {
    const reviewed = data?.reviewed ?? 0;
    const predicted = data?.predicted ?? 0;

    const reviewedPct = Math.min(100, (Number(reviewed) / Number(total)) * 100);
    const predictedPct = Math.min(100, ((Number(reviewed) + Number(predicted)) / Number(total)) * 100);

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">{label}</p>
                    <p className="text-sm text-text-secondary">{description}</p>
                </div>
                <Link
                    href={href}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-text-primary transition hover:border-text-secondary">
                    Open
                </Link>
            </div>

            <div className="space-y-1">
                <div className="relative h-3 overflow-hidden rounded-full bg-border/70">
                    <div
                        className="absolute inset-y-0 left-0 bg-accent-primary/25"
                        style={{width: `${predictedPct}%`}}
                    />
                    <div className="absolute inset-y-0 left-0 bg-accent-primary" style={{width: `${reviewedPct}%`}} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Reviewed {reviewed}</span>
                    <span>Predicted {predicted}</span>
                    <span>Total {total}</span>
                </div>
            </div>
        </Card>
    );
}

type AdminActivity = {
    username: string;
    created_at: Date;
    title: string;
} & ({genres: string[]} | {ner_result: any} | {is_music: boolean});

export default function Page() {
    const [stats, setStats] = useState<Data | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activity, setActivity] = useState<AdminActivity[]>([]);

    useEffect(() => {
        ServerBackend.getStats()
            .then(res => {
                if (!res.ok) {
                    setError(res.error ?? "Failed to load stats");
                    return;
                }
                setStats(res.data.data);
            })
            .catch(() => setError("Failed to load stats"))
            .finally(() => setLoading(false));
        AdminBackend.getAdminActivity()
            .then(res => {
                if (!res.ok) {
                    console.error("Failed to load admin activity:", res.error);
                    return;
                }
                setActivity(res.data.data);
            })
            .catch(err => console.error("Failed to load admin activity:", err));
    }, []);

    const progressCards = useMemo<ProgressStat[]>(() => {
        if (!stats) return [];
        return [
            {
                label: "Music Review",
                description: "Human verification of music videos",
                href: "/admin/music",
                data: stats.is_music,
                total: Number(stats.totalVideos),
            },
            {
                label: "Genre Review",
                description: "Assign genres to verified music",
                href: "/admin/genre",
                data: stats.genres,
                total: Number(stats.musicVideos),
            },
            {
                label: "NER Review",
                description: "Tag entities in titles and descriptions",
                href: "/admin/ner",
                data: stats.ner,
                total: Number(stats.musicVideos),
            },
        ];
    }, [stats]);

    return (
        <main className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Admin</p>
                    <h1 className="text-3xl font-semibold">Review Dashboard</h1>
                    <p className="text-sm text-text-secondary">
                        Jump into a queue or track how far reviews have progressed.
                    </p>
                </div>
                {stats ? (
                    <Card className="max-w-xs space-y-1">
                        <p className="text-sm text-text-secondary">Totals</p>
                        <p className="text-3xl font-semibold leading-tight">{stats.totalVideos}</p>
                        <p className="text-xs text-text-secondary">Videos in scope for review flows.</p>
                    </Card>
                ) : null}
            </div>

            {error ? (
                <Card className="text-sm text-rose-500">{error}</Card>
            ) : loading ? (
                <Card className="text-sm text-text-secondary">Loading server stats…</Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {progressCards.map(card => (
                        <ProgressCard key={card.label} {...card} />
                    ))}
                </div>
            )}
            <div>
                <h2 className="text-xl font-medium">Recent Admin Activity</h2>
                {activity.length === 0 ? (
                    <p className="text-sm text-text-secondary">No recent activity.</p>
                ) : (
                    <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
                        <ul className="space-y-2">
                            {activity.map((act, idx) => (
                                <li key={idx} className="rounded-lg border border-border p-3">
                                    <p className="text-sm">
                                        <span className="font-medium">{act.username}</span> reviewed{" "}
                                        <span className="font-medium">{act.title}</span>
                                    </p>

                                    <p className="text-xs text-text-secondary">
                                        {(() => {
                                            if ("ner_result" in act) {
                                                const entities = Array.isArray(act.ner_result)
                                                    ? act.ner_result.length
                                                    : act.ner_result && typeof act.ner_result === "object"
                                                      ? Object.keys(act.ner_result).length
                                                      : 0;
                                                return `NER entities: ${entities}`;
                                            }

                                            if ("is_music" in act) {
                                                return `Music review result: ${act.is_music ? "Music" : "Not music"}`;
                                            }

                                            if ("genres" in act) {
                                                return `Genre review result: ${act.genres.length ? act.genres.join(", ") : "No genres"}`;
                                            }

                                            return "";
                                        })()}
                                    </p>

                                    <p className="text-xs text-text-secondary">
                                        {new Date(act.created_at).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}
