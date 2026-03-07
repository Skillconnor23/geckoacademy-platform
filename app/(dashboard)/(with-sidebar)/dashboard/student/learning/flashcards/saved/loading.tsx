import { GeckoLoader } from '@/components/ui/gecko-loader';

export default function SavedWordsLoading() {
  return (
    <section className="flex-1 min-h-[300px]">
      <GeckoLoader minHeight="min-h-[300px]" />
    </section>
  );
}
