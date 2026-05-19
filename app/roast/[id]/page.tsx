import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoast } from '@/lib/store';
import { RoastCard } from '@/app/components/RoastCard';

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getRoast(id);

  if (!roast) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-zinc-500 font-mono text-sm hover:text-zinc-300 transition-colors"
          >
            ← getroasted.wtf
          </Link>
        </div>

        <RoastCard data={roast} />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-zinc-500 font-mono text-xs hover:text-zinc-300 transition-colors"
          >
            roast another →
          </Link>
        </div>
      </div>
    </main>
  );
}
