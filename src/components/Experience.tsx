"use client";

import { useCallback, useState } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { Loader } from "./Loader";
import { Nav } from "./Nav";
import { ForgeSequence } from "./ForgeSequence";
import { Merch } from "./Merch";
import { BindCard } from "./BindCard";
import { Footer } from "./Footer";
import { DownloadModal } from "./DownloadModal";

export function Experience() {
  const [ready, setReady] = useState(false);
  const [download, setDownload] = useState(false);
  const closeDownload = useCallback(() => setDownload(false), []);
  return (
    <SmoothScroll>
      <Loader onDone={() => setReady(true)} onDownload={() => setDownload(true)} hold={download} />
      <Nav show={ready} onDownload={() => setDownload(true)} />
      <main>
        <ForgeSequence />
        <BindCard />
        <Merch />
      </main>
      <Footer />
      <DownloadModal open={download} onClose={closeDownload} restoreScroll={ready} />
    </SmoothScroll>
  );
}
