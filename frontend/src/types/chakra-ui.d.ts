import '@chakra-ui/react'
import * as React from 'react'

// Add missing type declarations for Chakra UI
declare module '@chakra-ui/react' {
  // Test attribute interface for improved testing support
  // Type for responsive style props used in Chakra UI
  type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T } | (string & {});
  
  interface TestAttributes {
    'data-testid'?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-controls'?: string;
    'aria-hidden'?: boolean | 'true' | 'false';
    'role'?: string;
  }
  // Toast hook with more detailed types
  export interface UseToastOptions {
    title?: string;
    description?: string;
    status?: 'info' | 'warning' | 'success' | 'error';
    duration?: number;
    isClosable?: boolean;
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
    variant?: string;
    render?: (props: any) => React.ReactNode;
    onCloseComplete?: () => void;
  }

  export interface ToastId {
    id: string;
  }
  
  export interface UseToastReturn {
    (options: UseToastOptions): ToastId;
    close: (id: string) => void;
    closeAll: (options?: { positions?: string[] }) => void;
    update: (id: string, options: UseToastOptions) => void;
    isActive: (id: string) => boolean;
  }
  
  export const useToast: () => UseToastReturn;

  // Text alignment and display props
  export type TextAlignType = ResponsiveValue<'left' | 'right' | 'center' | 'justify' | string>;
  export type DisplayType = ResponsiveValue<'block' | 'flex' | 'inline' | 'inline-block' | 'grid' | 'none' | string>;
  export type FlexDirectionType = ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse' | string>;
  export type JustifyContentType = ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string>;
  export type AlignItemsType = ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | string>;
  export type PositionType = ResponsiveValue<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky' | string>;
  
  // Space props
  export type SpaceType = ResponsiveValue<number | string>;
  
  // Color props
  export type ColorType = ResponsiveValue<string>;
  
  // Size props
  export type SizeType = ResponsiveValue<number | string>;

  // Basic components
  export interface BoxProps extends React.HTMLAttributes<HTMLDivElement>, TestAttributes {
    textAlign?: TextAlignType;
    p?: SpaceType;
    px?: SpaceType;
    py?: SpaceType;
    pt?: SpaceType;
    pb?: SpaceType;
    pl?: SpaceType;
    pr?: SpaceType;
    m?: SpaceType;
    mx?: SpaceType;
    my?: SpaceType;
    mt?: SpaceType;
    mb?: SpaceType;
    ml?: SpaceType;
    mr?: SpaceType;
    bg?: ColorType;
    backgroundColor?: ColorType;
    color?: ColorType;
    width?: SizeType;
    height?: SizeType;
    minWidth?: SizeType;
    minHeight?: SizeType;
    maxWidth?: SizeType;
    maxHeight?: SizeType;
    display?: DisplayType;
    borderWidth?: SizeType;
    borderRadius?: SizeType;
    shadow?: string;
    boxShadow?: string;
    fontWeight?: string | number;
    fontSize?: SizeType;
    lineHeight?: SizeType;
    overflow?: string;
    overflowX?: string;
    overflowY?: string;
    position?: PositionType;
    top?: SizeType;
    bottom?: SizeType;
    left?: SizeType;
    right?: SizeType;
    zIndex?: number | string;
    flex?: number | string;
    flexDirection?: FlexDirectionType;
    justifyContent?: JustifyContentType;
    alignItems?: AlignItemsType;
    textDecoration?: string;
    children?: React.ReactNode;
    as?: React.ElementType;
  }

  export interface ButtonProps extends BoxProps {
    colorScheme?: string;
    variant?: string;
    size?: string;
    isFullWidth?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    type?: 'button' | 'submit' | 'reset';
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  }

  export interface SpinnerProps extends BoxProps {
    size?: string;
    color?: string;
    emptyColor?: string;
    thickness?: string;
    speed?: string;
  }

  export interface AlertProps extends BoxProps {
    status?: 'info' | 'warning' | 'success' | 'error';
    variant?: string;
  }

  export interface AlertTitleProps extends BoxProps {
    fontWeight?: string | number;
  }

  export interface AlertDescriptionProps extends BoxProps {}

  export interface TextProps extends BoxProps {}

  export interface VStackProps extends BoxProps {
    spacing?: number | string;
    align?: string;
  }

  // Card components
  export interface CardProps extends BoxProps {}
  export const Card: React.ComponentType<CardProps>;
  
  // Input components
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BoxProps {
    variant?: string;
    size?: string;
    isInvalid?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }
  export const Input: React.ComponentType<InputProps>;
  
  export interface FormControlProps extends BoxProps {
    isInvalid?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
    isReadOnly?: boolean;
  }
  export const FormControl: React.ComponentType<FormControlProps>;
  
  export interface FormLabelProps extends BoxProps {}
  export const FormLabel: React.ComponentType<FormLabelProps>;
  
  export interface FormErrorMessageProps extends BoxProps {}
  export const FormErrorMessage: React.ComponentType<FormErrorMessageProps>;
  
  // Flex components
  export interface FlexProps extends BoxProps {
    direction?: FlexDirectionType;
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | string;
    align?: AlignItemsType;
    justify?: JustifyContentType;
    gap?: SpaceType;
  }
  export const Flex: React.ComponentType<FlexProps>;
  
  // Divider
  export interface DividerProps extends BoxProps {
    orientation?: 'horizontal' | 'vertical';
  }
  export const Divider: React.ComponentType<DividerProps>;
  
  // Stack components
  export interface StackProps extends FlexProps {
    spacing?: number | string;
    direction?: FlexDirectionType;
  }
  export const Stack: React.ComponentType<StackProps>;
  export const HStack: React.ComponentType<StackProps>;
  
  // Export core components as React components with proper return types
  export const Box: React.ComponentType<BoxProps & { as?: React.ElementType<any> }>;
  export const Button: React.ComponentType<ButtonProps & { as?: React.ElementType<any> }>;
  export const Spinner: React.ComponentType<SpinnerProps & { as?: React.ElementType<any> }>;
  export const Alert: React.ComponentType<AlertProps & { as?: React.ElementType<any> }>;
  export const AlertTitle: React.ComponentType<AlertTitleProps & { as?: React.ElementType<any> }>;
  export const AlertDescription: React.ComponentType<AlertDescriptionProps & { as?: React.ElementType<any> }>;
  export const Text: React.ComponentType<TextProps & { as?: React.ElementType<any> }>;
  export const VStack: React.ComponentType<VStackProps & { as?: React.ElementType<any> }>;
  
  // Extend with additional components as needed
}
