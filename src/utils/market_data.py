"""
Market Data Utility Module
Provides real-time stock price data for Finance Guru system
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import yfinance as yf
from pydantic import BaseModel


class PriceData(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    timestamp: str


def get_price(symbol: str) -> PriceData:
    """
    Get current price for a single stock symbol

    Args:
        symbol: Stock ticker symbol (e.g., 'TSLA', 'PLTR')

    Returns:
        PriceData: Object containing price information with symbol, price,
                   change, change_percent, and timestamp
    """
    ticker = yf.Ticker(symbol)
    info = ticker.info

    current_price = info.get('currentPrice') or info.get('regularMarketPrice', 0)
    previous_close = info.get('previousClose', 0)
    change = current_price - previous_close
    change_percent = (change / previous_close * 100) if previous_close else 0

    return PriceData(
        symbol=symbol.upper(),
        price=round(current_price, 2),
        change=round(change, 2),
        change_percent=round(change_percent, 2),
        timestamp=datetime.now().isoformat()
    )


def get_prices(symbols: List[str]) -> Dict[str, PriceData]:
    """
    Get current prices for multiple stock symbols

    Args:
        symbols: List of stock ticker symbols

    Returns:
        Dict mapping symbols to their price data
    """
    return {symbol: get_price(symbol) for symbol in symbols}


def get_option_chain(symbol: str, expiration: Optional[str] = None) -> Dict[str, Any]:
    """
    Get option chain data for a symbol

    Args:
        symbol: Stock ticker symbol
        expiration: Expiration date (YYYY-MM-DD), or None for nearest expiration

    Returns:
        Dict with calls and puts data
    """
    ticker = yf.Ticker(symbol)

    if expiration is None:
        expiration = ticker.options[0]  # Get nearest expiration

    opt = ticker.option_chain(expiration)

    return {
        'expiration': expiration,
        'calls': opt.calls.to_dict('records'),
        'puts': opt.puts.to_dict('records')
    }


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python market_data.py SYMBOL [SYMBOL2 ...]")
        sys.exit(1)

    symbols = sys.argv[1:]

    if len(symbols) == 1:
        data = get_price(symbols[0])
        print(f"{data.symbol}: ${data.price} ({data.change:+.2f}, {data.change_percent:+.2f}%)")
    else:
        data = get_prices(symbols)
        for symbol, info in data.items():
            print(f"{symbol}: ${info.price} ({info.change:+.2f}, {info.change_percent:+.2f}%)")
