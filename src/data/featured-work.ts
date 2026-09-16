import type { TranslationKey } from '../i18n';

export type Work = {
  image: string;
  section: 'rural' | 'palestine' | 'publications';
  title: TranslationKey;
  alt: TranslationKey;
  note?: TranslationKey;
};

export const featuredWork: Work[] = [
  { image: '/media/img-0001.jpg', section: 'rural', title: 'Rural healthcare', alt: 'An illustration of a healthcare consultation in a rural setting.' },
  { image: '/media/img-0005.jpg', section: 'rural', title: 'Care in the forest', alt: 'An illustration of a woman in a red forest, made for a women’s health series.' },
  { image: '/media/img-0007.jpg', section: 'rural', title: 'Justice', alt: 'An illustration of Bilkis Bano with scales of justice.' },
  { image: '/media/img-0014.jpg', section: 'rural', title: 'Farmers, wheat and locusts', alt: 'An illustration of farmers, wheat and locusts.' },
  { image: '/media/img-0017.jpg', section: 'rural', title: 'Barricades', alt: 'An illustration of farmers, barricades and kites.' },
  { image: '/media/img-0243.jpg', section: 'rural', title: 'Crossing the barricade', alt: 'An illustration of farmers crossing police barricades.' },
  { image: '/media/img-0066.jpg', section: 'palestine', title: 'Mourning', alt: 'An artwork showing a mourning mother and child over Palestinian flag colours.' },
  { image: '/media/img-0271.jpg', section: 'palestine', title: 'All Eyes on Rafah', alt: 'An artwork reading All Eyes on Rafah.' },
  { image: '/media/img-0089.jpg', section: 'palestine', title: 'Making Death and Life in Palestine', alt: 'The cover of Making Death and Life in Palestine: Social Reproduction in Settler Colonialism.', note: 'Cover art; publication credits remain with the book.' },
  { image: '/media/img-0090.jpg', section: 'publications', title: 'Sultana’s Sisters', alt: 'The cover of Sultana’s Sisters: Genre, Gender, and Genealogy in South Asian Muslim Women’s Fiction.', note: 'Cover art; publication credits remain with the book.' },
  { image: '/media/img-0120.jpg', section: 'publications', title: 'River valley', alt: 'A painted river valley under a crescent moon.' },
  { image: '/media/img-0517.jpg', section: 'publications', title: 'Bibir Darga', alt: 'Documentation photograph from the Bibir Darga exhibition discussion.', note: 'Exhibition documentation; photographer credit to be confirmed.' },
];
