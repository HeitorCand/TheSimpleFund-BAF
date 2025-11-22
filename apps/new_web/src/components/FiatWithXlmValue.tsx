import React from 'react';
import { useXlmPrice } from '../hooks/useXlmPrice';

type Props = {
  amountUsd?: number | null;
  maximumFractionDigits?: number;
};

/**
 * Displays USD amount with XLM equivalent when the price is available.
 */
const FiatWithXlmValue: React.FC<Props> = ({ amountUsd, maximumFractionDigits = 2 }) => {
  const { price, loading, error } = useXlmPrice();

  if (amountUsd === undefined || amountUsd === null) return <span>-</span>;

  const usdFormatted = `$${amountUsd.toLocaleString(undefined, { maximumFractionDigits })}`;

  if (loading) {
    return <span>{usdFormatted} (loading XLM...)</span>;
  }

  if (!price || error) {
    return <span>{usdFormatted} (XLM unavailable)</span>;
  }

  const xlmValue = amountUsd / price;
  const xlmFormatted = `${xlmValue.toLocaleString(undefined, { maximumFractionDigits: 4 })} XLM`;

  return (
    <span>
      {usdFormatted} (~ {xlmFormatted})
    </span>
  );
};

export default FiatWithXlmValue;
