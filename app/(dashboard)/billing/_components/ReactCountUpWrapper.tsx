"use client";

import React from "react";
import CountUp from "react-countup";

export default function ReactCountUpWrapper({ value }: { value: number }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "-";

  return (
    <CountUp
      duration={1}
      preserveValue
      end={value}
      decimal=","
      className="text-5xl font-black"
    />
  );
}
