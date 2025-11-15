import React, { useState, useRef, useEffect } from "react";

interface CurrencyOption {
  currency_code: string;
  currency_name: string;
}

interface CurrencySelectProps {
  currencies: CurrencyOption[];
  selectedCurrency: string;
  onChange: (currencyCode: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
  currencies,
  selectedCurrency,
  onChange,
  loading = false,
  placeholder = "Select Currency",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCurrencies = currencies.filter((currency) =>
    `${currency.currency_code} ${currency.currency_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={`border border-gray-300 rounded-lg px-4 py-2 bg-white cursor-pointer ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (!loading) setOpen((prev) => !prev);
        }}
      >
        {selectedCurrency
          ? `${selectedCurrency} - ${
              currencies.find((c) => c.currency_code === selectedCurrency)
                ?.currency_name || ""
            }`
          : placeholder}
      </div>

      {open && !loading && (
        <div className="absolute z-20 bg-white border border-gray-300 rounded-lg mt-1 w-full shadow-md max-h-60 overflow-y-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currencies..."
            className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
          />
          {filteredCurrencies.length > 0 ? (
            filteredCurrencies.map((currency) => (
              <div
                key={currency.currency_code}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(currency.currency_code);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {currency.currency_code} - {currency.currency_name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;

