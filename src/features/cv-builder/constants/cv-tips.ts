import i18n from '@/i18n';

export type CVTip = {
  id: string;
  title: string;
  body: string;
};

const CV_TIP_IDS = ['summary', 'experience', 'skills', 'length', 'proofread'] as const;

export function getCVTips(): CVTip[] {
  return CV_TIP_IDS.map((id) => ({
    id,
    title: i18n.t(`cvBuilder.tips.${id}.title`),
    body: i18n.t(`cvBuilder.tips.${id}.body`),
  }));
}

export function getRotatingTips(): string[] {
  return getCVTips().map((tip) => tip.body);
}
