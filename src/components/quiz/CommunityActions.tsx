"use client";

import Link from "next/link";
import { useState } from "react";
import { FlagIcon, HeartIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/format";

// Beğenme ve şikayet 7. aşamada çalışır hale gelecek. Şimdilik giriş yapılmamış
// kullanıcıya gösterilecek uyarıyı gösterir.
export function CommunityActions({ likeCount }: { likeCount: number }) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setNotice("Beğenmek için giriş yapmalısın.")}>
          <HeartIcon className="size-4" />
          Beğen
          <span className="tabular-nums text-secondary">{formatNumber(likeCount)}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setNotice("Şikayet etmek için giriş yapmalısın.")}>
          <FlagIcon className="size-4" />
          Şikayet et
        </Button>
      </div>
      <p role="status" className="min-h-5 text-sm text-secondary">
        {notice && (
          <>
            {notice}{" "}
            <Link href="/login" className="text-accent-soft underline underline-offset-4 hover:text-primary">
              Giriş yap
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
