"use client";

import { useState } from "react";
import NameGate from "@/components/NameGate";
import PitchApp from "@/components/PitchApp";

export default function Home() {
  const [name, setName] = useState<string | null>(null);

  if (!name) {
    return <NameGate onNamed={setName} />;
  }

  return <PitchApp name={name} />;
}
