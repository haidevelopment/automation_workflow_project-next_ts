"use client";
import { ParamsProps } from '@/types/appNode';
import React from 'react'

function BrowserInstanceParam({param}:ParamsProps) {
  return (
    <p className='text-xs '>
      {param.name}
    </p>
  )
}

export default BrowserInstanceParam
