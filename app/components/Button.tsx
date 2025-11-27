import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: React.ReactNode
}

export default function Button({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500 hover:shadow-lg transform hover:-translate-y-0.5'
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
