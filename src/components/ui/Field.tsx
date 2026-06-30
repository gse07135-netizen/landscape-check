import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 폼 필드 공용 컴포넌트 모음.
 * 라벨 + 입력 + 도움말/오류 메시지를 일관된 레이아웃으로 묶는다.
 */

interface FieldWrapProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

function FieldWrap({ label, htmlFor, required, hint, error, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-unfit">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-unfit-strong">{error}</p>
      ) : (
        hint && <p className="text-xs leading-relaxed text-ink-subtle">{hint}</p>
      )}
    </div>
  );
}

const inputBase =
  'h-9 w-full rounded-md border bg-surface px-3 text-sm text-ink ' +
  'placeholder:text-ink-subtle/60 outline-none transition ' +
  'focus:border-brand focus:ring-2 focus:ring-brand/25';

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  hint?: ReactNode;
  error?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength,
  hint,
  error,
}: TextFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id} required={required} hint={hint} error={error}>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, error ? 'border-unfit' : 'border-border')}
      />
    </FieldWrap>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
  unit?: string;
  hint?: ReactNode;
  error?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  min,
  step,
  unit,
  hint,
  error,
}: NumberFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id} required={required} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          min={min}
          step={step}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === '' ? null : Number(raw));
          }}
          className={cn(
            inputBase,
            unit && 'pr-12',
            error ? 'border-unfit' : 'border-border',
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            {unit}
          </span>
        )}
      </div>
    </FieldWrap>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: ReactNode;
  error?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  hint,
  error,
}: SelectFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id} required={required} hint={hint} error={error}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputBase,
          'appearance-none disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-unfit' : 'border-border',
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}
