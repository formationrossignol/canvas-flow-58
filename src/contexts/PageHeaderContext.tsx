import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PageHeaderContextValue {
  title: string;
  action: ReactNode;
  setTitle: (t: string) => void;
  setAction: (a: ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  title: '',
  action: null,
  setTitle: () => {},
  setAction: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [action, setAction] = useState<ReactNode>(null);
  return (
    <PageHeaderContext.Provider value={{ title, action, setTitle, setAction }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  return useContext(PageHeaderContext);
}

export function PageTitle({ title, action }: { title: string; action?: ReactNode }) {
  const { setTitle, setAction } = usePageHeader();
  useEffect(() => {
    setTitle(title);
    setAction(action ?? null);
    return () => { setTitle(''); setAction(null); };
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
