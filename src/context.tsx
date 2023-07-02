import { createContext, useContext } from 'react';
import { CheckboxTreeProviderProps, NodeId, UserCheckBoxTreeReturnType } from './types';

const CheckboxTreeContext = createContext<UserCheckBoxTreeReturnType<any> | null>(null);
export const useCheckboxTreeContext = () => useContext(CheckboxTreeContext);

export const CheckboxTreeProvider = <T extends NodeId>({ children, ...props }: CheckboxTreeProviderProps<T>) => {
  return <CheckboxTreeContext.Provider value={props}>{children}</CheckboxTreeContext.Provider>;
};
