import catalogue from '../../media-library/catalogue.json';

export type ArtworkCategory = 'political' | 'palestine' | 'others';
export interface ArchiveArtwork { id: string; category: ArtworkCategory; observation: string; }

const movedToPolitical = new Set(['img-0004', 'img-0010', 'img-0012', 'img-0020', 'img-0079', 'img-0081', 'img-0090', 'img-0091']);

export const artworkArchive: ArchiveArtwork[] = catalogue.flatMap((work) => {
  const category: ArtworkCategory | null = work.category === 'palestine' ? 'palestine' : movedToPolitical.has(work.id) || work.category === 'political' ? 'political' : work.category === 'others' ? 'others' : null;
  return category ? [{ id: work.id, category, observation: work.observation }] : [];
});

export const artworksFor = (category: ArtworkCategory) => artworkArchive.filter((work) => work.category === category);
