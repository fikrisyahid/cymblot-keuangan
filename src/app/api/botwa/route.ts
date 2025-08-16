import prisma from '@/utils/db';

// Personal API for my WhatsApp bot, for easier input
export async function POST(request: Request) {
  const { description, value } = await request.json();

  try {
    await prisma.transaction.create({
      data: {
        date: new Date(),
        email: process.env.NEXT_PUBLIC_PERSONAL_EMAIL || '',
        value: +value,
        information: description,
        type: 'DEPOSIT',
        categoryId: 'cmeeof89d0000l5047fh9j3u4',
        pocketId: 'cm1l616mo000bm8r4ebmzyw3q',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: 500,
      }),
    );
  }

  return new Response(
    JSON.stringify({
      status: 200,
    }),
  );
}
