import { cloneElement, isValidElement, type ReactNode } from 'react';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';

import { useLanguage } from '@/contexts/language-context';

function localizeNode(node: ReactNode, translate: (text: string) => string): ReactNode {
  if (typeof node === 'string') return translate(node);
  if (Array.isArray(node)) return node.map((child) => localizeNode(child, translate));
  if (isValidElement<{ children?: ReactNode }>(node) && node.props.children !== undefined) {
    return cloneElement(node, {}, localizeNode(node.props.children, translate));
  }
  return node;
}

export function LocalizedText({ children, accessibilityLabel, ...props }: TextProps) {
  const { t } = useLanguage();

  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}>
      {localizeNode(children, t)}
    </NativeText>
  );
}

export function LocalizedTextInput({ placeholder, accessibilityLabel, ...props }: TextInputProps) {
  const { t } = useLanguage();

  return (
    <NativeTextInput
      {...props}
      accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
      placeholder={placeholder ? t(placeholder) : undefined}
    />
  );
}
