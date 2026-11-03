const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    disabled = false,
    onClick,
    fullWidth = false,
    className = '',
}) => {
    const baseStyles =
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
        primary:
            'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
        secondary:
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-500',
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {children}
        </button>
    )
}

export default Button