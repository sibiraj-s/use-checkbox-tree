import { ReactNode, createContext, useContext } from 'react';
import { NodeId, UserCheckBoxTreeReturnType } from './types';

const CheckboxTreeContext = createContext<UserCheckBoxTreeReturnType<any> | null>(null);
export const useCheckboxTreeContext = () => useContext(CheckboxTreeContext);

type CheckboxTreeProviderProps<T extends NodeId> = UserCheckBoxTreeReturnType<T> & {
  children: ReactNode | ReactNode[];
};

export const CheckboxTreeProvider = <T extends NodeId>({ children, ...props }: CheckboxTreeProviderProps<T>) => {
  return <CheckboxTreeContext.Provider value={props}>{children}</CheckboxTreeContext.Provider>;
};
