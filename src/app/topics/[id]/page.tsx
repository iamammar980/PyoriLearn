import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import TopicWorkspaceClient from '@/components/TopicWorkspaceClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TopicWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  const userId = decoded.id;

  // Query topic details
  const topic = await prisma.topic.findUnique({
    where: { id: Number(id) },
    include: {
      parent: {
        select: {
          title: true,
        },
      },
      materials: true,
      quizzes: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!topic) {
    redirect('/dashboard');
  }

  // Query progress
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_topicId: {
        userId,
        topicId: Number(id),
      },
    },
  });

  return (
    <TopicWorkspaceClient
      topic={topic}
      initialProgress={
        progress
          ? {
              completed: progress.completed,
              watchedVideo: progress.watchedVideo,
              quizScore: progress.quizScore,
            }
          : null
      }
    />
  );
}
