"use client";

import { useState } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { Loader } from "./Loader";
import { Nav } from "./Nav";
import { ForgeSequence } from "./ForgeSequence";
import { Merch } from "./Merch";
import { BindCard } from "./BindCard";
import { Footer } from "./Footer";

export function Experience() {
  const [ready, setReady] = useState(false);
  return (
    <SmoothScroll>
      <Loader onDone={() => setReady(true)} />
      <Nav show={ready} />
      <main>
        <ForgeSequence />
        <BindCard />
        <Merch />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
