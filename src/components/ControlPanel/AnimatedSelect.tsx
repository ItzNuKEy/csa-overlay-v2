import { useState, useRef, useEffect } from "react";

interface AnimatedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ key: string; label: string }>;
  className?: string;
}

export function AnimatedSelect({ value, onChange, options, className = "" }: AnimatedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.key === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsAnimating(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Start animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) {
      setIsAnimating(false);
      setTimeout(() => setIsOpen(false), 200); // Wait for fade out
    } else {
      setIsOpen(true);
    }
  };

  const handleSelect = (key: string) => {
    onChange(key);
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`
          input w-full shadow-lg/35
          flex items-center justify-between
          rounded-lg
          appearance-none
          ${className}
        `}
      >
        <span>{selectedOption?.label || "Select..."}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-1
            bg-base-100 border border-base-300 rounded-box
            shadow-lg
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
          `}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.key)}
                className={`
                  w-full text-left px-4 py-2
                  hover:bg-base-200
                  transition-colors duration-150
                  ${value === option.key ? "bg-base-200 font-semibold" : ""}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

