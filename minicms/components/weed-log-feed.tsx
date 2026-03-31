"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { WeedLogSummary } from "@/lib/weed-logs";
import { weedTypeOptions } from "@/lib/validation/weed-log";

import { WeedLogCard } from "@/components/weed-log-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WeedLogFeedProps = {
  weedLogs: WeedLogSummary[];
  query: string;
  selectedTag: string;
  selectedType: string;
  total: number;
};

export function WeedLogFeed({
  weedLogs,
  query,
  selectedTag,
  selectedType,
  total,
}: WeedLogFeedProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tags = Array.from(
    new Map(weedLogs.flatMap((weedLog) => weedLog.tags.map((tag) => [tag.slug, tag] as const))).values(),
  );
  const tagOptions =
    selectedTag !== "all" && !tags.some((tag) => tag.slug === selectedTag)
      ? [...tags, { id: selectedTag, name: selectedTag, slug: selectedTag }]
      : tags;

  function updateSearchParams(nextQuery: string, nextTag: string, nextType: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      params.set("query", nextQuery.trim());
    } else {
      params.delete("query");
    }

    if (nextTag !== "all") {
      params.set("tag", nextTag);
    } else {
      params.delete("tag");
    }

    if (nextType !== "all") {
      params.set("type", nextType);
    } else {
      params.delete("type");
    }

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-[color:var(--border-strong)] bg-[color:var(--surface)] p-4 shadow-[0_16px_40px_-30px_rgba(44,71,43,0.16)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Latest posts</h2>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Browse recent community logs.
            </p>
          </div>
          <span className="rounded-full bg-[color:var(--surface-elevated)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            {total > weedLogs.length ? `${weedLogs.length} of ${total}` : total} showing
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <Input
            value={query}
            onChange={(event) => {
              updateSearchParams(event.target.value, selectedTag, selectedType);
            }}
            placeholder="Search strain, title, notes, or user"
            aria-label="Search weed logs"
          />
          <Select
            value={selectedType}
            onValueChange={(value) => updateSearchParams(query, selectedTag, value)}
          >
            <SelectTrigger aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {weedTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedTag}
            onValueChange={(value) => updateSearchParams(query, value, selectedType)}
          >
            <SelectTrigger aria-label="Filter by tag">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tagOptions.map((tag) => (
                <SelectItem key={tag.id} value={tag.slug}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {weedLogs.length > 0 ? (
        <div className="space-y-5">
          {weedLogs.map((weedLog) => (
            <WeedLogCard key={weedLog.id} weedLog={weedLog} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center">
          <h2 className="text-xl font-semibold">No logs match these filters</h2>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            Try a different search, tag, or type.
          </p>
        </div>
      )}
    </div>
  );
}
