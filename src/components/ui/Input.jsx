const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  inputMode,
}) => {
  const inputStyles = `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A69D92] ${
    error
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-[#E4DCCE] hover:border-[#C9B9A7] focus:border-[#B3261E] focus:ring-2 focus:ring-[#D78B7F]/20"
  }`;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-[#6B6258]"
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
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
