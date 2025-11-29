# Custom Indicators & Strategies

A React-based web application for generating random price data and applying customizable technical indicators and trading strategies. Visualize buy/sell signals on interactive charts to engage deeply with financial data analysis.

## Features

- **Random Price Data Generation**: Generate synthetic stock price data with adjustable parameters (number of points, volatility).
- **Built-in Indicators**:
  - Simple Moving Average (SMA)
  - Exponential Moving Average (EMA)
  - Bollinger Bands
- **Custom Indicators**: Create your own indicators using mathematical expressions (e.g., `sma(close, 50)`, `ema(close, 21)`).
- **Trading Strategies**: Define rule-based strategies with buy/sell signals, such as "close crosses above sma(close, 50)".
- **Interactive Chart**: Visualize price data, indicators, and trading signals with color-coded overlays.
- **Responsive UI**: Clean, colorful interface that works on desktop and mobile devices.

## Technologies Used

- **React**: Frontend framework for building the user interface.
- **JavaScript**: Core language for logic and calculations.
- **HTML/CSS**: Markup and styling for the application.
- **Create React App**: Build tool and development server.

## Installation

1. Ensure you have Node.js (version 14 or higher) and npm installed on your system.
2. Clone or download the project repository.
3. Navigate to the project directory: `cd myapp`
4. Install dependencies: `npm install`

## Usage

1. Start the development server: `npm start`
2. Open your browser and navigate to `http://localhost:3000`
3. Adjust data parameters (points, volatility) and regenerate price data.
4. Add built-in indicators (SMA, EMA, Bollinger Bands) or create custom ones using the formula input.
5. Define trading strategies by specifying left expression, operator, and right expression.
6. View the chart with overlays and signals. Use the legend to identify different indicators.

### Example Strategies

- Buy when close crosses above SMA(50): Left: `close`, Operator: `crosses_above`, Right: `sma(close, 50)`
- Sell when close crosses below EMA(20): Left: `close`, Operator: `crosses_below`, Right: `ema(close, 20)`
- Buy when close > Bollinger Upper: Left: `close`, Operator: `>`, Right: `boll_upper(close, 20, 2)`

## Project Structure

```
myapp/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Chart.js      # Chart component for visualization
│   │   └── Controls.js   # UI controls (not used in current implementation)
│   ├── lib/
│   │   ├── indicators.js # Indicator calculation functions
│   │   ├── expr.js       # Expression compiler for custom formulas
│   │   └── strategy.js   # Strategy evaluation logic
│   ├── App.js            # Main application component
│   ├── App.css           # Application styles
│   └── ...
├── package.json
└── README.md
```

## Task Completion Status

The core task of allowing users to add customizable indicators and strategies has been **completed**. Users can:

- ✅ Add built-in indicators (SMA, EMA, Bollinger Bands)
- ✅ Create custom indicators using expressions
- ✅ Define trading strategies with various operators
- ✅ Visualize signals on the chart
- ✅ Engage deeply with data through interactive features


## Contributing

Feel free to fork the repository and submit pull requests for improvements or new features.

