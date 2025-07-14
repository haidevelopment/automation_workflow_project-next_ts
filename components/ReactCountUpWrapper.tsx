"use client"
import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
function ReactCountUpWrapper({ value }: { value: number }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) {
        return "-";
    }
    return <CountUp duration={2} end={value} decimals={0} preserveValue  />
}

export default ReactCountUpWrapper
