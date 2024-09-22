# Solana Token Launchpad

## Overview

Solana Token Launchpad is a web application that allows users to create and deploy custom tokens on the Solana blockchain quickly and easily. Built with React and leveraging the power of Solana's Token Program, this project provides a user-friendly interface for token creation. (Devnet Only)

## Features

- Create custom SPL tokens on Solana
- User-friendly interface with real-time token preview
- Supports token metadata including name, symbol, and image
- Automatic minting of initial token supply
- Integration with Solana wallets for secure transactions
- Responsive design for desktop and mobile devices
- Error handling and validation for a smooth user experience
- Neubrutalism design style
- Sonner toast notifications for user feedback
- Framer Motion animations for enhanced UX

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Bun (latest version)
- Node.js (v14.0.0 or later)
- A Solana wallet (e.g., Phantom, Solflare)

## Installation

To install Solana Token Launchpad, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/vanshavenger/token-lauchpad-pub.git
   ```

2. Navigate to the project directory:
   ```
   cd token-lauchpad-pub
   ```

3. Install dependencies using Bun:
   ```
   bun install
   ```

## Usage

To run Solana Token Launchpad, use the following command:

```
bun run dev
```

This will start the development server. Open your browser and navigate to `http://localhost:5173` to view the application.

## Configuration

The project uses environment variables for configuration. Create a `.env` file in the root directory with the following content:

```
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Adjust the RPC endpoint as needed for your development or production environment. Copy the .env.sample file

## Project Structure

- `src/`: Contains the source code
  - `components/`: React components
  - `App.tsx/`: Next.js pages
  - `index.css/`: CSS styles
  - `lib/utils/`: Utility functions

## Key Components

- `TokenLaunchpad.tsx`: Main component for token creation

## Contributing

Contributions to Solana Token Launchpad are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

Distributed under the MIT License.

## Contact

Your Name - [@Vansh_Avenger](https://x.com/Vansh_Avenger) - vanshchopra101@gmail.com

Project Link: [https://github.com/vanshavenger/token-lauchpad-pub](https://github.com/vanshavenger/token-lauchpad-pub)

## Acknowledgements

- [Solana](https://solana.com/)
- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Bun](https://bun.sh/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Troubleshooting

If you encounter any issues while setting up or running the project, please check the following:

1. Ensure all dependencies are correctly installed
2. Verify that your Solana wallet is connected to the correct network
3. Check the console for any error messages

If problems persist, please open an issue on the GitHub repository.
