interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

// todo create a disabled state


export const Button = ({className, children, ...props}: ButtonProps) => {

  return (
    <button
    disabled={props.disabled}
    className={`${className} inline-block py-2 px-4 rounded-lg focus:outline-none focus:ring-3 focus:ring-offset-2 uppercase tracking-wider font-semibold text-sm sm:text-base`}
    {...props}
    >{children}</button>
  )
}

export const ButtonPrimary = ({className, children, ...props}: ButtonProps) => {
  return (
    <Button  className={`bg-brand hover:bg-hover focus:ring-brand active:bg-active text-white ${className}`} {...props}>{children}</Button>
  )
}

export const ButtonSecondary = ({className, children, ...props}: ButtonProps) => {
  return (
     <Button  className={`bg-gray-300 hover:bg-gray-200 focus:ring-gray-300/50 active:bg-gray-400 text-gray-800 ${className}`} {...props}>{children}</Button>
  )
}