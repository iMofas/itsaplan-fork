import { useEffect } from 'react';

// Sets the browser tab title while the caller is mounted and puts the previous one
// back on unmount. null leaves the title to whoever set it before.
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title == null) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
