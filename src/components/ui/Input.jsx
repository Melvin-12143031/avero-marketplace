
const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    autoComplete,
    inputMode,
}) => {
    const inputStyles = `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
        error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
    }`

    return (
        <div>
            <label
                htmlFor={name}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                className={inputStyles}
            />

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}

export default Input
