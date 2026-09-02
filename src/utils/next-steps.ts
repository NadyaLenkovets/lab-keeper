import type { JourneyReport } from '@/utils/build-report'

export type NextStepRecommendation = {
  title: string
  why: string
  action: string
}

export type NextStepsPayload = {
  summary: string
  recommendations: NextStepRecommendation[]
}

/** Локальные рекомендации по слабым блокам — без API. */
export function buildLocalNextSteps(report: JourneyReport): NextStepsPayload {
  const ranked = [...report.blocks].sort((a, b) => a.percent - b.percent)
  const weak = ranked.filter((b) => b.percent < 100).slice(0, 3)
  const strong = ranked.filter((b) => b.percent >= 80)

  if (weak.length === 0) {
    return {
      summary:
        'Отличный результат: все блоки закрыты уверенно. Имеет смысл углубить тему на практике или сгенерировать новое путешествие по смежной теме.',
      recommendations: [
        {
          title: 'Закрепить на своём примере',
          why: 'Высокий процент по всем блокам.',
          action:
            'Сформулируйте 3 рабочих правила «на каждый день» по теме journey и проверьте их на реальном кейсе.',
        },
        {
          title: 'Новое путешествие рядом',
          why: 'Материал усвоен — расширяем карту знаний.',
          action:
            'На экране создания задайте смежную тему (на один шаг сложнее) и пройдите короткий journey.',
        },
      ],
    }
  }

  const recommendations: NextStepRecommendation[] = weak.map((block) => {
    const missed = block.rows.filter(
      (r) =>
        !r.result ||
        r.result.status === 'incorrect' ||
        r.result.status === 'timeout' ||
        r.result.status === 'partial' ||
        r.result.status === 'skipped',
    )
    const hint =
      missed[0]?.result?.feedback?.slice(0, 120) ||
      `фокус на концепции «${block.checkpoint.concept}»`

    return {
      title: `Подтянуть: ${block.checkpoint.title}`,
      why: `Блок набран на ${block.percent}% (${block.score.toFixed(1)}/${block.maxScore}). ${hint}`,
      action: `Перечитайте смысл «${block.checkpoint.concept}», своими словами запишите определение и один практический пример, затем повторите похожие задания.`,
    }
  })

  if (strong.length > 0 && recommendations.length < 3) {
    recommendations.push({
      title: 'Опереться на сильную зону',
      why: `Хорошо получается: ${strong
        .slice(0, 2)
        .map((b) => b.checkpoint.title)
        .join(', ')}.`,
      action:
        'Объясните слабому блоку связь с тем, что уже понятно: «мост» между сильной и слабой концепцией в 4–5 предложениях.',
    })
  }

  const weakTitles = weak.map((b) => b.checkpoint.title).join(', ')
  return {
    summary: `Итог ${report.percent}%. В первую очередь стоит вернуться к: ${weakTitles}.`,
    recommendations,
  }
}
