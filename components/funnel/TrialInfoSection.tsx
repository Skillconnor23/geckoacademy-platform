'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Wallet, BookOpen, HelpCircle } from 'lucide-react';
import { TrialInfoDialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TRIAL_INFO_ITEMS = [
  {
    id: 'payment',
    label: 'Төлбөр',
    icon: Wallet,
    title: 'Төлбөр',
    body: `Туршилтын хичээл үнэгүй.

Туршилтын хичээлийн дараа ангиуд сар сараар төлбөртэй үргэлжилнэ.

• Жижиг групп
• Уугуул англи хэлтэй багш
• Сар сараар төлбөрөө төлнө

Урт хугацааны гэрээ шаардлагагүй.`,
  },
  {
    id: 'program',
    label: 'Хөтөлбөр',
    icon: BookOpen,
    title: 'Хөтөлбөр',
    body: `Сурагчид монгол сурагчдад зориулсан Gecko English хөтөлбөрөөр суралцана.

Хичээл бүрт:
• Ярианы дасгал
• Үгсийн сан болон дүрэм
• Идэвхтэй дасгал ажил
• Давтлага болон гэрийн даалгавар

Сурагчид англи хэлний түвшин ахих тусам дараагийн шат руу шилжинэ.`,
  },
  {
    id: 'how-lessons',
    label: 'Хэрхэн явагдах вэ',
    icon: HelpCircle,
    title: 'Хичээл хэрхэн явагдах вэ',
    body: `1. Үнэгүй туршилтын хичээлээ захиална
2. Багштайгаа уулзаж англиар дадлага хийнэ
3. Өөрт тохирох түвшний зөвлөмж авна
4. Жижиг групп ангид элсэж эхэлнэ

Хичээлүүд ихэвчлэн амралтын өдрүүдэд долоо хоногт 2 удаа орно.

Эцэг эх хүсвэл туршилтын хичээлийг ажиглаж болно.`,
  },
] as const;

function InfoItemCard({
  item,
  onClick,
}: {
  item: (typeof TRIAL_INFO_ITEMS)[number];
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 flex-1 min-h-[44px] py-2 px-2',
        'rounded-lg border border-slate-200/60 bg-slate-50/50',
        'hover:border-slate-300 hover:bg-slate-100/80 active:bg-slate-200/60',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7daf41]/40 focus-visible:ring-offset-1',
        'min-w-0 touch-manipulation'
      )}
      aria-label={item.label}
    >
      <Icon className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
      <span className="text-[11px] sm:text-xs font-medium text-slate-600 text-center leading-tight truncate min-w-0 flex-1">
        {item.label}
      </span>
    </button>
  );
}

function ModalBody({ body }: { body: string }) {
  const paragraphs = body.trim().split(/\n\n+/);
  return (
    <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
      {paragraphs.map((p, i) => {
        const isBullet = p.trim().startsWith('•') || /^\d+\./.test(p.trim());
        if (isBullet) {
          const items = p
            .split('\n')
            .map((line) => line.replace(/^[•\d.]\s*/, '').trim())
            .filter(Boolean);
          return (
            <ul key={i} className="list-none space-y-1.5 pl-0">
              {items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-[#7daf41] shrink-0" aria-hidden>
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{p}</p>;
      })}
    </div>
  );
}

export function TrialInfoSection() {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const currentItem = TRIAL_INFO_ITEMS.find((i) => i.id === openId);

  const isConfirmed = pathname?.includes('/trial/confirmed') ?? false;
  const isPortal = pathname?.includes('/trial/portal') ?? false;
  if (isConfirmed || isPortal) return null;

  return (
    <>
      <div
        className="pt-3 pb-2 border-b border-slate-200/60 mb-4"
        role="region"
        aria-label="Дэлгэрэнгүй мэдээлэл"
      >
        <div className="grid grid-cols-3 gap-2">
          {TRIAL_INFO_ITEMS.map((item) => (
            <InfoItemCard
              key={item.id}
              item={item}
              onClick={() => setOpenId(item.id)}
            />
          ))}
        </div>
      </div>

      {currentItem && (
        <TrialInfoDialog
          open={!!openId}
          onOpenChange={(open) => !open && setOpenId(null)}
          title={currentItem.title}
          sheetOnMobile
        >
          <ModalBody body={currentItem.body} />
        </TrialInfoDialog>
      )}
    </>
  );
}
