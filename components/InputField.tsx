import { UseFormRegister, FieldError } from "react-hook-form"; // ← 1. import the real type

type InputFieldProps = {
  label: string;
  type?: string;
  register: UseFormRegister<any>; // ← 2. stop using unknown, but keep the prop name
  username: string;               // ← your original prop, untouched
  name: string;
  defaultValue?: string;
  error?: FieldError;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  username, // ← you keep it even if you don’t use it inside
  name,
  defaultValue,
  error,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className="w-full flex flex-col gap-2 ">
      <label className="text-xs text-gray-700">{label}</label>

      <input
        type={type}
        placeholder={name}
        {...register(name)} // ← 3. just pass the string, not an object
        className="w-full grid border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        {...inputProps}
        defaultValue={defaultValue}
      />

      {error?.message && (
        <span className="text-red-600 text-sm">{error.message.toString()}</span>
      )}
    </div>
  );
};

export default InputField;
