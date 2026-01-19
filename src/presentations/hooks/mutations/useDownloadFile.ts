import { useMutation } from '@tanstack/react-query';

import { repositoryComposition } from '@/adapters/repositories';

interface DownloadPayload {
  id: string;
  fileName: string;
}

async function downloadFile({ id, fileName }: DownloadPayload) {
  const downloadUrl = await repositoryComposition.document.getDownloadUrl(id);
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error('ダウンロードに失敗しました');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);

  return { size: blob.size };
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: downloadFile,
  });
}
