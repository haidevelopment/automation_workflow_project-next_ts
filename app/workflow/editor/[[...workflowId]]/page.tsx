import { waitFor } from '@/lib/helper/waitFor';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import Editor from '../../_components/Editor';

export default async function page({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;
  const id = workflowId[0];
  const { userId } = await auth(); 
  if(!userId) {
     throw new Error("unauthenticated")
  }

  const workflow = await prisma.workflow.findUnique({
    where:{
        id,
        userId
    }
  });

  if(!workflow) {
    return <div>Workflow not found</div>
  }

  return <Editor workflow={workflow} />
}
