"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type EmojiOption = { value: string; label: string; emoji?: string };

export const CATEGORY_EMOJIS: EmojiOption[] = [
  { value: "groceries", emoji: "🛒", label: "Groceries / Food" },
  { value: "restaurants", emoji: "🍽️", label: "Restaurants & Cafes" },
  { value: "coffee", emoji: "☕", label: "Coffee & Snacks" },
  { value: "transport", emoji: "🚌", label: "Transport" },
  { value: "car", emoji: "🚗", label: "Car & Fuel" },
  { value: "housing", emoji: "🏠", label: "Rent & Housing" },
  { value: "utilities", emoji: "💡", label: "Utilities & Bills" },
  { value: "internet", emoji: "📶", label: "Internet & Mobile" },
  { value: "kids", emoji: "🧸", label: "Kids" },
  { value: "education", emoji: "📚", label: "Education" },
  { value: "health", emoji: "🩺", label: "Health & Medicine" },
  { value: "beauty", emoji: "💅", label: "Beauty & Care" },
  { value: "clothes", emoji: "👕", label: "Clothes & Shoes" },
  { value: "entertainment", emoji: "🎬", label: "Entertainment" },
  { value: "hobbies", emoji: "🎨", label: "Hobbies & Creativity" },
  { value: "sport", emoji: "🏋️‍♀️", label: "Sport & Fitness" },
  { value: "travel", emoji: "✈️", label: "Travel" },
  { value: "gifts", emoji: "🎁", label: "Gifts & Holidays" },
  { value: "pets", emoji: "🐾", label: "Pets" },
  { value: "tech", emoji: "💻", label: "Electronics & Gadgets" },
  { value: "subscriptions", emoji: "📺", label: "Subscriptions" },
  { value: "home_goods", emoji: "🛋️", label: "Home & Furniture" },
  { value: "savings", emoji: "💰", label: "Savings & Investments" },
  { value: "taxes", emoji: "📄", label: "Taxes & Fees" },
  { value: "other", emoji: "🧩", label: "Other" },
];

export const PAYMENT_TYPE_EMOJIS: EmojiOption[] = [
  { value: "cash", emoji: "💵", label: "Cash" },
  { value: "debit_card", emoji: "💳", label: "Debit card" },
  { value: "credit_card", emoji: "🧾", label: "Credit card" },
  { value: "bank_transfer", emoji: "🏦", label: "Bank transfer" },
  { value: "online_wallet", emoji: "🌐", label: "Online wallet" },
  { value: "mobile_pay", emoji: "📱", label: "Mobile pay" },
  { value: "savings_account", emoji: "🏦", label: "Savings account" },
  { value: "loan", emoji: "📉", label: "Loan / Credit" },
  { value: "employer_card", emoji: "💼", label: "Work / Employer card" },
  { value: "gift_card", emoji: "🎟️", label: "Gift card" },
  { value: "bonus_points", emoji: "✨", label: "Bonuses / Points" },
  { value: "crypto", emoji: "🪙", label: "Crypto" },
];

export type EmojiPickerProps = FieldProps & {
  value: string;
  onChange: (value: string) => void;
  options?: EmojiOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onChange,
  options = CATEGORY_EMOJIS,
  disabled,
  label,
  hint,
  error,
  placeholder = "Pick an emoji",
  className,
  id,
}) => {
  const fieldId = React.useId();
  const inputId = id ?? fieldId;
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const normalizedValue = value?.trim() ?? "";
  const selectedOption = React.useMemo(() => {
    if (!normalizedValue) return null;
    return options.find(
      (option) =>
        normalizedValue === option.value ||
        normalizedValue === (option.emoji ?? option.value)
    );
  }, [normalizedValue, options]);
  const previewEmoji =
    selectedOption?.emoji ?? selectedOption?.value ?? (normalizedValue || "🙂");
  const previewLabel =
    selectedOption?.label ?? (normalizedValue ? "Selected emoji" : placeholder);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (
        event.target instanceof Node &&
        containerRef.current.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleSelect = (option: EmojiOption) => {
    if (disabled) return;
    const nextValue = option.emoji ?? option.value;
    onChange(nextValue);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handleClear = () => {
    if (disabled) return;
    onChange("");
    setOpen(false);
  };

  return (
    <FieldWrapper label={label} hint={hint} error={error} id={inputId}>
      <div ref={containerRef} className={cn("relative", className)}>
        <button
          type="button"
          id={inputId}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-left text-sm",
            tokens.focusButton,
            tokens.disabled
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggleOpen}
          disabled={disabled}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--border))] bg-white/80 text-xl">
              {previewEmoji}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[hsl(var(--fg))]">{previewLabel}</span>
              {selectedOption && (
                <span className="text-[0.7rem] text-[hsl(var(--fg-muted))]">
                  {selectedOption.label}
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[hsl(var(--fg-muted))] transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        {open && (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-72 space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xl">
            <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.2em] text-[hsl(var(--fg-muted))]">
              <span>Emojis</span>
              {normalizedValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs normal-case text-[hsl(var(--fg-muted))] underline-offset-4 hover:text-[hsl(var(--fg))]"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-2">
              {options.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {options.map((option) => {
                    const displayEmoji = option.emoji ?? option.value;
                    const isActive =
                      normalizedValue === displayEmoji ||
                      normalizedValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        title={option.label}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "flex h-12 flex-col items-center justify-center rounded-lg border border-transparent bg-white/60 text-xl transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]",
                          isActive
                            ? "border-[hsl(var(--color-primary))]"
                            : "hover:border-[hsl(var(--border))]",
                          tokens.disabled
                        )}
                        aria-pressed={isActive}
                        disabled={disabled}
                      >
                        <span>{displayEmoji}</span>
                        <span className="text-[0.65rem] text-[hsl(var(--fg-muted))]">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-[hsl(var(--fg-muted))]">
                  No emojis available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};
